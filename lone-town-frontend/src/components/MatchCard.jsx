import React, { useState } from "react";
import axios from "axios";

export default function MatchCard({ match, user, userState, setUserState }) {
  const [loading, setLoading] = useState(false);

  const handlePin = async () => {
    try {
      setLoading(true);
      const res = await axios.post('/api/match/pin', {
        userId: user._id,
        matchId: match._id,
      });
      console.log("✅ Pin successful:", res.data);
      setUserState("pinned");
      alert("✅ Match pinned!");
    } catch (err) {
      console.error("❌ Pin failed:", err.message);
      alert("❌ Failed to pin match.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnpin = async () => {
  try {
    console.log("🟡 Trying to unpin for userId:", user._id);

    const res = await axios.post('/api/match/unpin', {
      userId: user._id,  // 🔁 must be correct and defined
    });

    console.log("✅ Unpin successful:", res.data);
    setUserState("frozen");
  } catch (err) {
    console.error("❌ Unpin failed:", err.message);
  }
};


  return (
    <div className="p-4 mb-4 bg-white rounded-lg shadow-md">
      <h2 className="mb-2 text-xl font-bold text-indigo-700">Match: {match.name}</h2>
      <div className="flex gap-4">
        {userState !== "pinned" ? (
          <button
            onClick={handlePin}
            className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600"
            disabled={loading}
          >
            {loading ? "Pinning..." : "Pin Match"}
          </button>
        ) : (
          <button
            onClick={handleUnpin}
            className="px-4 py-2 text-white bg-yellow-500 rounded hover:bg-yellow-600"
            disabled={loading}
          >
            {loading ? "Unpinning..." : "Unpin Match"}
          </button>
        )}
      </div>
    </div>
  );
}
