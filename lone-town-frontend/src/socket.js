import { io } from 'socket.io-client';

// 👇 Update this if your backend runs on a different port
const socket = io("http://localhost:5000", {
  transports: ["websocket"],
});

export default socket;
