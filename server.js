const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { Client } = require('pg');  // PostgreSQL client for Node.js
const app = express();
const port = process.env.PORT || 5000;

const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());

// PostgreSQL connection setup using environment variable
const client = new Client({
  connectionString: process.env.DATABASE_URL, // Use DATABASE_URL from Railway
  ssl: {
    rejectUnauthorized: false, // Necessary for Railway's SSL connection
  },
});

client.connect(); // Connect to the database

// Route for user registration (Sign Up)
app.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  // Check if the user already exists
  const checkQuery = 'SELECT * FROM users WHERE username = $1';
  const checkResult = await client.query(checkQuery, [username]);

  if (checkResult.rows.length > 0) {
    return res.status(400).json({ message: "Username already taken" });
  }

  // Insert the new user into the database
  const insertQuery = 'INSERT INTO users(username, password) VALUES($1, $2)';
  await client.query(insertQuery, [username, password]);

  res.status(200).json({ message: "User registered successfully" });
});

// Route for user login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // Validate user credentials
  const query = 'SELECT * FROM users WHERE username = $1 AND password = $2';
  const result = await client.query(query, [username, password]);

  if (result.rows.length === 0) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  res.status(200).json({ message: "Login successful" });
});

// Socket.IO functionality for real-time messaging
let clients = {}; // Store connected users and their socket ids

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  // User signing in, associate the username with their socket id
  socket.on("signin", (username) => {
    console.log("User signed in with username:", username);
    clients[username] = socket;
  });

  // Handle sending a message from one user to another
  socket.on("message", (msg) => {
    console.log("Message received:", msg);
    const targetId = msg.targetId;
    if (clients[targetId]) {
      clients[targetId].emit("message", msg); // Send message to target user
    } else {
      console.log("Target ID not connected:", targetId);
    }
  });

  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);
    // Clean up socket on disconnect if necessary
  });
});

app.get("/", (req, res) => {
  res.send("Node.js Chat Server is Running!");
});

// Start the server on the given port
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
