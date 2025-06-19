import React from 'react';

export default function ChatBox({ messages, input, setInput, sendMessage, currentUserId }) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-md mt-4 flex flex-col" style={{ minHeight: '60vh' }}>
      <div className="flex-1 overflow-y-auto mb-4 flex flex-col gap-2">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-2 rounded-lg max-w-xs break-words ${
              msg.senderId === currentUserId
                ? 'bg-blue-500 text-white self-end'
                : 'bg-gray-300 text-black self-start'
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div className="flex items-center border-t pt-2 mt-2">
        <input
          type="text"
          className="flex-1 border rounded-md p-2 mr-2"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage} className="bg-indigo-600 text-white px-4 py-2 rounded-md">
          Send
        </button>
      </div>
    </div>
  );
}
