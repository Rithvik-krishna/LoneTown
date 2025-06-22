import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import Onboarding from './Onboarding';
import WaitingRoom from './WaitingRoom';
import MainChatPage from './MainChatPage';
import LandingPage from './LandingPage';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';
import socket from '../socket';
import axios from 'axios';

export default function MainRouter() {
  const [user, setUser] = useState(null);
  const [userState, setUserState] = useState('available');
  const [match, setMatch] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const isPublicRoute = ['/login', '/signup', '/forgot-password', '/reset-password'].some(path =>
    location.pathname.startsWith(path)
  );

  useEffect(() => {
    if (isPublicRoute) return; // 🔐 Skip protected logic for public routes

    const storedUserId = localStorage.getItem('userId');

    const fetchUserData = async () => {
      try {
        if (!storedUserId) return navigate('/login');

        const { data: userData } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/user/${storedUserId}`);
        setUser(userData);
        setUserState(userData.state || 'available');

        socket.emit('join', storedUserId);

        const { data: matchRes } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/match/verify-current`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        if (matchRes.hasActiveMatch) {
          const currentMatch = {
            _id: matchRes.match._id,
            name: matchRes.match.users.find(u => u._id !== storedUserId)?.name,
            feedback: matchRes.match.feedback,
          };
          setMatch(currentMatch);
          localStorage.setItem('matchId', currentMatch._id);
          localStorage.setItem('matchName', currentMatch.name);

          const { data: chatHistory } = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/chat/messages/${currentMatch._id}`
          );
          setMessages(chatHistory);
        }

        const ob = userData.onboarding || {};
        const isOnboarded = ob.loveLanguage && ob.attachmentStyle && ob.communicationStyle &&
          ob.emotionalNeeds && ob.age && ob.values && ob.personalityType && ob.goals;

        if (!isOnboarded) {
          navigate('/onboarding');
        } else if (matchRes.hasActiveMatch) {
          navigate('/app');
        } else {
          navigate('/waiting');
        }
      } catch (err) {
        console.error('❌ Failed to fetch user or match:', err);
        localStorage.clear();
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate, location.pathname, isPublicRoute]);

  useEffect(() => {
    if (match && user && !isPublicRoute) {
      navigate('/app');
    }
  }, [match, user, navigate, isPublicRoute]);

  useEffect(() => {
    const verifyMatch = async () => {
      if (!user) return;
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/match/verify-current`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (!data.hasActiveMatch && window.location.pathname === '/app') {
          navigate('/waiting');
        }
      } catch (err) {
        console.warn('🔁 Auto-check failed:', err);
      }
    };

    const interval = setInterval(verifyMatch, 30000);
    window.addEventListener('focus', verifyMatch);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', verifyMatch);
    };
  }, [user, navigate]);

  useEffect(() => {
    const handleMessage = (msg) => {
      setMessages(prev => [...prev, msg]);
    };
    socket.on('receiveMessage', handleMessage);
    return () => socket.off('receiveMessage', handleMessage);
  }, []);

  const sendMessage = () => {
    if (!messageInput.trim() || !user || !match) return;
    const msg = {
      matchId: match._id,
      senderId: user._id,
      text: messageInput,
      createdAt: new Date().toISOString(),
    };
    socket.emit('sendMessage', msg);
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
