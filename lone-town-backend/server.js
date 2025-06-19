const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
require("dotenv").config();

const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
  cors: { origin: "*" },
});

// Connect to database
connectDB();

app.use(cors());
app.use(express.json());

// Test API
app.get("/", (req, res) => {
  res.send("Lone Town API Running");
});

// --- Socket.io Chat Logic ---
io.on("connection", (socket) => {
  console.log("✅ New user connected:", socket.id);

  // Optional: join room by user ID
  socket.on("join", (userId) => {
    console.log(`🟢 User ${userId} joined`);
    socket.join(userId);
  });

  // Listen for messages
  socket.on("sendMessage", (msg) => {
    console.log("📩 Message received:", msg);

    // Emit message to all users (or use rooms for private logic)
    io.emit("receiveMessage", msg);

    // Optional: emit only to the matched user’s room
    // socket.to(matchPartnerRoomId).emit("receiveMessage", msg);
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// Server listen
const PORT = process.env.PORT || 5000;
http.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
