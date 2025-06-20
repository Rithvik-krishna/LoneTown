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
    // Step 1: Submit onboarding form
    const onboardingRes = await axios.post(`/api/user/onboarding/${user._id}`, form);

    if (onboardingRes.status === 200) {
      alert('✅ Onboarding complete!');

      // Step 2: Attempt to find a match
      const matchRes = await axios.post('/api/match/find-match', {
        userId: user._id,
      });

      if (matchRes.data.match) {
        localStorage.setItem('match', JSON.stringify(matchRes.data.match)); // optional
        alert(`✅ Match found with ${matchRes.data.match.name}`);
        // Navigate to chat page (assuming App.jsx sets match from backend again)
        navigate('/app');
      } else {
        alert('⚠️ No match found yet. Try again later.');
        navigate('/app'); // you can still take them to the chat screen
      }
    } else {
      alert('Something went wrong during onboarding.');
    }
  } catch (err) {
    console.error('❌ Onboarding or Match Error:', err);
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
