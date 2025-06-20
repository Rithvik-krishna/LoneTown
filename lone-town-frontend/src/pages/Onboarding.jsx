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
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`/api/user/onboarding/${user._id}`, form);

      const res = await axios.post('/api/match/find-match', { userId: user._id });

      if (res.data?.match) {
        const match = res.data.match;
        localStorage.setItem("matchId", match._id);
        localStorage.setItem("matchName", match.name);
        setMatch(match);
        alert(`✅ Match found: ${match.name}`);
        navigate("/app");
      } else {
        alert("You're in the queue. We'll notify you when matched.");
        navigate("/waiting");
      }
    } catch (err) {
      console.error('❌ Onboarding or Match Error:', err);
      alert('Server error. Try again later.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md p-4 mx-auto">
      <label>Love Language</label>
      <select value={form.loveLanguage} onChange={e => setForm({ ...form, loveLanguage: e.target.value })} className="block w-full p-2 mb-4 border">
        <option value="">Select</option>
        <option value="Words of Affirmation">Words of Affirmation</option>
        <option value="Acts of Service">Acts of Service</option>
        <option value="Gifts">Gifts</option>
        <option value="Quality Time">Quality Time</option>
        <option value="Physical Touch">Physical Touch</option>
      </select>

      <label>Attachment Style</label>
      <input className="block w-full p-2 mb-4 border" value={form.attachmentStyle} onChange={e => setForm({ ...form, attachmentStyle: e.target.value })} />

      <label>Communication Style</label>
      <input className="block w-full p-2 mb-4 border" value={form.communicationStyle} onChange={e => setForm({ ...form, communicationStyle: e.target.value })} />

      <label>Emotional Needs</label>
      <input className="block w-full p-2 mb-4 border" value={form.emotionalNeeds} onChange={e => setForm({ ...form, emotionalNeeds: e.target.value })} />

      <label>Age</label>
      <input className="block w-full p-2 mb-4 border" type="number" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} />

      <button type="submit" className="w-full px-4 py-2 mt-4 text-white bg-indigo-600 rounded">Continue to Chat</button>
    </form>
  );
}
