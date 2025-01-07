const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const port = process.env.PORT || 5000;

const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());

let clients = {};

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  socket.on("signin", (id) => {
    console.log("User signed in with ID:", id);
    clients[id] = socket;
  });

  socket.on("message", (msg) => {
    console.log("Message received:", msg);

    const targetId = msg.targetId;
    if (clients[targetId]) {
      clients[targetId].emit("message", msg);
    } else {
      console.log("Target ID not connected:", targetId);
    }
  });

  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);
  });
});

app.get("/", (req, res) => {
  res.send("Node.js Chat Server is Running!");
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
