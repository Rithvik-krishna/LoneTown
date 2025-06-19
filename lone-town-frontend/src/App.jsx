import React, { useEffect, useState } from 'react';
import MatchCard from './components/MatchCard';
import ChatBox from './components/ChatBox';
import socket from './socket';
import axios from 'axios'; // ✅ added for fetching user data

const userId = prompt('Enter your User ID');

export default function App() {
  const [user, setUser] = useState(null);
  const [match, setMatch] = useState({
    _id: 'match123',
    name: 'Aarya',
  });
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');

  // ✅ Fetch user info (state, name, etc.)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`/api/user/${userId}`); // Make sure this route exists
        setUser(res.data);
        socket.emit('join', userId);
      } catch (err) {
        console.error('Failed to fetch user:', err.message);

        // fallback for now if backend not ready
        setUser({
          _id: userId,
          name: userId,
          state: 'available', // fallback default state
        });

        socket.emit('join', userId);
      }
    };

    fetchUser();
  }, [userId]);

  // ✅ Listen to incoming messages
  useEffect(() => {
    socket.on('receiveMessage', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, []);

  // ✅ Send message
  const sendMessage = () => {
    if (!messageInput.trim() || !user) return;

    socket.emit('sendMessage', {
      matchId: match._id,
      senderId: user._id,
      text: messageInput,
    });

    setMessageInput('');
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="mb-6 text-3xl font-bold text-center text-indigo-600">Lone Town</h1>

      {/* ✅ Status Banner based on user.state */}
      {user?.state === 'frozen' && (
        <div className="p-3 mb-4 font-semibold text-center bg-yellow-100 rounded">
          You're in a 24-hour reflection period. No new matches right now.
        </div>
      )}

      {user?.state === 'pinned' && (
        <div className="p-3 mb-4 font-semibold text-center bg-green-100 rounded">
          You’ve pinned this match. No new matches will be given.
        </div>
      )}

      <MatchCard match={match} />

      <ChatBox
        messages={messages}
        input={messageInput}
        setInput={setMessageInput}
        sendMessage={sendMessage}
        currentUserId={user?._id}
      />
    </div>
  );
}
