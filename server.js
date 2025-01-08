const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const port = process.env.PORT || 5000;

const server = http.createServer(app);
const io = new Server(server);

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("joinRoom", ({ roomId }) => {
        socket.join(roomId);
        console.log(`${socket.id} joined room: ${roomId}`);
    });

    socket.on("privateMessage", ({ roomId, message, senderId }) => {
        console.log(`Message from ${senderId} in ${roomId}: ${message}`);
        // Broadcast to all users except the sender
        socket.to(roomId).emit("privateMessage", { message, senderId });
    });

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
