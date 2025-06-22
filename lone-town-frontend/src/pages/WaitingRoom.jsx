import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import socket from '../socket';

export default function WaitingRoom({ user, setMatch }) {
  const [status, setStatus] = useState("⏳ Searching for a mindful match...");
  const navigate = useNavigate();
  const intervalRef = useRef();
  const canvasRef = useRef(null);

  // ✅ Real-time socket listener
  useEffect(() => {
    socket.on("matchFound", (data) => {
      const match = data.match;
      localStorage.setItem('matchId', match._id);
      localStorage.setItem('matchName', match.name);
      setMatch(match);

      alert(`🎯 Match found: ${match.name}`);
      clearInterval(intervalRef.current);
      navigate("/app");
    });

    return () => socket.off("matchFound");
  }, []);

  // ✅ Fallback polling
  useEffect(() => {
    if (!user) return;

    intervalRef.current = setInterval(async () => {
      try {
        const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/match/find-match`, {
          userId: user._id,
        });

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
    }, 30000);

    return () => clearInterval(intervalRef.current);
  }, [user]);

  // 🍃 Cherry blossom animation
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const leaves = [];

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    function createLeaf() {
      return {
        x: Math.random() * canvas.width,
        y: -20,
        size: Math.random() * 20 + 10,
        speedX: Math.random() * 2 - 1,
        speedY: Math.random() * 2 + 1.5,
        rotation: 0,
        rotationSpeed: Math.random() * 0.1,
      };
    }

    for (let i = 0; i < 30; i++) leaves.push(createLeaf());

    function animateLeaves() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(255, 183, 197, 0.8)';
      leaves.forEach((leaf, index) => {
        ctx.save();
        ctx.translate(leaf.x, leaf.y);
        ctx.rotate(leaf.rotation);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(5, -leaf.size / 2, 0, -leaf.size);
        ctx.quadraticCurveTo(-5, -leaf.size / 2, 0, 0);
        ctx.fill();
        ctx.restore();

        leaf.x += leaf.speedX;
        leaf.y += leaf.speedY;
        leaf.rotation += leaf.rotationSpeed;

        if (leaf.y > canvas.height) leaves[index] = createLeaf();
      });

      requestAnimationFrame(animateLeaves);
    }

    animateLeaves();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden text-white bg-gradient-to-br from-gray-900 to-black">
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <div className="mb-4 text-6xl text-pink-400 animate-pulse">💞</div>
        <h2 className="mb-2 text-4xl font-bold drop-shadow-lg">Waiting Room</h2>
        <p className="mb-6 text-gray-300 text-md">
          {status}
        </p>

        <div className="relative w-24 h-24 mb-6">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <g>
              <path
                d="M 50 30 Q 60 20 70 30 Q 80 40 70 50 Q 60 60 50 50 Q 40 60 30 50 Q 20 40 30 30 Q 40 20 50 30"
                fill="rgba(255, 105, 180, 0.8)"
                stroke="rgba(255, 105, 180, 1)"
                strokeWidth="2"
              >
                <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="4s" repeatCount="indefinite" />
                <animate attributeName="fill-opacity" values="0.8;1;0.8" dur="1s" repeatCount="indefinite" />
              </path>
              <path
                d="M 50 35 Q 55 25 60 35 Q 65 45 60 55 Q 55 65 50 55 Q 45 65 40 55 Q 35 45 40 35 Q 45 25 50 35"
                fill="rgba(255, 182, 193, 0.8)"
                stroke="rgba(255, 182, 193, 1)"
                strokeWidth="2"
              >
                <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="-360 50 50" dur="4s" repeatCount="indefinite" />
                <animate attributeName="fill-opacity" values="0.8;1;0.8" dur="1s" repeatCount="indefinite" />
              </path>
            </g>
          </svg>
          <span className="absolute text-xl font-semibold text-white transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 drop-shadow-md">
            Matching...
          </span>
        </div>

        <button
          onClick={() => {
            clearInterval(intervalRef.current);
            navigate("/onboarding");
          }}
          className="px-6 py-3 mt-4 text-white transition-all duration-200 bg-red-600 rounded-lg shadow-md hover:bg-red-700 hover:shadow-red-500/50"
        >
          🛑 Stop Searching
        </button>

        <p className="mt-6 text-sm italic text-gray-400">
          Seeking your soulmate under cherry blossoms...
        </p>
      </div>
    </div>
  );
}
