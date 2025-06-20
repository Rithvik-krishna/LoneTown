// pages/MainChatPage.jsx
import React from 'react';
import MatchCard from '../components/MatchCard';
import ChatBox from '../components/ChatBox';

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
  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="mb-6 text-3xl font-bold text-center text-indigo-600">Lone Town</h1>

      {userState === 'frozen' && (
  <div className="p-3 mb-4 font-semibold text-center bg-yellow-100 rounded">
    You're in a 24-hour reflection period.
  </div>
)}


      {userState === 'pinned' && (
        <div className="p-3 mb-4 font-semibold text-center bg-green-100 rounded">
          You’ve pinned this match.
        </div>
      )}

      <MatchCard match={match} user={user} userState={userState} setUserState={setUserState} />

      <ChatBox
        messages={messages}
        input={messageInput}
        setInput={setMessageInput}
        sendMessage={sendMessage}
        currentUserId={user._id}
      />

      <div className="mt-6 text-center">
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = "/login";
          }}
          className="text-sm text-red-600 underline"
        >
          Logout & Reset
        </button>
      </div>
    </div>
  );
}
