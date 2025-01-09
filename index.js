import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import { dirname } from "path";

const app = express();
const server = createServer(app);
const io = new Server(server);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Static files from public directory
app.use(express.static("public"));

// Track users in rooms
const rooms = {
  room1: new Set(),
  room2: new Set(),
};

// Admin namespace
const admin = io.of("/admin");

admin.on("connection", (socket) => {
  let currentRoom = null;

  socket.on("join", (data) => {
    // Leave previous room if any
    if (currentRoom) {
      socket.leave(currentRoom);
      rooms[currentRoom].delete(socket.id);
      admin.to(currentRoom).emit("user count", rooms[currentRoom].size);
    }

    // Join new room
    currentRoom = data.room;
    socket.join(currentRoom);
    rooms[currentRoom].add(socket.id);

    // Notify room about new user
    admin
      .to(currentRoom)
      .emit("chat message", `New user joined ${currentRoom}`);
    admin.to(currentRoom).emit("user count", rooms[currentRoom].size);
  });

  socket.on("chat message", (data) => {
    // Send message only to the specific room
    admin
      .to(data.room)
      .emit("chat message", `User ${socket.id.slice(0, 4)}: ${data.msg}`);
  });

  socket.on("disconnect", () => {
    if (currentRoom) {
      rooms[currentRoom].delete(socket.id);
      admin
        .to(currentRoom)
        .emit("chat message", `User ${socket.id.slice(0, 4)} disconnected`);
      admin.to(currentRoom).emit("user count", rooms[currentRoom].size);
    }
  });
});

// Routes
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/room1", (req, res) => {
  res.sendFile(__dirname + "/room1.html");
});

app.get("/room2", (req, res) => {
  res.sendFile(__dirname + "/room2.html");
});

// Server listen
server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
