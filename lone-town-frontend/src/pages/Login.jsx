import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import cherry from '../assets/cherry.jpg';

export default function Login({ setUser }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const petals = Array.from({ length: 30 }).map(() => ({
      x: Math.random() * canvas.width,
      y: -20,
      size: Math.random() * 20 + 10,
      speedX: Math.random() * 1 - 0.5,
      speedY: Math.random() * 2 + 1,
      rotation: 0,
      rotationSpeed: Math.random() * 0.05,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(255, 183, 197, 0.7)';
      petals.forEach((p) => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(5, -p.size / 2, 0, -p.size);
        ctx.quadraticCurveTo(-5, -p.size / 2, 0, 0);
        ctx.fill();
        ctx.restore();

        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;

        if (p.y > canvas.height) {
          p.x = Math.random() * canvas.width;
          p.y = -20;
        }
      });

      requestAnimationFrame(animate);
    };

    animate();
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Utility to check if onboarding is filled
const isOnboardingComplete = (onboarding) => {
  return onboarding &&
    onboarding.loveLanguage &&
    onboarding.attachmentStyle &&
    onboarding.communicationStyle &&
    onboarding.emotionalNeeds &&
    onboarding.age &&
    onboarding.values &&
    onboarding.personalityType &&
    onboarding.goals;
};

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/user/login`, {
      email: form.email,
      password: form.password,
    });

    const user = res.data;
    setUser(user);
    localStorage.setItem('userId', user._id);

    const ob = user.onboarding || {};
    const isOnboarded = ob.loveLanguage && ob.attachmentStyle && ob.communicationStyle &&
      ob.emotionalNeeds && ob.age && ob.values && ob.personalityType && ob.goals;

    if (!isOnboarded) {
      navigate('/onboarding');
    } else if (user.currentMatch) {
      navigate('/app');
    } else {
      navigate('/waiting');
    }

  } catch (err) {
    setError(err.response?.data?.error || 'Login failed');
  }
};




  return (
    <div
      className="relative flex items-center justify-center min-h-screen overflow-hidden text-white bg-black"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.9)), url(${cherry})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 p-6 space-y-4 bg-gray-900 border border-pink-400 rounded shadow bg-opacity-90 w-80"
      >
        <h2 className="text-xl font-bold text-pink-400">Login to Lone Town 🌸</h2>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          required
          className="w-full p-2 text-white bg-gray-800 rounded"
        />
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
          required
          className="w-full p-2 text-white bg-gray-800 rounded"
        />
        <button type="submit" className="w-full p-2 bg-pink-500 rounded hover:bg-pink-600">
          Login
        </button>
        <div className="mt-2 text-sm text-center">
          <span
            onClick={() => navigate('/signup')}
            className="text-pink-400 cursor-pointer hover:underline"
          >
            Don’t have an account? Sign up
          </span>
          <br />
          <span
            onClick={() => navigate('/forgot-password')}
            className="text-pink-400 cursor-pointer hover:underline"
          >
            Forgot Password?
          </span>
        </div>
      </form>
    </div>
  );
}
