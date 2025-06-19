import React from 'react';

export default function MatchCard({ match }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-md text-center mb-6">
      <h2 className="text-xl font-semibold">Your Match</h2>
      <p className="text-2xl font-bold text-indigo-600">{match.name}</p>
      <p className="text-sm text-gray-500 mt-1">Only one match at a time. Choose wisely.</p>
    </div>
  );
}