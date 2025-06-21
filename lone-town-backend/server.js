const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
require("dotenv").config();
const matchRoutes = require('./routes/matchRoutes');
const userRoutes = require('./routes/UserRoutes');
const User = require('./models/User');
const Message = require('./models/Message');

const app = express();
const http = require("http").createServer(app);
const { Server } = require("socket.io");
const matchHistoryRoutes = require('./routes/matchHistoryRoutes');
app.use('/api/match', matchHistoryRoutes);
app.use(cors());
app.use(express.json());

// ✅ Connect DB
connectDB();

// ✅ API Routes
app.use('/api/user', userRoutes);
app.use('/api/match', matchRoutes);

// ✅ Test Route
app.get("/", (req, res) => {
  res.send("Lone Town API Running ✅");
});

// ✅ Socket.io Setup
const io = new Server(http, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// ✅ Single Socket Handler
io.on("connection", (socket) => {
  console.log("✅ New user connected:", socket.id);

  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`🟢 User ${userId} joined room ${userId}`);
  });

  socket.on("sendMessage", async (msg) => {
    try {
      // 💬 Save message to DB
      const newMessage = await Message.create({
        matchId: msg.matchId,
        senderId: msg.senderId,
        text: msg.text,
        createdAt: new Date()
      });

      // 📈 Update analytics
      const user = await User.findById(msg.senderId);
      if (user) {
        user.intentionality.totalMessagesSent += 1;

        if (user.intentionality.lastMessageAt) {
          const now = Date.now();
          const delay = (now - new Date(user.intentionality.lastMessageAt).getTime()) / 1000;
          user.intentionality.averageResponseTime =
            (user.intentionality.averageResponseTime + delay) / 2;
        }

        user.intentionality.lastMessageAt = new Date();
        await user.save();
      }

      // 📡 Emit message to sender and receiver
      socket.emit("receiveMessage", newMessage);
      socket.to(msg.receiverId).emit("receiveMessage", newMessage);
    } catch (err) {
      console.error("❌ Message handling failed:", err.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// 🔁 Auto-Unfreeze Task
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
      user.currentMatch = null;

      // ⏳ Add 2-hour delay before next match
      user.nextMatchEligibleAt = new Date(Date.now() + 2 * 60 * 60 * 1000);

      await user.save();
    }

    if (frozenUsers.length > 0) {
      console.log("⏰ Unfroze", frozenUsers.length, "users");
    }
  } catch (err) {
    console.error("Error unfreezing users:", err.message);
  }
}, 60 * 1000);


// ✅ Start Server
const PORT = process.env.PORT || 5000;
http.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
