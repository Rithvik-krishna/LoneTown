import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import socket from '../socket';

export default function WaitingRoom({ user, setMatch }) {
  const [status, setStatus] = useState("⏳ Searching for a mindful match...");
  const [isCancelling, setIsCancelling] = useState(false);
  const [matchPending, setMatchPending] = useState(false);
  const navigate = useNavigate();
  const intervalRef = useRef();
  const canvasRef = useRef(null);

  // Recovery for interrupted matches
  useEffect(() => {
    const checkPending = async () => {
      const id = localStorage.getItem('pendingMatch');
      if (!id) return;
      try {
        const res = await axios.get(`/api/match/${id}`);
        if (res.data?.users?.includes(user._id)) {
          navigate('/app', { state: { recoveredMatch: true }, replace: true });
        }
      } catch {
        localStorage.removeItem('pendingMatch');
      }
    };
    if (user) checkPending();
  }, [user, navigate]);

  // 🧩 Single, robust socket listener
  useEffect(() => {
    const handler = async (data) => {
      if (!data.confirmed) return;
      setMatchPending(true);
      localStorage.setItem('pendingMatch', data.matchId);

      try {
        const res = await axios.get(`/api/match/verify/${data.matchId}`);
        if (!res.data.valid) throw new Error('invalid');

        const m = res.data.match;
        setMatch(m);
        localStorage.setItem('matchId', m._id);
        localStorage.setItem('matchName', m.name);

        await new Promise(r => setTimeout(r, 300));
        navigate("/app", {
          state: { confirmedMatch: true, matchData: m },
          replace: true
        });
      } catch (err) {
        console.error("Match flow failed:", err);
        setMatchPending(false);
        localStorage.removeItem('pendingMatch');
      }
    };

    socket.on("matchFound", handler);
    return () => socket.off("matchFound", handler);
  }, [navigate, setMatch]);

  // Fallback polling
  useEffect(() => {
    if (!user) return;
    intervalRef.current = setInterval(async () => {
      try {
        const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/match/find-match`, { userId: user._id });
        if (res.data?.match) {
          const m = res.data.match;
          localStorage.setItem('matchId', m._id);
          localStorage.setItem('matchName', m.name);
          setMatch(m);
          clearInterval(intervalRef.current);
          navigate("/app", { state: { confirmedMatch: true, matchData: m }, replace: true });
        }
      } catch (err) {
        console.error("Fallback retry failed:", err);
      }
    }, 30000);

    return () => clearInterval(intervalRef.current);
  }, [user, setMatch, navigate]);

  // Cherry blossom canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let leaves = [];
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();

    const createLeaf = () => ({
      x: Math.random() * canvas.width,
      y: -20,
      size: Math.random() * 20 + 10,
      speedX: Math.random() * 2 - 1,
      speedY: Math.random() * 2 + 1.5,
      rotation: 0,
      rotationSpeed: Math.random() * 0.1,
    });
    leaves = new Array(30).fill().map(createLeaf);

    let animFrame;
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(255,183,197,0.8)';
      leaves.forEach((leaf, i) => {
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

        if (leaf.y > canvas.height) leaves[i] = createLeaf();
      });
      animFrame = requestAnimationFrame(animate);
    }
    animate();

    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden text-white bg-gradient-to-br from-gray-900 to-black">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <div className="mb-4 text-6xl text-pink-400 animate-pulse">💞</div>
        <h2 className="mb-2 text-4xl font-bold drop-shadow-lg">Waiting Room</h2>
        <p className="mb-6 text-gray-300">{status}</p>

        <div className="relative w-24 h-24 mb-6">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            {/* SVG spinner hearts */}
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xl font-semibold drop-shadow-md">
            {matchPending ? 'Almost there…' : 'Matching...'}
          </span>
        </div>

        <button
          onClick={async () => {
            if (!confirm("Stop searching?")) return;
            setIsCancelling(true);
            clearInterval(intervalRef.current);
            try {
              await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/match/cancel-search`, { userId: user._id });
              navigate("/onboarding");
            } catch {
              console.error("Cancel failed");
            } finally {
              setIsCancelling(false);
            }
          }}
          disabled={isCancelling}
          className={`px-6 py-3 mt-4 text-white rounded-lg shadow-md ${
            isCancelling ? "bg-gray-500" : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {isCancelling ? "Cancelling..." : "🛑 Stop Searching"}
        </button>

        <p className="mt-6 text-sm italic text-gray-400">
          Seeking your soulmate under cherry blossoms...
        </p>
      </div>
    </div>
  );
}
