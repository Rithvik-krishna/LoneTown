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
    <div className="flex flex-col p-4 mt-4 bg-[#1a1a1a] rounded-lg shadow-md h-[80vh] max-w-2xl w-full mx-auto border border-pink-900/30">
      <div className="flex-shrink-0 mb-4 font-medium text-center text-pink-400">
        💬 {messages.length}/100 Messages —{" "}
        {isEligibleForVideo ? "🎥 Video unlocked!" : "Keep going!"}
      </div>

      {/* Message list with hidden scrollbar */}
      <div className="flex-1 pr-1 space-y-2 overflow-y-auto hide-scrollbar">
        {messages.map((msg, index) => {
          const isSender = String(msg.senderId) === String(currentUserId);
          return (
            <div
              key={index}
              className={`max-w-xs p-2 rounded-lg break-words bg-[#ffd5e5] text-black ${
                isSender ? "self-end ml-auto" : "self-start mr-auto"
              }`}
            >
              {msg.text}
              <div className="text-[10px] text-right mt-1 text-black/50">
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

      <div className="flex items-center flex-shrink-0 pt-2 mt-4 border-t border-pink-900/40">
        <textarea
          rows={1}
          className="flex-1 p-2 mr-2 text-white bg-[#2d2d2d] border border-pink-700 rounded-md resize-none max-h-40 placeholder-gray-400"
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
          className="px-4 py-2 text-white bg-pink-600 rounded-md hover:bg-pink-700"
        >
          Send
        </button>
      </div>

      {isEligibleForVideo && (
        <div className="flex-shrink-0 mt-3 text-center">
          <p className="font-semibold text-green-400">
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
