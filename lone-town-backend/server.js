const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const matchRoutes = require("./routes/matchRoutes");
const userRoutes = require("./routes/UserRoutes");
const matchHistoryRoutes = require("./routes/matchHistoryRoutes");
const chatRoutes = require("./routes/chatRoutes");

const User = require("./models/User");
const Message = require("./models/Message");
const Match = require("./models/Match"); // ✅ Needed for match state
const MatchQueue = require("./models/MatchQueue");

dotenv.config();

// ✅ App & DB
const app = express();
const server = http.createServer(app);
app.use(express.json()); // ✅ Needed to parse JSON bodies!
connectDB();

// ✅ Socket.IO Setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Frontend dev server
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ✅ Socket Middleware: Join match room if user has one
io.use(async (socket, next) => {
  try {
    const userId = socket.handshake.auth.userId;
    if (userId) {
      const user = await User.findById(userId);
      if (user?.currentMatch) {
        socket.join(`match_${user.currentMatch}`);
      }
    }
    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
});

// ✅ Single Socket Connection Handler
io.on("connection", (socket) => {
  const userId = socket.handshake.auth.userId;
  console.log("⚡ [Socket] Connected:", socket.id, "| User:", userId);

  // Join personal room
  if (userId) {
    socket.join(userId);
    console.log(`📥 [Join] User ${userId} joined their personal room`);
  }

  // Request match state
  socket.on("requestMatchState", async () => {
    try {
      const user = await User.findById(userId);
      if (user?.currentMatch) {
        const match = await Match.findById(user.currentMatch);
        socket.emit("matchStateUpdate", { status: "active", match });
      }
    } catch (err) {
      console.error("❌ [Socket] Match state error:", err.message);
    }
  });

  // Cancel match search
  socket.on("cancelSearch", async () => {
    try {
      await MatchQueue.deleteOne({ userId });
      socket.emit("searchCancelled");
      console.log(`🛑 [Socket] Search cancelled for user ${userId}`);
    } catch (err) {
      console.error("❌ [Socket] cancelSearch error:", err.message);
    }
  });

  // Messaging
  socket.on("sendMessage", async ({ matchId, senderId, receiverId, text }) => {
    try {
      const newMessage = await Message.create({
        matchId,
        senderId,
        text,
        createdAt: new Date(),
      });

      // Analytics update
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

      // Emit message
      socket.emit("receiveMessage", newMessage);
      if (receiverId) {
        socket.to(receiverId).emit("receiveMessage", newMessage);
        console.log(`📤 [Socket] Message sent to ${receiverId}`);
      }
    } catch (err) {
      console.error("❌ [Socket] sendMessage error:", err.message);
    }
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log("🛑 [Socket] Disconnected:", socket.id);
  });
});

// ✅ Attach IO to App
app.set("socketio", io);

// ✅ Express Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// ✅ Routes
app.use("/api/user", userRoutes);
app.use("/api/match", matchRoutes);
app.use("/api/match", matchHistoryRoutes);
app.use("/api/chat", chatRoutes);

// ✅ Health Check
app.get("/", (req, res) => {
  res.send("💖 Lone Town API Running");
});

// ✅ Matchmaking Engine
const { startMatchingInterval } = require("./matchMaking/algorithm");
startMatchingInterval(io);

// 🔁 Auto-Unfreeze Cron Job (every 60s)
setInterval(async () => {
  try {
    const now = new Date();
    const frozenUsers = await User.find({
      state: "frozen",
      freezeUntil: { $lte: now },
    });

    const userIds = frozenUsers.map((user) => user._id);
    await MatchQueue.deleteMany({ userId: { $in: userIds } });

    for (const user of frozenUsers) {
      user.state = "available";
      user.freezeUntil = null;
      user.currentMatch = null;
      user.nextMatchEligibleAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
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
