import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function PastMatches({ userId }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchHistory = async () => {
      try {
        const res = await axios.get(`/api/match/history/${userId}`);
        setHistory(res.data.history);
      } catch (err) {
        console.error("❌ Error fetching match history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [userId]);

  if (loading) return <p className="text-center text-gray-500">Loading past matches...</p>;

  if (history.length === 0) {
    return <p className="text-center text-gray-600">No past matches yet.</p>;
  }

  return (
    <div className="p-4 mt-6 bg-white rounded-lg shadow-md">
      <h2 className="mb-4 text-xl font-semibold text-indigo-600">🕰️ Past Matches</h2>

      {history.map((match, idx) => (
        <div key={idx} className="p-4 mb-4 border rounded-md bg-gray-50">
          <p><span className="font-semibold">💑 Partner:</span> {match.partnerName}</p>
          <p><span className="font-semibold">🔢 Compatibility Score:</span> {match.compatibilityScore}</p>

          <div className="mt-2">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">📝 Your Feedback:</span>{" "}
              {match.userFeedback || <em>No feedback given</em>}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-semibold">💬 Partner's Feedback:</span>{" "}
              {match.partnerFeedback || <em>Not shared</em>}
            </p>
          </div>

          <p className="mt-2 text-xs text-gray-400">
            📅 {new Date(match.createdAt).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
}
