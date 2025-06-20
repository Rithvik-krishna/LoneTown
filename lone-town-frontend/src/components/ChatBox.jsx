// components/ChatBox.jsx
import React from "react";

export default function ChatBox({ messages, input, setInput, sendMessage, currentUserId }) {
  return (
    <div className="flex flex-col p-4 mt-4 bg-white rounded-lg shadow-md" style={{ minHeight: "60vh" }}>
      <div className="mb-4 font-medium text-center text-gray-700">
        💬 {messages.length}/100 Messages — {messages.length >= 100 ? "🎥 Video unlocked!" : "Keep going!"}
      </div>

      {/* Message area */}
      <div className="flex-1 mb-4 space-y-2 overflow-y-auto">
        {messages.map((msg, index) => {
          const isSender = String(msg.senderId) === String(currentUserId);
          console.log("msg.senderId:", msg.senderId, "| currentUserId:", currentUserId);

          return (
            <div
              key={index}
              className={`p-2 max-w-xs rounded-lg break-words ${
                isSender ? 'bg-blue-500 text-white self-end ml-auto' : 'bg-gray-300 text-black self-start mr-auto'
              }`}
            >
              {msg.text}
            </div>
          );
        })}
      </div>

      {/* Input bar */}
      <div className="flex items-center pt-2 mt-2 border-t">
        <input
          type="text"
          className="flex-1 p-2 mr-2 border rounded-md"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage} className="px-4 py-2 text-white bg-indigo-600 rounded-md">
          Send
        </button>
      </div>
    </div>
  );
}
