import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import MainChatPage from './pages/MainChatPage';
import WaitingRoom from './pages/WaitingRoom';
import socket from './socket';
import axios from 'axios';

export default function App() {
  const [user, setUser] = useState(null);
  const [userState, setUserState] = useState('available');
  const [match, setMatch] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    const matchId = localStorage.getItem('matchId');
    const matchName = localStorage.getItem('matchName');

    const fetchUserAndMatch = async () => {
      try {
        if (storedUserId) {
          const res = await axios.get(`/api/user/${storedUserId}`);
          setUser(res.data);
          setUserState(res.data.state || "available");
          socket.emit('join', storedUserId);

          if (matchId && matchName) {
            setMatch({ _id: matchId, name: matchName });
          }
        }
      } catch (err) {
        console.error('❌ Failed to fetch user:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndMatch();
  }, []);

  // ✅ Listen for incoming messages ONCE
  useEffect(() => {
    const handleMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on('receiveMessage', handleMessage);

    return () => {
      socket.off('receiveMessage', handleMessage); // cleanup
    };
  }, []);

  // ✅ Only emit message — do NOT manually add to messages[]
  const sendMessage = () => {
    if (!messageInput.trim() || !user || !match) return;

    socket.emit('sendMessage', {
      matchId: match._id,
      senderId: user._id,
      text: messageInput,
      createdAt: new Date().toISOString(), // if using timestamps
    });

    setMessageInput(''); // clear input only
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={!user ? <Login setUser={setUser} /> : <Navigate to="/onboarding" />}
        />
        <Route
          path="/onboarding"
          element={user ? <Onboarding user={user} setMatch={setMatch} /> : <Navigate to="/login" />}
        />
        <Route
          path="/waiting"
          element={user ? <WaitingRoom user={user} setMatch={setMatch} /> : <Navigate to="/login" />}
        />
        <Route
          path="/app"
          element={
            loading ? (
              <div className="mt-20 text-center text-gray-600">Loading your experience...</div>
            ) : user ? (
              <MainChatPage
                user={user}
                userState={userState}
                match={match}
                messages={messages}
                messageInput={messageInput}
                setMessageInput={setMessageInput}
                setUserState={setUserState}
                sendMessage={sendMessage}
                setMatch={setMatch}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="*" element={<Navigate to={user ? "/app" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  );
}
