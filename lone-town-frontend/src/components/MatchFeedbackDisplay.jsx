import React from 'react';

export default function MatchFeedbackDisplay({ feedback }) {
  if (!feedback || feedback.length === 0) {
    return (
      <div className="p-4 mt-6 text-sm text-center text-gray-500 bg-white border rounded shadow">
        No feedback available for this match yet.
      </div>
    );
  }

  return (
    <div className="p-4 mt-6 bg-white border rounded shadow">
      <h3 className="mb-2 text-lg font-semibold text-indigo-600">📝 Match Feedback</h3>
      <ul className="space-y-2">
        {feedback.map((entry, index) => (
          <li key={index} className="p-2 text-sm border rounded bg-gray-50">
            <p className="text-gray-700">⭐ {entry.rating}/5</p>
            <p className="mt-1 italic text-gray-600">"{entry.comment}"</p>
            <p className="text-[10px] text-gray-400 mt-1 text-right">
              {new Date(entry.createdAt).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
