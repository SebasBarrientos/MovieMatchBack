const { Server } = require('socket.io');
const APICall = require('./apiCall.js')
const movieProviders = require ('./movieProviders.js');
const getMovieDetails = require('./movieDetails.js');
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
            ApiIndex: 1,
            chosenMovie: null
            //agregar paginacion aca con un indice de paginacion y cuando llegue el no more movies se vuelve a ejecutar la apical con la paginacion ++
        };

        socket.join(roomId); // Une al creador a la sala
        socket.emit("room-created", { success: true, roomId }); // Confirma al creador que la sala está lista
    });
    socket.on("join-room", (roomId) => {
        if (!rooms[roomId]) {
            socket.emit("error", "La sala no existe.");

            return;
        }

        if (!rooms[roomId].users.includes(socket.id)) {
            rooms[roomId].users.push(socket.id);
        } else {
        }

        socket.join(roomId)
        const room = rooms[roomId]
        socket.emit("room-joined", { success: true, roomId, room })
        io.to(roomId).emit("update-users", rooms[roomId].users)
    })
    socket.on("ready", (roomId) => {

        if (!rooms[roomId]) {
            socket.emit("error", "La sala no existe.");

            return;
        }
        io.to(roomId).emit("users-ready", roomId)
    })

    socket.on("select-categories", async ({ roomId, userId, categories }) => {
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
                
                const apiAnswer = await APICall(selectedCategory, room.ApiIndex)
                const { results } = apiAnswer


                io.to(roomId).emit("category-match", { selectedCategory, results });
            } else {

                io.to(roomId).emit("no-category-match");
            }
        }
    });
    socket.on("vote-movie", async ({ roomId, vote }) => {
        const room = rooms[roomId];

        if (!room) return;
        if (vote === "dislike") {

            // Avanza a la siguiente película
            room.currentIndex++;

            if (room.currentIndex < 20) {
                room.votes = {};
                index = room.currentIndex

                io.to(roomId).emit("next-movie", index);
                return
            } else {
                const selectedCategory = room.selectedCategory
                room.ApiIndex++
                room.votes = {}
                ApiIndex = room.ApiIndex
                room.currentIndex = 0
                const apiAnswer = await APICall(selectedCategory, ApiIndex)
                const { results } = apiAnswer
                io.to(roomId).emit("no-more-movies", { results, index: room.currentIndex });
                return
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




            // delete rooms[roomId]; // Limpia la sala              Mover 
        }
    })
    socket.on("movie-providers", async ({ roomId, movieId }) => {
        const room = rooms[roomId];
        if (!room) return;
        
        const providers = await movieProviders(movieId) 
        if (providers) {
            
            io.to(roomId).emit("movie-providers", {success: true, providers});

        } else {
            
        }
    })

    socket.on("movie-details", async ({ roomId, movieId }) => {
        const room = rooms[roomId];
        if (!room) return;
        
        const movieDetails = await getMovieDetails(movieId) 
        if (movieDetails) {
            
            io.to(roomId).emit("movie-details", {success: true, movieDetails});

        } else {
            
        }
    })




    socket.on("disconnect", () => {

        // Elimina al usuario de las salas en las que estaba
        for (const roomId in rooms) {
            const room = rooms[roomId];
            room.users = room.users.filter((userId) => userId !== socket.id);

            if (room.users.length === 0) {
                delete rooms[roomId]; // Elimina la sala si no quedan usuarios
            } else {
                io.to(roomId).emit("update-users", room.users); // Notifica la actualización de usuarios
            }
        }
    }
)
// socket.disconnect(true)   //Usar solo si quedan trabadas las conecciones

});
