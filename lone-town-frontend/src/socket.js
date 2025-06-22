import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:5000", {
  transports: ["websocket"],
  withCredentials: true,
  auth: {
    userId: localStorage.getItem("userId"), // adjust based on your app
  },
});

socket.on("connect", () => {
  console.log("✅ Connected to socket:", socket.id);
});

socket.on("searchCancelled", () => {
  console.log("🛑 Match search was cancelled by the server.");
});

export default socket;
