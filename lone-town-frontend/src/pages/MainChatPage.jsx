import React, { useEffect, useState } from 'react';
import MatchCard from '../components/MatchCard';
import ChatBox from '../components/ChatBox';
import MatchFeedback from '../components/MatchFeedback';
import PastMatches from '../components/PastMatches';
import MatchFeedbackDisplay from '../components/MatchFeedbackDisplay';
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

  const stateColors = {
    available: 'bg-blue-100 text-blue-800',
    matched: 'bg-pink-100 text-pink-700',
    pinned: 'bg-[#FFD8D8] text-[#ED3500]',
    frozen: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <div className="min-h-screen px-4 py-6 bg-gray-100 sm:px-6 lg:px-16">
      <h1 className="mb-3 text-3xl font-bold text-center text-[#093FB4]">Lone Town</h1>

      {user && (
        <div className="mb-4 text-center">
          <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${stateColors[userState]}`}>
            {userState.toUpperCase()}
          </span>
          <div className="mt-2 text-sm text-gray-600">
            {userState === 'available' && '🔍 You’re currently searching for a match.'}
            {userState === 'matched' && '💞 A match has been found. You can chat now or pin the match.'}
            {userState === 'pinned' && '📌 You’ve pinned this match. Continue your conversation!'}
            {userState === 'frozen' && '❄️ You’re in a 24-hour reflection freeze. You’ll be rematched soon.'}
          </div>
        </div>
      )}

      {userState === 'frozen' && (
        <div className="p-4 mb-6 text-center bg-yellow-100 rounded shadow-md">
          <h2 className="mb-2 text-lg font-semibold text-yellow-700">🧊 Reflection Mode Active</h2>
          <p className="text-sm text-yellow-800">
            You've unpinned your last match. We're giving you space to reflect intentionally before your next match.
          </p>
          <p className="mt-2 font-bold text-yellow-900">⏳ Time Left: {timeLeft}</p>
        </div>
      )}

      {match ? (
        <>
          <MatchCard match={match} user={user} userState={userState} setUserState={setUserState} />
          <ChatBox
            messages={messages}
            input={messageInput}
            setInput={setMessageInput}
            sendMessage={sendMessage}
            currentUserId={user._id}
          />
          {userState === 'frozen' && <MatchFeedback matchId={match._id} userId={user._id} />}
        </>
      ) : (
        <div className="p-6 mt-8 text-center bg-white border rounded-lg shadow-md">
          <p className="mb-4 text-xl font-semibold text-gray-700">
            ⏳ Looking for someone deeply compatible...
          </p>
          <p className="mb-4 text-gray-500">Our system is searching for the right match for you.</p>
          <button
            onClick={retryMatch}
            disabled={isLoading}
            className="px-6 py-2 text-white bg-[#093FB4] rounded hover:bg-[#072c8e] disabled:opacity-50"
          >
            {isLoading ? 'Searching...' : '🔁 Retry Match Now'}
          </button>
        </div>
      )}

      <div className="mt-10">
        <PastMatches userId={user._id} />
      </div>

      {match?.feedback && <MatchFeedbackDisplay feedback={match.feedback} />}

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
