import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import cherry from '../assets/cherry.jpg';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/user/forgot-password`, { email });
      setMessage(res.data.message || '📬 If your email is registered, a reset link has been sent.');
    } catch (err) {
      console.error('❌ Password reset error:', err);
      setError('Something went wrong. Please try again later.');
    }
  };

  return (
    <div
      className="relative flex items-center justify-center min-h-screen px-4 font-sans bg-fixed bg-center bg-cover"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(30, 30, 30, 0.8), rgba(10, 0, 30, 0.85)), url(${cherry})`,
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>

      <form
        onSubmit={handleReset}
        className="relative z-10 w-full max-w-md p-6 space-y-6 text-white bg-gray-900 border border-pink-400 shadow-lg bg-opacity-90 rounded-xl"
      >
        <h2 className="text-2xl font-bold text-center text-pink-300">Forgot Password?</h2>
        <p className="text-sm text-center text-gray-400">We’ll send you a reset link if your email exists.</p>

        <input
          type="email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your registered email"
          className="w-full px-4 py-2 text-white placeholder-gray-400 bg-gray-800 border border-pink-600 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400"
        />

        <button
          type="submit"
          className="w-full py-2 text-white transition duration-200 bg-pink-600 rounded-md hover:bg-pink-700"
        >
          Send Reset Link
        </button>

        {message && <p className="text-sm text-center text-green-400">{message}</p>}
        {error && <p className="text-sm text-center text-red-400">{error}</p>}

        <div className="text-sm text-center text-gray-400">
          <Link to="/login" className="text-pink-400 hover:underline">Back to Login</Link>
        </div>
      </form>
    </div>
  );
}
