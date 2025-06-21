import React, { useEffect, useState } from 'react';
import MatchCard from '../components/MatchCard';
import ChatBox from '../components/ChatBox';
import MatchFeedback from '../components/MatchFeedback';
import axios from 'axios';

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

  // 🧠 Debug: User analytics
  console.log("🧠 User Intent:", user?.intentionality);

  // 🕒 Timer for frozen state
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
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          setTimeLeft(`${hours}h ${minutes}m left`);
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [userState, user?.freezeUntil]);

  // 🔁 Retry match if not found
  const retryMatch = async () => {
    setIsLoading(true);
    try {
      const res = await axios.post('/api/match/find-match', { userId: user._id });
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

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="mb-6 text-3xl font-bold text-center text-indigo-600">Lone Town</h1>

      {/* ❄️ Frozen State Notice */}
      {userState === 'frozen' && (
        <div className="p-3 mb-4 font-semibold text-center bg-yellow-100 rounded">
          ❄️ You're in a 24-hour reflection period.
          <br />
          ⏳ <span className="font-bold">{timeLeft}</span>
        </div>
      )}

      {/* 📌 Pinned State Notice */}
      {userState === 'pinned' && (
        <div className="p-3 mb-4 font-semibold text-center bg-green-100 rounded">
          📌 You’ve pinned this match.
        </div>
      )}

      {/* 💬 Chat + MatchCard */}
      {match ? (
        <>
          <MatchCard
            match={match}
            user={user}
            userState={userState}
            setUserState={setUserState}
          />
          <ChatBox
            messages={messages}
            input={messageInput}
            setInput={setMessageInput}
            sendMessage={sendMessage}
            currentUserId={user._id}
          />

          {/* 📝 Match Feedback when frozen */}
          {userState === 'frozen' && (
            <MatchFeedback matchId={match._id} userId={user._id} />
          )}
        </>
      ) : (
        // 🧭 Waiting Room
        <div className="p-6 mt-8 text-center bg-white border rounded-lg shadow-md">
          <p className="mb-4 text-xl font-semibold text-gray-700">
            ⏳ Looking for someone deeply compatible...
          </p>
          <p className="mb-4 text-gray-500">Our system is searching for the right match for you.</p>
          <button
            onClick={retryMatch}
            disabled={isLoading}
            className="px-6 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {isLoading ? 'Searching...' : '🔁 Retry Match Now'}
          </button>
        </div>
      )}

      {/* 🔐 Logout */}
      <div className="mt-6 text-center">
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = '/login';
          }}
          className="text-sm text-red-600 underline"
        >
          Logout & Reset
        </button>
      </div>
    </div>
  );
}
