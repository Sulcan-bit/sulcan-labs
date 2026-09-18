// app/sulcan-ai/page.tsx

"use client";

import { useState } from "react";

export default function SulcanAIPage() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Welcome to Sulcan AI — your Heavy Oil & Condensate Optimization Assistant. Ask me anything about blends, condensate, shrinkage, netbacks, logistics, or producer strategy."
    }
  ]);

  const [input, setInput] = useState("");

  async function sendMessage() {
    if (!input.trim()) return;

    // Add user message to chat
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);

    // Send to backend agent
    const response = await fetch("/api/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: newMessages
      })
    });

    const data = await response.json();

    // Add agent reply
    setMessages([
      ...newMessages,
      {
        role: "assistant",
        content: data?.message?.content ?? "No response from agent."
      }
    ]);

    setInput("");
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="p-4 bg-gray-900 text-white text-xl font-semibold">
        Sulcan AI — Heavy Oil & Condensate Optimization Assistant
      </div>

      {/* Chat Window */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg max-w-[80%] ${
              msg.role === "assistant"
                ? "bg-white border border-gray-300"
                : "bg-blue-600 text-white ml-auto"
            }`}
          >
            {msg.content}
          </div>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-4 bg-white border-t border-gray-300 flex gap-2">
        <input
          className="flex-1 p-3 border border-gray-400 rounded-lg"
          placeholder="Ask Sulcan AI anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
}
