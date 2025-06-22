import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './Login';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';
import WaitingRoom from './pages/WaitingRoom';
import MainChatPage from './pages/MainChatPage';
import LandingPage from './pages/LandingPage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import socket from './socket';
import axios from 'axios';

export default function MainRouter() {
  const [user, setUser] = useState(null);
  const [userState, setUserState] = useState('available');
  const [match, setMatch] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    const matchId = localStorage.getItem('matchId');
    const matchName = localStorage.getItem('matchName');

    const fetchUserAndMatch = async () => {
      try {
        if (storedUserId) {
          const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/user/${storedUserId}`);
          const fetchedUser = res.data;
          setUser(fetchedUser);
          setUserState(fetchedUser.state || 'available');
          socket.emit('join', storedUserId);

          if (matchId && matchName) {
            const currentMatch = { _id: matchId, name: matchName };
            setMatch(currentMatch);

            const chatRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/chat/messages/${matchId}`);
            setMessages(chatRes.data);
          }

          // ✅ Navigation logic
          const ob = fetchedUser.onboarding || {};
          const isOnboarded = ob.loveLanguage && ob.attachmentStyle && ob.communicationStyle &&
            ob.emotionalNeeds && ob.age && ob.values && ob.personalityType && ob.goals;

          if (!isOnboarded) {
            navigate('/onboarding', { replace: true });
          } else if (fetchedUser.currentMatch) {
            navigate('/app', { replace: true });
          } else {
            navigate('/waiting', { replace: true });
          }
        }
      } catch (err) {
        console.error('❌ Failed to fetch user/match:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndMatch();
  }, [navigate]);

  useEffect(() => {
    const handleMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on('receiveMessage', handleMessage);
    return () => socket.off('receiveMessage', handleMessage);
  }, []);

  const sendMessage = () => {
    if (!messageInput.trim() || !user || !match) return;

    const messageObj = {
      matchId: match._id,
      senderId: user._id,
      text: messageInput,
      createdAt: new Date().toISOString(),
    };

    socket.emit('sendMessage', messageObj);
    setMessageInput('');
  };

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to="/" />} />
      <Route path="/signup" element={<Signup setUser={setUser} />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/onboarding" element={user ? <Onboarding user={user} setMatch={setMatch} /> : <Navigate to="/login" />} />
      <Route path="/waiting" element={user ? <WaitingRoom user={user} setMatch={setMatch} /> : <Navigate to="/login" />} />
      <Route
        path="/app"
        element={
          loading ? (
            <div className="mt-20 text-center text-gray-500">Loading your experience...</div>
          ) : user ? (
            <MainChatPage
              user={user}
              userState={userState}
              match={match}
              messages={messages}
              messageInput={messageInput}
              setMessageInput={setMessageInput}
              sendMessage={sendMessage}
              setUserState={setUserState}
              setMatch={setMatch}
            />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
