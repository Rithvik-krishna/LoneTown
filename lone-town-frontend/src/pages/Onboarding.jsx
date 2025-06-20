import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Onboarding({ user, setMatch }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    age: '',
    loveLanguage: '',
    attachmentStyle: '',
    communicationStyle: '',
    emotionalNeeds: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`/api/user/onboarding/${user._id}`, form);

      if (res.status === 200) {
        alert('✅ Onboarding complete!');

        // TEMP match logic
        const matchName = user.name.toLowerCase() === 'arya' ? 'laya' : 'arya';
        setMatch?.({ _id: 'debug-match', name: matchName });

        navigate('/app');
      } else {
        alert('Something went wrong');
      }
    } catch (err) {
      console.error('Onboarding error:', err);
      alert('Server error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md p-4 mx-auto mt-8 bg-white rounded-lg shadow">
      <h2 className="mb-4 text-2xl font-semibold text-center text-indigo-700">Onboarding</h2>

      <label>Age</label>
      <input
        type="number"
        className="block w-full p-2 mb-4 border rounded"
        value={form.age}
        onChange={e => setForm({ ...form, age: e.target.value })}
        placeholder="Enter your age"
        required
      />

      <label>Love Language</label>
      <select
        value={form.loveLanguage}
        onChange={e => setForm({ ...form, loveLanguage: e.target.value })}
        className="block w-full p-2 mb-4 border rounded"
        required
      >
        <option value="">Select</option>
        <option value="Words of Affirmation">Words of Affirmation</option>
        <option value="Acts of Service">Acts of Service</option>
        <option value="Gifts">Gifts</option>
        <option value="Quality Time">Quality Time</option>
        <option value="Physical Touch">Physical Touch</option>
      </select>

      <label>Attachment Style</label>
      <input
        className="block w-full p-2 mb-4 border rounded"
        value={form.attachmentStyle}
        onChange={e => setForm({ ...form, attachmentStyle: e.target.value })}
        placeholder="e.g. Secure"
        required
      />

      <label>Communication Style</label>
      <input
        className="block w-full p-2 mb-4 border rounded"
        value={form.communicationStyle}
        onChange={e => setForm({ ...form, communicationStyle: e.target.value })}
        placeholder="e.g. Direct"
        required
      />

      <label>Emotional Needs</label>
      <input
        className="block w-full p-2 mb-4 border rounded"
        value={form.emotionalNeeds}
        onChange={e => setForm({ ...form, emotionalNeeds: e.target.value })}
        placeholder="What do you need in a relationship?"
        required
      />

      <button type="submit" className="w-full px-4 py-2 mt-4 text-white bg-indigo-600 rounded hover:bg-indigo-700">
        Continue to Chat
      </button>
    </form>
  );
}
