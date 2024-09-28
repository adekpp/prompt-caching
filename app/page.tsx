"use client";

import { useState, useEffect, useRef } from "react";

interface Message {
  content: string;
  isUser: boolean;
}

interface Stats {
  input_tokens: number;
  cache_creation_input_tokens: number;
  cache_read_input_tokens: number;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [triggerScroll, setTriggerScroll] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [stats, setStats] = useState<Stats[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, triggerScroll]);

  const handleSendMessage = async () => {
    if (input.trim() === "") return;

    const userMessage: Message = { content: input, isUser: true };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await response.json();

      const aiMessage: Message = {
        content: data.content[0].text,
        isUser: false,
      };
      const usage: Stats = {
        input_tokens: data.usage.input_tokens,
        cache_creation_input_tokens: data.usage.cache_creation_input_tokens,
        cache_read_input_tokens: data.usage.cache_read_input_tokens,
      };
      console.log(data.usage);
      setStats((prevStats) => [...prevStats, usage]);
      setMessages((prevMessages) => [...prevMessages, aiMessage]);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid md:grid-cols-4 grid-cols-3 h-screen bg-gray-100 max-w-5xl mx-auto">
      <div className="flex flex-col h-screen md:col-span-3 col-span-2 pt-[80px]">

        <main className="flex-grow overflow-hidden flex flex-col">
          <div className="flex-grow overflow-y-auto p-4">
            <div className="space-y-4 max-w-3xl mx-auto">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`p-3 rounded-lg max-w-[70%] ${
                      message.isUser
                        ? "bg-blue-500 text-white"
                        : "bg-slate-200 text-gray-800 shadow-md"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 text-gray-600 p-3 rounded-lg animate-pulse">
                    ...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </main>
        <div className="p-4 bg-white shadow-md">
          <div className="flex space-x-2 max-w-3xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && !isLoading && handleSendMessage()
              }
              className="flex-grow p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 bg-slate-200"
              placeholder="Type your message..."
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              className={`px-4 py-2 bg-blue-600 text-white rounded-lg transition-colors ${
                isLoading || input.trim() === ""
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-blue-700"
              }`}
              disabled={isLoading || input.trim() === ""}
            >
              Send
            </button>
          </div>
        </div>
      </div>
      <div className="overflow-y-auto h-full p-4 flex flex-col items-center text-sm pt-[80px]">
        <div className="text-slate-900 font-bold mb-4">Stats:</div>
        {stats.map((stat, index) => (
          <div key={index} className="mb-4 text-slate-900 w-full">
            <div className="font-semibold">request {index + 1}</div>
            <div>Input Tokens: {stat.input_tokens}</div>
            <div>
              Cache Creation Input Tokens: {stat.cache_creation_input_tokens}
            </div>
            <div>Cache Read Input Tokens: {stat.cache_read_input_tokens}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
