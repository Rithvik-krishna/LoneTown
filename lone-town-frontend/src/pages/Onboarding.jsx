// pages/Onboarding.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/user/onboarding/${user._id}`, form);
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
    <div className="min-h-screen py-10 px-4 bg-[#FFFCFB]">
      <form
        onSubmit={handleSubmit}
        className="max-w-xl p-8 mx-auto space-y-4 bg-white border-2 border-[#FFD8D8] rounded-xl shadow-lg"
      >
        <h2 className="text-3xl font-bold text-center text-[#093FB4] mb-4">
          ✨ Intentional Onboarding
        </h2>

        <div>
          <label className="block font-medium text-gray-700">💖 Love Language</label>
          <select
            name="loveLanguage"
            value={form.loveLanguage}
            onChange={handleChange}
            className="w-full p-2 mt-1 border rounded"
          >
            <option value="">Select</option>
            <option>Words of Affirmation</option>
            <option>Acts of Service</option>
            <option>Gifts</option>
            <option>Quality Time</option>
            <option>Physical Touch</option>
          </select>
        </div>

        <div>
          <label className="block font-medium text-gray-700">🔐 Attachment Style</label>
          <input
            name="attachmentStyle"
            className="w-full p-2 mt-1 border rounded"
            value={form.attachmentStyle}
            onChange={handleChange}
            placeholder="e.g. Secure, Anxious"
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700">🗣 Communication Style</label>
          <input
            name="communicationStyle"
            className="w-full p-2 mt-1 border rounded"
            value={form.communicationStyle}
            onChange={handleChange}
            placeholder="e.g. Direct, Indirect"
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700">❤️ Emotional Needs</label>
          <input
            name="emotionalNeeds"
            className="w-full p-2 mt-1 border rounded"
            value={form.emotionalNeeds}
            onChange={handleChange}
            placeholder="What do you need emotionally?"
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700">🎂 Age</label>
          <input
            name="age"
            type="number"
            className="w-full p-2 mt-1 border rounded"
            value={form.age}
            onChange={handleChange}
            placeholder="e.g. 22"
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700">🌱 Core Values</label>
          <input
            name="values"
            className="w-full p-2 mt-1 border rounded"
            value={form.values}
            onChange={handleChange}
            placeholder="e.g. honesty, growth"
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700">🧠 Personality Type</label>
          <input
            name="personalityType"
            className="w-full p-2 mt-1 border rounded"
            value={form.personalityType}
            onChange={handleChange}
            placeholder="e.g. INFP, ENFJ"
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700">🎯 Relationship Goals</label>
          <input
            name="goals"
            className="w-full p-2 mt-1 border rounded"
            value={form.goals}
            onChange={handleChange}
            placeholder="e.g. Long-term commitment"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 mt-6 text-white bg-[#ED3500] hover:bg-red-600 transition-colors duration-200 rounded"
        >
          Continue ➡️
        </button>
      </form>
    </div>
  );
}
