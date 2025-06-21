// src/socket.js
import { io } from 'socket.io-client';

// Use env or fallback to local
const socket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:5000", {
  transports: ['websocket'],
  withCredentials: true,
});

export default socket;
