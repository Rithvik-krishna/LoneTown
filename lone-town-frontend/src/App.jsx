import React, { useEffect, useState } from 'react';
import MatchCard from './components/MatchCard';
import ChatBox from './components/ChatBox';
import socket from './socket';

const userId = prompt("Enter user ID:");
const dummyUser = {
  _id: userId,
  name: userId,
};

export default function App() {
  const [match, setMatch] = useState({
    _id: 'match123',
    name: 'Aarya',
  });

  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');

  useEffect(() => {
    socket.emit('join', dummyUser._id);

    socket.on('receiveMessage', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, []);

  const sendMessage = () => {
    if (!messageInput.trim()) return;

    socket.emit('sendMessage', {
      matchId: match._id,
      senderId: dummyUser._id,
      text: messageInput,
    });

    // Do NOT add to state directly — let socket handle it
    setMessageInput('');
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="mb-6 text-3xl font-bold text-center text-indigo-600">Lone Town</h1>

      <MatchCard match={match} />

      <ChatBox
        messages={messages}
        input={messageInput}
        setInput={setMessageInput}
        sendMessage={sendMessage}
        currentUserId={dummyUser._id} // ✅ added
      />
    </div>
  );
}
