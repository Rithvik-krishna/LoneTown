// App.jsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import MainChatPage from './pages/MainChatPage';
import socket from './socket';
import axios from 'axios';

export default function App() {
  const [user, setUser] = useState(null);
  const [userState, setUserState] = useState('available');
  const [match, setMatch] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('userId');
    if (stored) {
      const fetchUser = async () => {
        try {
          const res = await axios.get(`http://localhost:5000/api/user/${stored}`); // ✅ Full backend URL
          setUser(res.data);
          setUserState(res.data.state || 'available');
          socket.emit('join', stored);

          const matchName = res.data.name.toLowerCase() === 'arya' ? 'laya' : 'arya';
          setMatch({ _id: 'debug-match', name: matchName });
        } catch (err) {
          console.error("User fetch failed:", err);
        }
      };
      fetchUser();
    }
  }, []);

  useEffect(() => {
    socket.on('receiveMessage', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => socket.off('receiveMessage');
  }, []);

  const sendMessage = () => {
    if (!messageInput.trim() || !user || !match) return;

    const newMsg = {
      matchId: match._id,
      senderId: user._id,
      text: messageInput,
    };

    socket.emit('sendMessage', newMsg);
    setMessageInput('');
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to="/onboarding" />} />
        <Route path="/onboarding" element={<Onboarding user={user} setMatch={setMatch} />} />
        <Route path="/app" element={user && match ? (
          <MainChatPage
            user={user}
            userState={userState}
            match={match}
            messages={messages}
            messageInput={messageInput}
            setMessageInput={setMessageInput}
            setUserState={setUserState}
            sendMessage={sendMessage}
          />
        ) : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to={user ? "/app" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  );
}