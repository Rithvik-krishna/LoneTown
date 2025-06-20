import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// import matchSound from '../assets/match-found.mp3'; // if using sound

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

          // 🔊 Play sound (optional)
          // new Audio(matchSound).play();

          alert(`🎯 Match found: ${match.name}`);
          clearInterval(intervalRef.current);
          navigate("/app");
        }
      } catch (err) {
        console.error("❌ Match retry failed:", err.message);
      }
    }, 30000);

    return () => clearInterval(intervalRef.current);
  }, [user]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-gradient-to-br from-indigo-50 to-purple-100">
      <div className="mb-4 text-4xl animate-bounce">💞</div>
      <h2 className="mb-2 text-2xl font-bold text-indigo-600">Waiting Room</h2>
      <p className="text-gray-600">{status}</p>

      <button
        onClick={() => {
          clearInterval(intervalRef.current);
          navigate("/onboarding");
        }}
        className="px-4 py-2 mt-6 text-white bg-red-500 rounded hover:bg-red-600"
      >
        🛑 Stop Searching
      </button>
    </div>
  );
}
