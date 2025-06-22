import React, { useEffect, useRef, useState } from 'react';
import MatchCard from '../components/MatchCard';
import ChatBox from '../components/ChatBox';
import MatchFeedback from '../components/MatchFeedback';
import PastMatches from '../components/PastMatches';
import MatchFeedbackDisplay from '../components/MatchFeedbackDisplay';
import axios from 'axios';
import cherry from '../assets/cherry.jpg';

export default function MainChatPage({
  user,
  userState,
  setUserState,
  match,
  messages,
  messageInput,
  setMessageInput,
  sendMessage,
  setMatch,
}) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    let interval;
    if (userState === 'frozen' && user?.freezeUntil) {
      interval = setInterval(() => {
        const now = new Date();
        const freezeEnd = new Date(user.freezeUntil);
        const diff = freezeEnd - now;

        if (diff <= 0) {
          setTimeLeft('Ending soon...');
          clearInterval(interval);
        } else {
          const hours = Math.floor(diff / 3600000);
          const minutes = Math.floor((diff % 3600000) / 60000);
          setTimeLeft(`${hours}h ${minutes}m`);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [userState, user?.freezeUntil]);

  const retryMatch = async () => {
    setIsLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/match/find-match`, {
        userId: user._id,
      });
      if (res.data?.match) {
        setMatch(res.data.match);
        localStorage.setItem('matchId', res.data.match._id);
        localStorage.setItem('matchName', res.data.match.name);
      } else {
        alert('Still no match found. Please try again later.');
      }
    } catch (err) {
      console.error('❌ Retry match failed:', err);
      alert('Error while retrying match.');
    } finally {
      setIsLoading(false);
    }
  };

  // 🌸 Blossom Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const petals = [];
    const createPetal = () => ({
      x: Math.random() * canvas.width,
      y: -20,
      size: Math.random() * 20 + 10,
      speedX: Math.random() * 1 - 0.5,
      speedY: Math.random() * 2 + 1,
      rotation: 0,
      rotationSpeed: Math.random() * 0.05,
    });

    for (let i = 0; i < 30; i++) petals.push(createPetal());

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(255, 183, 197, 0.7)';
      petals.forEach((p, i) => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(5, -p.size / 2, 0, -p.size);
        ctx.quadraticCurveTo(-5, -p.size / 2, 0, 0);
        ctx.fill();
        ctx.restore();

        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;

        if (p.y > canvas.height) petals[i] = createPetal();
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const stateColors = {
    available: 'bg-pink-700 text-white',
    matched: 'bg-pink-600 text-white',
    pinned: 'bg-rose-600 text-white',
    frozen: 'bg-yellow-500 text-black',
  };

  return (
    <div
      className="relative flex items-center justify-center min-h-screen px-4 overflow-hidden font-sans text-white bg-fixed bg-center bg-cover"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(10,10,10,0.95), rgba(25,0,20,0.9)), url(${cherry})`,
      }}
    >
      {/* 🌸 Falling Petals Layer */}
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
      />

      <div className="absolute inset-0 bg-black bg-opacity-60"></div>

      <div className="relative z-10 w-full max-w-3xl p-6 space-y-6 bg-gray-900 border border-pink-400 rounded-lg shadow-lg bg-opacity-90">
        <header className="text-center">
          <h1 className="mb-2 text-4xl font-bold text-pink-400">Lone Town 🌸</h1>
          <div className="w-16 h-1 mx-auto bg-pink-500"></div>
        </header>

        {user && (
          <div className="text-center">
            <span
              className={`inline-block px-3 py-1 text-sm font-medium rounded ${stateColors[userState]} transition-all duration-300 shadow-md`}
            >
              {userState.toUpperCase()}
            </span>
            <p className="mt-2 text-sm text-gray-300">
              {userState === 'available' && '🔍 Searching for your cherry blossom match.'}
              {userState === 'matched' && '💞 Connected with your match. Chat or pin now.'}
              {userState === 'pinned' && '📌 Enjoying your pinned match under the blossoms.'}
              {userState === 'frozen' && '❄️ Reflecting in a 24-hour freeze. Next match soon.'}
            </p>
          </div>
        )}

        {userState === 'frozen' && (
          <div className="p-4 bg-yellow-200 border border-yellow-500 rounded-lg shadow-sm bg-opacity-20">
            <h2 className="mb-2 text-lg font-semibold text-yellow-400">🧊 Reflection Mode</h2>
            <p className="text-sm text-yellow-300">
              You’ve unpinned your last match. Reflect under the cherry blossoms.
            </p>
            <p className="mt-2 font-medium text-yellow-200">⏳ Time Left: {timeLeft}</p>
          </div>
        )}

        {match ? (
          <>
            <MatchCard match={match} user={user} userState={userState} setUserState={setUserState} />
            <div className="p-4 bg-gray-800 rounded-lg shadow-md">
              <ChatBox
                messages={messages}
                input={messageInput}
                setInput={setMessageInput}
                sendMessage={sendMessage}
                currentUserId={user._id}
              />
            </div>
            {userState === 'frozen' && (
              <div className="p-4 bg-gray-800 rounded-lg shadow-md">
                <MatchFeedback matchId={match._id} userId={user._id} />
              </div>
            )}
          </>
        ) : (
          <div className="p-6 text-center bg-gray-800 border border-pink-300 rounded-lg shadow-md">
            <p className="mb-4 text-lg font-medium text-gray-200">
              ⏳ Blossoming a match for you...
            </p>
            <p className="mb-4 text-gray-400">
              Our system is finding your perfect cherry blossom connection.
            </p>
            <button
              onClick={retryMatch}
              disabled={isLoading}
              className="px-6 py-2 text-white transition-all duration-200 bg-pink-500 rounded hover:bg-pink-600 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2 animate-spin" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" fill="none" stroke="white" strokeWidth="3" />
                    <path fill="none" stroke="white" strokeWidth="3" d="M 12 2 A 10 10 0 0 1 21 12" />
                  </svg>
                  Searching...
                </span>
              ) : (
                '🔁 Find Match Now'
              )}
            </button>
          </div>
        )}

        <div className="p-4 bg-gray-800 rounded-lg shadow-md">
          <PastMatches userId={user._id} />
        </div>

        {match?.feedback && (
          <div className="p-4 mt-6 bg-gray-800 rounded-lg shadow-md">
            <MatchFeedbackDisplay feedback={match.feedback} />
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = '/login';
            }}
            className="text-sm text-red-300 underline transition-colors duration-200 hover:text-red-400"
          >
            Logout & Reset
          </button>
        </div>
      </div>
    </div>
  );
}
