// components/MatchCard.jsx
import React from 'react';
import axios from 'axios';

export default function MatchCard({ match, user, userState, setUserState }) {
  const handlePin = async () => {
    try {
      await axios.post('/api/match/pin', {
        userId: user._id,
        matchId: match._id,
      });
      setUserState("pinned");
    } catch (err) {
      console.error("❌ Pin failed:", err.message);
    }
  };

  const handleUnpin = async () => {
    try {
      await axios.post('/api/match/unpin', {
        userId: user._id,
        matchId: match._id,
      });
      setUserState("frozen");
    } catch (err) {
      console.error("❌ Unpin failed:", err.message);
    }
  };

  return (
    <div className="p-4 mb-4 bg-white rounded-lg shadow-md">
      <h2 className="mb-1 text-xl font-bold text-indigo-700">💘 Match: {match.name}</h2>

      {/* 🧠 Compatibility Score Display */}
      {match.compatibilityScore !== undefined && (
        <p className="mb-2 text-sm text-gray-600">
          Compatibility Score: <span className="font-semibold">{match.compatibilityScore}/10</span>
        </p>
      )}

      <div className="flex gap-4">
        {userState !== "pinned" ? (
          <button
            onClick={handlePin}
            className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600"
          >
            📌 Pin Match
          </button>
        ) : (
          <button
            onClick={handleUnpin}
            className="px-4 py-2 text-white bg-yellow-500 rounded hover:bg-yellow-600"
          >
            ❌ Unpin Match
          </button>
        )}
      </div>
    </div>
  );
}
