import React, { useEffect, useRef } from "react";

export default function ChatBox({ messages, input, setInput, sendMessage, currentUserId }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isEligibleForVideo = (() => {
    const now = Date.now();
    const cutoff = now - 48 * 60 * 60 * 1000;
    const recentMessages = messages.filter(
      (msg) => new Date(msg.createdAt).getTime() >= cutoff
    );
    return recentMessages.length >= 100;
  })();

  return (
    <div className="flex flex-col p-4 mt-4 bg-white rounded-lg shadow-md h-[80vh]">
      <div className="flex-shrink-0 mb-4 font-medium text-center text-gray-700">
        💬 {messages.length}/100 Messages —{" "}
        {isEligibleForVideo ? "🎥 Video unlocked!" : "Keep going!"}
      </div>

      <div className="flex-1 pr-1 space-y-2 overflow-y-auto">
        {messages.map((msg, index) => {
          const isSender = String(msg.senderId) === String(currentUserId);
          return (
            <div
              key={index}
              className={`max-w-xs p-2 rounded-lg break-words ${
                isSender
                  ? "bg-[#093FB4] text-white self-end ml-auto"
                  : "bg-[#FFD8D8] text-black self-start mr-auto"
              }`}
            >
              {msg.text}
              <div className="text-[10px] text-right mt-1 text-white/70">
                {new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex items-center flex-shrink-0 pt-2 mt-4 border-t">
        <textarea
          rows={1}
          className="flex-1 p-2 mr-2 overflow-hidden border rounded-md resize-none max-h-40"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = e.target.scrollHeight + "px";
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 text-white bg-[#ED3500] hover:bg-red-700 rounded-md"
        >
          Send
        </button>
      </div>

      {isEligibleForVideo && (
        <div className="flex-shrink-0 mt-2 text-center">
          <p className="font-semibold text-green-600">
            🎉 You’ve unlocked video calling!
          </p>
          <button className="px-4 py-2 mt-2 text-white bg-purple-600 rounded hover:bg-purple-700">
            Start Video Call
          </button>
        </div>
      )}
    </div>
  );
}
