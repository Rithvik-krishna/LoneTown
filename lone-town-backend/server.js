const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
require("dotenv").config();
const matchRoutes = require('./routes/matchRoutes');
const userRoutes = require('./routes/UserRoutes');
const User = require('./models/User');

const app = express();
const http = require("http").createServer(app);
const { Server } = require("socket.io");

// ✅ Middlewares — MOVE THESE TO THE TOP
app.use(cors());
app.use(express.json());

// ✅ Connect DB
connectDB();

// ✅ Load routes AFTER middleware
app.use('/api/user', userRoutes);  
app.use('/api/match', matchRoutes);

app.get("/", (req, res) => {
  res.send("Lone Town API Running ✅");
});

// ✅ Socket setup
const io = new Server(http, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("✅ New user connected:", socket.id);

  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`🟢 User ${userId} joined room ${userId}`);
  });

  socket.on("sendMessage", (msg) => {
    console.log("📩 Message received:", msg);
    io.emit("receiveMessage", msg);
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// 🔁 Auto-unfreeze users every 1 minute
setInterval(async () => {
  const now = new Date();

  try {
    const frozenUsers = await User.find({
      state: "frozen",
      freezeUntil: { $lte: now },
    });

    for (const user of frozenUsers) {
      user.state = "available";
      user.freezeUntil = null;
      await user.save();
    }

    if (frozenUsers.length > 0) {
      console.log("⏰ Unfroze", frozenUsers.length, "users");
    }
  } catch (err) {
    console.error("Error unfreezing users:", err.message);
  }
}, 60 * 1000);

// ✅ Start the server
const PORT = process.env.PORT || 5000;
http.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
