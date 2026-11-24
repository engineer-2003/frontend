// src/pages/learning/Chatbot.tsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

type Message = {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
};

const Chatbot: React.FC = () => {
  const BASE_API_URL =
    import.meta.env.VITE_BACKEND_API_URL || "http://localhost:8080";

  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    const token = localStorage.getItem("token");

    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/user/login");
      return;
    }

    const initChat = async () => {
      setIsLoading(true);

      try {
        const response = await fetch(`${BASE_API_URL}/api/chat/init`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();

          setMessages([
            {
              id: `init-${Date.now()}`,
              text: data.reply,
              sender: "bot",
              timestamp: new Date(),
            },
          ]);
        } else {
          setMessages([
            {
              id: `init-${Date.now()}`,
              text: "안녕! 최근 학습한 단어들을 바탕으로 일본어 문장 만들기 연습을 해볼까?",
              sender: "bot",
              timestamp: new Date(),
            },
          ]);
        }
      } catch (error) {
        console.error("초기 챗봇 메시지 로드 실패:", error);

        setMessages([
          {
            id: `init-${Date.now()}`,
            text: "안녕! 최근 학습한 단어들을 바탕으로 일본어 문장 만들기 연습을 해볼까?",
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    initChat();
  }, [BASE_API_URL, navigate]);

  useEffect(() => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const handleBack = () => {
    navigate("/select/main");
  };

  const handleSend = async () => {
    if (input.trim() === "" || isLoading) return;

    const token = localStorage.getItem("token");

    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/user/login");
      return;
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: input,
      sender: "user",
      timestamp: new Date(),
    };

    const currentHistory = messages.map((m) => ({
      sender: m.sender,
      text: m.text,
    }));

    setMessages((prev) => [...prev, userMessage]);

    const messageToSend = input;
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(`${BASE_API_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: messageToSend,
          history: currentHistory,
        }),
      });

      if (!response.ok) {
        throw new Error("서버 응답 오류");
      }

      const data = await response.json();

      const botResponse: Message = {
        id: `bot-${Date.now()}`,
        text: data.reply,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error("챗봇 API 연동 오류:", error);

      const errorResponse: Message = {
        id: `bot-${Date.now()}`,
        text: "죄송합니다. AI 챗봇 응답에 오류가 발생했습니다.",
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      handleSend();
    }
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "오후" : "오전";
    const displayHours = hours % 12 || 12;

    return `${ampm} ${displayHours}:${minutes.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col h-screen bg-[#FFF7F8]">
      {/* 헤더 */}
      <header className="flex items-center justify-between px-4 py-3 bg-white">
        <button
          onClick={handleBack}
          className="text-gray-700 hover:text-gray-900 transition-colors"
          aria-label="뒤로가기"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <div className="flex flex-col items-center">
          <h1 className="text-lg font-semibold text-gray-900">
            AI 챗봇
          </h1>
        </div>

        <div className="w-6"></div>
      </header>

      {/* 채팅 영역 */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            } animate-message-appear`}
          >
            <div
              className={`flex flex-col ${
                msg.sender === "user" ? "items-end" : "items-start"
              } max-w-[75%]`}
            >
              <div
                className={`px-4 py-3 rounded-2xl ${
                  msg.sender === "user"
                    ? "bg-[#F5B1BF] text-white rounded-tr-sm"
                    : "bg-white text-gray-800 rounded-tl-sm"
                }`}
              >
                {msg.text.split("\n").map((line, index) => (
                  <p key={index} className="leading-relaxed">
                    {line}
                  </p>
                ))}
              </div>

              <span className="text-xs text-gray-600 mt-1 px-2">
                {formatTime(msg.timestamp)}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start animate-message-appear">
            <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm">
              <div className="flex space-x-2">
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce-dot"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce-dot"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce-dot"
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 입력 영역 */}
      <div className="bg-white px-4 py-3">
        <div className="flex items-center space-x-2">
          <button
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="추가 기능"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>

          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="메시지를 입력하세요..."
              className="w-full px-4 py-3 bg-[#FFF0F3] text-gray-800 placeholder-gray-400 rounded-full focus:outline-none focus:ring-2 focus:ring-sakura/30 transition-all"
              disabled={isLoading}
            />
          </div>

          <button
            onClick={handleSend}
            disabled={isLoading || input.trim() === ""}
            className="p-3 bg-[#F6C5CC] text-white rounded-full hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            aria-label="전송"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
