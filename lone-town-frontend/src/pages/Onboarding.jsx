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
      const res = await axios.post(`/api/user/onboarding/${user._id}`, form);
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
    <form onSubmit={handleSubmit} className="max-w-lg p-6 mx-auto mt-10 space-y-4 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold text-center text-indigo-600">Intentional Onboarding</h2>

      <label className="block">💖 Love Language</label>
      <select name="loveLanguage" value={form.loveLanguage} onChange={handleChange} className="w-full p-2 border rounded">
        <option value="">Select</option>
        <option>Words of Affirmation</option>
        <option>Acts of Service</option>
        <option>Gifts</option>
        <option>Quality Time</option>
        <option>Physical Touch</option>
      </select>

      <label>🔐 Attachment Style</label>
      <input
        name="attachmentStyle"
        className="w-full p-2 border rounded"
        value={form.attachmentStyle}
        onChange={handleChange}
        placeholder="e.g. Secure, Anxious"
      />

      <label>🗣 Communication Style</label>
      <input
        name="communicationStyle"
        className="w-full p-2 border rounded"
        value={form.communicationStyle}
        onChange={handleChange}
        placeholder="e.g. Direct, Indirect"
      />

      <label>❤️ Emotional Needs</label>
      <input
        name="emotionalNeeds"
        className="w-full p-2 border rounded"
        value={form.emotionalNeeds}
        onChange={handleChange}
        placeholder="What do you need emotionally?"
      />

      <label>🎂 Age</label>
      <input
        name="age"
        type="number"
        className="w-full p-2 border rounded"
        value={form.age}
        onChange={handleChange}
        placeholder="e.g. 22"
      />

      <label>🌱 Core Values</label>
      <input
        name="values"
        className="w-full p-2 border rounded"
        value={form.values}
        onChange={handleChange}
        placeholder="e.g. honesty, growth"
      />

      <label>🧠 Personality Type</label>
      <input
        name="personalityType"
        className="w-full p-2 border rounded"
        value={form.personalityType}
        onChange={handleChange}
        placeholder="e.g. INFP, ENFJ"
      />

      <label>🎯 Relationship Goals</label>
      <input
        name="goals"
        className="w-full p-2 border rounded"
        value={form.goals}
        onChange={handleChange}
        placeholder="e.g. Long-term commitment"
      />

      <button type="submit" className="w-full py-2 mt-4 text-white bg-indigo-600 rounded">
        Continue ➡️
      </button>
    </form>
  );
}
