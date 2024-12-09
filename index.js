const express = require('express');
const { createServer } = require('node:http');
const { Server } = require('socket.io');
const app = express();
const server = createServer(app);
const APICall = require('./apiCall.js')

require("dotenv").config();
const { PORT } = process.env;


const io = new Server(PORT, {
    cors: {
        origin: "http://localhost:3001", // Reemplaza con la URL de tu frontend
        methods: ["GET", "POST"],
    },
});

const rooms = {};

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
        socket.emit("room-created", { success: true, roomId }); // Confirma al creador que la sala está lista
    });
    socket.on("join-room", (roomId) => {
        if (!rooms[roomId]) {
            socket.emit("error", "La sala no existe.");
            
            return;
        }

        if (!rooms[roomId].users.includes(socket.id)) {
            rooms[roomId].users.push(socket.id);
            console.log(`Usuario ${socket.id} se unió a la sala ${roomId}`);
        } else {
            console.log(`Usuario ${socket.id} ya está en la sala ${roomId}`);
        }
        console.log(rooms[roomId].users);

        socket.join(roomId)
        console.log(`Usuario ${socket.id} se unió a la sala ${roomId}`)
        socket.emit("room-joined", { success: true, roomId })
        io.to(roomId).emit("update-users", rooms[roomId].users) //ver como hago esto en el front
    })




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
                APICall(selectedCategory)
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
    socket.on("disconnect", () => {
        console.log(`Usuario desconectado: ${socket.id}`);

        // Elimina al usuario de las salas en las que estaba
        for (const roomId in rooms) {
            const room = rooms[roomId];
            room.users = room.users.filter((userId) => userId !== socket.id);

            if (room.users.length === 0) {
                delete rooms[roomId]; // Elimina la sala si no quedan usuarios
                console.log(`Sala eliminada: ${roomId}`);
            } else {
                io.to(roomId).emit("update-users", room.users); // Notifica la actualización de usuarios
            }
        }
    });
});
