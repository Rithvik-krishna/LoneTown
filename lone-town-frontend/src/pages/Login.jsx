// src/pages/Login.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login({ setUser }) {
  const [form, setForm] = useState({ name: '', email: '', gender: '' });
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/user/login`, {
        name: form.name,
        email: form.email,
        gender: form.gender,
      });

      setUser(res.data);
      localStorage.setItem('userId', res.data._id);
      navigate('/onboarding');
    } catch (err) {
      console.error('❌ Login error:', err.message);
      setError('Login failed. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#FFFCFB] px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg border border-[#FFD8D8]">
        <h2 className="text-2xl font-bold text-center text-[#093FB4]">Lone Town Login 🌇</h2>
        <p className="text-sm text-center text-gray-600">Let’s start your mindful matchmaking journey</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Your Name"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#093FB4]"
          />
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="Your Email"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#093FB4]"
          />
          <select
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#093FB4]"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="nonbinary">Non-binary</option>
          </select>

          <button
            type="submit"
            className="w-full py-2 font-medium text-white bg-[#093FB4] hover:bg-[#072c84] rounded-md transition duration-200"
          >
            Continue
          </button>
        </form>

        {error && <p className="text-sm text-center text-red-500">{error}</p>}
      </div>
    </div>
  );
}
