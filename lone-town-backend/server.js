const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const matchRoutes = require("./routes/matchRoutes");
const userRoutes = require("./routes/UserRoutes");
const matchHistoryRoutes = require("./routes/matchHistoryRoutes");
const chatRoutes = require('./routes/chatRoutes');
const User = require("./models/User");
const Message = require("./models/Message");

dotenv.config();

const app = express();
const server = http.createServer(app);

// ✅ Connect to MongoDB
connectDB();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ API Routes
app.use("/api/user", userRoutes);
app.use("/api/match", matchRoutes);
app.use("/api/match", matchHistoryRoutes);
app.use("/api/chat", chatRoutes);

// ✅ Health Check
app.get("/", (req, res) => {
  res.send("💖 Lone Town API Running");
});

// ✅ Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.set("socketio", io);

// ✅ Socket.IO Events
io.on("connection", (socket) => {
  console.log("⚡ [Socket] Connected:", socket.id);

  socket.on("join", (userId) => {
    if (userId) {
      socket.join(userId);
      console.log(`📥 [Join] User ${userId} joined their personal room`);
    }
  });

  socket.on("sendMessage", async (msg) => {
    try {
      const { matchId, senderId, receiverId, text } = msg;

      // Save message in DB
      const newMessage = await Message.create({
        matchId,
        senderId,
        text,
        createdAt: new Date(),
      });

      // ✅ Intentionality Analytics Update
      const user = await User.findById(senderId);
      if (user) {
        const now = Date.now();
        const last = new Date(user.intentionality.lastMessageAt).getTime() || now;
        const delay = (now - last) / 1000;

        user.intentionality.totalMessagesSent += 1;
        user.intentionality.averageResponseTime =
          (user.intentionality.averageResponseTime + delay) / 2;
        user.intentionality.lastMessageAt = new Date();

        await user.save();
      }

      // ✅ Emit message to both sender and receiver
      socket.emit("receiveMessage", newMessage);
      if (receiverId) {
        socket.to(receiverId).emit("receiveMessage", newMessage);
        console.log(`📤 [Socket] Message sent to ${receiverId}`);
      }

    } catch (err) {
      console.error("❌ [Socket] sendMessage error:", err.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("🛑 [Socket] Disconnected:", socket.id);
  });
});

// 🔁 Auto-Unfreeze Cron Job (Runs every 60 seconds)
setInterval(async () => {
  try {
    const now = new Date();
    const frozenUsers = await User.find({
      state: "frozen",
      freezeUntil: { $lte: now },
    });

    for (const user of frozenUsers) {
      user.state = "available";
      user.freezeUntil = null;
      user.currentMatch = null;
      user.nextMatchEligibleAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // +2 hrs
      await user.save();
    }

    if (frozenUsers.length > 0) {
      console.log(`⏰ Unfroze ${frozenUsers.length} user(s)`);
    }
  } catch (err) {
    console.error("❌ Unfreeze Cron Failed:", err.message);
  }
}, 60 * 1000);

// ✅ Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Lone Town Server running → http://localhost:${PORT}`);
});
