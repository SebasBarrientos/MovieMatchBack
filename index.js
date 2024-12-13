const { Server } = require('socket.io');
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
            users: [socket.id],
            categorySelections: {},
            votes: {},
            currentIndex: 0,
            //agregar paginacion aca con un indice de paginacion y cuando llegue el no more movies se vuelve a ejecutar la apical con la paginacion ++
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
        const room = rooms[roomId]
        socket.emit("room-joined", { success: true, roomId, room })
        io.to(roomId).emit("update-users", rooms[roomId].users)
    })
    socket.on("ready", (roomId) => {
        console.log(roomId);

        if (!rooms[roomId]) {
            socket.emit("error", "La sala no existe.");

            return;
        }
        io.to(roomId).emit("users-ready", roomId)
    })

    socket.on("select-categories", async ({ roomId, userId, categories }) => {
        console.log("room", roomId);
        console.log("usuario", userId);
        console.log("categorias", categories);

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

                const apiAnswer = await APICall(selectedCategory)
                const { results } = apiAnswer


                io.to(roomId).emit("category-match", { selectedCategory, results });
            } else {

                io.to(roomId).emit("no-category-match");
            }
        }
    });
    socket.on("vote-movie", ({ roomId, vote }) => {
        const room = rooms[roomId];
        if (!room) return;
        console.log("HOOLAAAAAAAAA", vote);
        if (vote === "dislike") {

            // Avanza a la siguiente película
            room.currentIndex++;
            console.log(room.currentIndex);
            
            if (room.currentIndex < 20) {
                room.votes = {};
                index = room.currentIndex
                console.log("Se envia");
                
                io.to(roomId).emit("next-movie", index);
                return
            } else {
                io.to(roomId).emit("no-more-movies");
                room.currentIndex = 0
            }
        }
        // Registra el voto
        room.votes[socket.id] = vote;

        if (Object.keys(room.votes).length === room.users.length) {
            // const allVotes = Object.values(room.votes);

            // if (allVotes.every((v) => v === "like")) {
            //     // Match encontrado
            index = room.currentIndex

            io.to(roomId).emit("match-found", index);
            delete rooms[roomId]; // Limpia la sala
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
