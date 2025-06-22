import React from 'react';

export default function MatchFeedbackDisplay({ feedback }) {
  if (!feedback || feedback.length === 0) {
    return (
      <div className="p-4 mt-6 text-sm text-center text-pink-300 bg-[#1a1a1a] border rounded shadow border-pink-900/30">
        No feedback available for this match yet.
      </div>
    );
  }

  return (
    <div className="p-4 mt-6 bg-[#1a1a1a] border border-pink-900/40 rounded shadow">
      <h3 className="mb-2 text-lg font-semibold text-pink-400">📝 Match Feedback</h3>
      <ul className="space-y-2">
        {feedback.map((entry, index) => (
          <li key={index} className="p-3 text-sm bg-[#2d2d2d] border border-pink-800 rounded">
            <p className="text-pink-400">⭐ {entry.rating}/5</p>
            <p className="mt-1 italic text-pink-100">"{entry.comment}"</p>
            <p className="text-[10px] text-right text-pink-500 mt-1">
              {new Date(entry.createdAt).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
