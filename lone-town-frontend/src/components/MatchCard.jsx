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
    <div className="p-4 mb-4 bg-white rounded-lg shadow border border-[#FFD8D8]">
      <h2 className="mb-2 text-xl font-bold text-[#ED3500]">💘 Match: {match.name}</h2>
      {match.compatibilityScore !== undefined && (
        <p className="mb-3 text-sm text-gray-600">
          Compatibility Score: <span className="font-semibold">{match.compatibilityScore}/10</span>
        </p>
      )}

      {userState !== "pinned" ? (
        <button
          onClick={handlePin}
          className="px-4 py-2 text-white bg-[#093FB4] hover:bg-blue-800 rounded"
        >
          Pin Match
        </button>
      ) : (
        <button
          onClick={handleUnpin}
          className="px-4 py-2 text-white bg-[#ED3500] hover:bg-red-700 rounded"
        >
          Unpin Match
        </button>
      )}
    </div>
  );
}
