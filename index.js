const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);

const io = new Server(3000, {
    cors: {
        origin: "http://localhost:3000", // Reemplaza con la URL de tu frontend
        methods: ["GET", "POST"],
    },
});

const rooms = {}; // Almacenará las salas en memoria

app.get('/', (req, res) => {
    res.send('<h1>Hello world</h1>');
});
io.on("connection", (socket) => {
    console.log("Nuevo cliente conectado:", socket.id);

    // Crear una sala
    socket.on("create-room", (roomId) => {
        if (rooms[roomId]) {
            socket.emit("error", "La sala ya existe.");
            return;
        }

        rooms[roomId] = {
            users: [socket.id], // Almacena los usuarios de la sala
            categorySelections: {}, // Almacena las categorías seleccionadas por usuario
            votes: {}, // Almacena los votos por película
            currentIndex: 0, // Índice de la película actual
            movies: [], // Listado de películas para la sala
        };

        socket.join(roomId); // Une al creador a la sala
        console.log(`Sala creada: ${roomId}`);
        socket.emit("room-created", roomId); // Confirma al creador que la sala está lista
    });





    socket.on("select-categories", ({ roomId, userId, categories }) => {
        const room = rooms[roomId];
        if (!room) return;

        room.categorySelections[userId] = categories;

        // Verifica si todos han enviado sus selecciones
        if (Object.keys(room.categorySelections).length === room.users.length) {
            // Encuentra las categorías comunes
            const allSelections = Object.values(room.categorySelections).flat();
            const categoryCount = allSelections.reduce((acc, category) => {
                acc[category] = (acc[category] || 0) + 1;
                return acc;
            }, {});

            const commonCategories = Object.entries(categoryCount)
                .filter(([_, count]) => count === room.users.length)
                .map(([category]) => category);

            if (commonCategories.length > 0) {
                const selectedCategory = commonCategories[0]; // Elige la primera categoría común
                room.selectedCategory = selectedCategory;
                io.to(roomId).emit("category-match", selectedCategory);
            } else {
                io.to(roomId).emit("no-category-match");
            }
        }
    });
    socket.on("vote-movie", ({ roomId, vote }) => {
        const room = rooms[roomId];
        if (!room) return;

        // Registra el voto
        room.votes[socket.id] = vote;

        // Verifica si todos han votado
        if (Object.keys(room.votes).length === room.users.length) {
            const allVotes = Object.values(room.votes);

            if (allVotes.every((v) => v === "like")) {
                // Match encontrado
                const matchedMovie = room.movies[room.currentIndex];
                io.to(roomId).emit("match-found", matchedMovie);
                delete rooms[roomId]; // Limpia la sala
            } else {
                // Avanza a la siguiente película
                room.currentIndex++;
                if (room.currentIndex < room.movies.length) {
                    room.votes = {}; // Resetea los votos
                    const nextMovie = room.movies[room.currentIndex];
                    io.to(roomId).emit("next-movie", nextMovie);
                } else {
                    io.to(roomId).emit("no-more-movies");
                }
            }
        }
    })
    socket.on("create-room", (roomId) => {
        socket.join(roomId); // El cliente se une a la sala.
        console.log(`Sala ${roomId} creada y usuario conectado.`);
    });
    socket.on("join-room", (roomId) => {
        socket.join(roomId);
        console.log(`Usuario se unió a la sala ${roomId}`);
    });
});
server.listen(3000, () => {
    console.log('listening on *:3000');
});