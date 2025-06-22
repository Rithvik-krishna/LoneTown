import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import cherry from '../assets/cherry.jpg';

export default function Onboarding({ user, setMatch }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    loveLanguage: '',
    attachmentStyle: '',
    communicationStyle: '',
    emotionalNeeds: '',
    age: '',
    values: '',
    personalityType: '',
    goals: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/onboarding/${user._id}`,
        form
      );
      if (res.status === 200) {
        alert('✅ Onboarding complete!');
        navigate('/waiting');
      } else {
        alert('Something went wrong');
      }
    } catch (err) {
      console.error('❌ Onboarding error:', err);
      alert('Server error');
    }
  };

  return (
    <div
      className="relative flex items-center justify-center min-h-screen px-4 overflow-hidden font-sans text-white bg-fixed bg-center bg-cover"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(30, 30, 30, 0.85), rgba(20, 20, 20, 0.95)), url(${cherry})`,
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-lg p-8 space-y-6 bg-gray-900 border border-pink-400 shadow-2xl bg-opacity-80 rounded-2xl"
        style={{ boxShadow: '0 0 20px rgba(255, 105, 180, 0.4)' }}
      >
        <h2 className="text-3xl font-bold text-center text-pink-300">💖 Enchanting Onboarding</h2>
        <p className="text-sm text-center text-gray-300">
          Unveil your heart’s deepest desires 🌹
        </p>

        {[
          {
            label: '💞 Love Language',
            name: 'loveLanguage',
            type: 'select',
            options: [
              'Words of Affirmation',
              'Acts of Service',
              'Gifts',
              'Quality Time',
              'Physical Touch',
            ],
          },
          { label: '🔐 Attachment Style', name: 'attachmentStyle' },
          { label: '🗣 Communication Style', name: 'communicationStyle' },
          { label: '❤️ Emotional Needs', name: 'emotionalNeeds' },
          { label: '🎂 Age', name: 'age', type: 'number' },
          { label: '🌱 Core Values', name: 'values' },
          { label: '🧠 Personality Type', name: 'personalityType' },
          { label: '🎯 Relationship Goals', name: 'goals' },
        ].map((field) => (
          <div key={field.name}>
            <label className="block mb-1 text-sm font-semibold text-pink-300">
              {field.label}
            </label>
            {field.type === 'select' ? (
              <select
                name={field.name}
                value={form[field.name]}
                onChange={handleChange}
                className="w-full p-3 text-white bg-gray-800 border border-pink-400 rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none"
              >
                <option value="">Select</option>
                {field.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.type || 'text'}
                name={field.name}
                value={form[field.name]}
                onChange={handleChange}
                placeholder={`Enter your ${field.name}`}
                className="w-full p-3 text-white placeholder-gray-400 bg-gray-800 border border-pink-400 rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none"
              />
            )}
          </div>
        ))}

        <button
          type="submit"
          className="w-full py-3 mt-4 text-white transition duration-300 bg-pink-600 shadow-md hover:bg-pink-700 rounded-xl hover:scale-105"
          style={{ boxShadow: '0 0 12px rgba(255, 105, 180, 0.6)' }}
        >
          Begin Your Love Story ➡️
        </button>
      </form>
    </div>
  );
}
