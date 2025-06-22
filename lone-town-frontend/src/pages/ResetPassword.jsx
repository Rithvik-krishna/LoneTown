import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/user/reset-password/${token}`, { password });
      setMessage('Password reset successful!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setMessage('Failed to reset password.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen text-white bg-black">
      <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-gray-900 rounded shadow w-80">
        <h2 className="text-xl font-bold text-pink-400">Reset Password</h2>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New Password" required className="w-full p-2 text-white bg-gray-800 rounded"/>
        <button type="submit" className="w-full p-2 bg-pink-500 rounded hover:bg-pink-600">Set Password</button>
        {message && <p className="mt-2 text-sm text-center">{message}</p>}
      </form>
    </div>
  );
}
