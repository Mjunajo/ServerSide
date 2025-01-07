const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors"); // Importing CORS

const app = express();
const port = process.env.PORT || 5000;

app.use(cors()); // Enable CORS globally
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow connections from any origin
        methods: ["GET", "POST"]
    }
});

let clients = {};

io.on("connection", (socket) => {
    console.log("✅ New connection:", socket.id);

    socket.on("signin", (id) => {
        console.log("User signed in with ID:", id);
        clients[id] = socket;
    });

    socket.on("message", (msg) => {
        console.log("📩 Message received:", msg);
        const targetId = msg.targetId;
        if (clients[targetId]) {
            clients[targetId].emit("message", msg);
        } else {
            console.log("❌ Target ID not connected:", targetId);
        }
    });

    socket.on("disconnect", () => {
        console.log("❌ Disconnected:", socket.id);
        // Remove disconnected client
        for (const id in clients) {
            if (clients[id] === socket) {
                delete clients[id];
            }
        }
    });
});

app.get("/", (req, res) => {
    res.send("✅ Node.js Chat Server is Running!");
});

server.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
});
