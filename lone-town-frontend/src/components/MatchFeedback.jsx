import React, { useState } from 'react';
import axios from 'axios';

export default function MatchFeedback({ userId, matchId, onSubmit }) {
  const [rating, setRating] = useState('');
  const [comment, setComment] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!matchId || matchId === 'debug-match') {
      console.warn("⚠️ Skipping feedback submission for mock match");
      onSubmit(); return;
    }

    try {
      await axios.post('/api/match/feedback', {
        userId,
        matchId,
        rating,
        comment,
      });
      alert('✅ Feedback submitted!');
      onSubmit();
    } catch (err) {
      console.error('❌ Feedback submission failed:', err);
      alert('Submission failed.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md p-4 mx-auto mt-6 bg-[#FFFCFB] border rounded shadow">
      <h2 className="mb-2 text-lg font-semibold text-[#093FB4] text-center">🧠 How was your match?</h2>

      <select
        value={rating}
        onChange={(e) => setRating(e.target.value)}
        required
        className="block w-full p-2 mb-4 border rounded"
      >
        <option value="">Rate Your Match</option>
        <option value="1">⭐ Poor</option>
        <option value="2">⭐⭐ Fair</option>
        <option value="3">⭐⭐⭐ Good</option>
        <option value="4">⭐⭐⭐⭐ Great</option>
        <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
      </select>

      <textarea
        className="w-full p-2 mb-4 border rounded"
        placeholder="Optional feedback..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <button
        type="submit"
        className="w-full px-4 py-2 text-white bg-[#ED3500] rounded hover:bg-red-600"
      >
        Submit Feedback
      </button>
    </form>
  );
}
