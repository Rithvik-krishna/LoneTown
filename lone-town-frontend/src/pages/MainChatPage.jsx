// pages/MainChatPage.jsx
import React, { useEffect, useState } from 'react';
import MatchCard from '../components/MatchCard';
import ChatBox from '../components/ChatBox';
import MatchFeedback from '../components/MatchFeedback';

export default function MainChatPage({
  user,
  userState,
  setUserState,
  match,
  messages,
  messageInput,
  setMessageInput,
  sendMessage,
}) {
  const [timeLeft, setTimeLeft] = useState('');
  const [feedbackGiven, setFeedbackGiven] = useState(false);

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

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="mb-6 text-3xl font-bold text-center text-indigo-600">Lone Town</h1>

      {userState === 'frozen' && (
        <div className="p-3 mb-4 font-semibold text-center bg-yellow-100 rounded">
          ❄️ You're in a 24-hour reflection period.<br />
          ⏳ <span className="font-bold">{timeLeft}</span>
        </div>
      )}

      {userState === 'pinned' && (
        <div className="p-3 mb-4 font-semibold text-center bg-green-100 rounded">
          📌 You’ve pinned this match.
        </div>
      )}

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

      {!feedbackGiven &&
        (userState === 'frozen' || messages.length >= 100) && (
          <MatchFeedback
            userId={user._id}
            matchId={match._id}
            onSubmit={() => setFeedbackGiven(true)}
          />
        )}

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
