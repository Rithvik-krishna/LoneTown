// pages/WaitingRoom.jsx
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function WaitingRoom({ user, setMatch }) {
  const [status, setStatus] = useState("⏳ Searching for a mindful match...");
  const navigate = useNavigate();
  const intervalRef = useRef();

  useEffect(() => {
    if (!user) return;

    intervalRef.current = setInterval(async () => {
      try {
        const res = await axios.post("/api/match/find-match", { userId: user._id });

        if (res.data?.match) {
          const match = res.data.match;
          localStorage.setItem('matchId', match._id);
          localStorage.setItem('matchName', match.name);
          setMatch(match);

          alert(`🎯 Match found: ${match.name}`);
          clearInterval(intervalRef.current);
          navigate("/app");
        }
      } catch (err) {
        console.error("❌ Match retry failed:", err.message);
      }
    }, 30000); // check every 30 seconds

    return () => clearInterval(intervalRef.current);
  }, [user]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center bg-[#FFFCFB]">
      <div className="text-6xl mb-6 animate-bounce text-[#ED3500]">💞</div>
      <h2 className="text-3xl font-bold text-[#093FB4] mb-2">Waiting Room</h2>
      <p className="mb-6 text-gray-700">{status}</p>

      <button
        onClick={() => {
          clearInterval(intervalRef.current);
          navigate("/onboarding");
        }}
        className="px-6 py-2 mt-4 text-white bg-[#ED3500] hover:bg-red-600 rounded transition"
      >
        🛑 Stop Searching
      </button>

      <p className="mt-10 text-sm text-[#888] italic">
        Looking for someone deeply compatible based on your values...
      </p>
    </div>
  );
}
