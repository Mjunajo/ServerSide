const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const port = process.env.PORT || 5000;

const server = http.createServer(app);
const io = new Server(server);

let clients = {};

io.on("connection", (socket) => {
    console.log("New connection:", socket.id);

    socket.on("signin", (id) => {
        clients[id] = socket;
        console.log(`${id} signed in.`);
    });

    socket.on("joinRoom", ({ roomId }) => {
        socket.join(roomId);
        console.log(`${socket.id} joined room: ${roomId}`);
    });

    socket.on("privateMessage", ({ roomId, message }) => {
        console.log(`Message in ${roomId}: ${message}`);
        io.to(roomId).emit("privateMessage", { message });
    });

    socket.on("disconnect", () => {
        for (const [id, clientSocket] of Object.entries(clients)) {
            if (clientSocket.id === socket.id) {
                delete clients[id];
                break;
            }
        }
        console.log(`User disconnected: ${socket.id}`);
    });
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
