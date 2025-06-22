import React from 'react';
import axios from 'axios';

export default function MatchCard({ match, user, userState, setUserState }) {
  const handlePin = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/match/pin`, {
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
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/match/unpin`, {
        userId: user._id,
        matchId: match._id,
      });
      setUserState("frozen");
    } catch (err) {
      console.error("❌ Unpin failed:", err.message);
    }
  };

  return (
    <div className="p-4 mb-4 bg-[#1a1a1a] rounded-lg shadow border border-pink-900/40">
      <h2 className="mb-2 text-xl font-bold text-pink-400">💘 Match: {match.name}</h2>
      {match.compatibilityScore !== undefined && (
        <p className="mb-3 text-sm text-pink-200">
          Compatibility Score: <span className="font-semibold">{match.compatibilityScore}/10</span>
        </p>
      )}

      {userState !== "pinned" ? (
        <button
          onClick={handlePin}
          className="px-4 py-2 text-white bg-pink-600 rounded hover:bg-pink-700"
        >
          Pin Match
        </button>
      ) : (
        <button
          onClick={handleUnpin}
          className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700"
        >
          Unpin Match
        </button>
      )}
    </div>
  );
}
