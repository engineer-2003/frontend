import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
};

const Chatbot: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      text: 'こんにちは！AIチャットへようこそ。日本語で何でも聞いてください。',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  const handleBack = () => {
    navigate('/select/main');
  };

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageToSend = input;
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/chat', { 
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            message: messageToSend 
        }), 
      });

      if (!response.ok) {
        throw new Error('서버 응답 오류');
      }

      const data = await response.json(); 

      const botResponse: Message = {
        id: `bot-${Date.now()}`,
        text: data.reply, 
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);

    } catch (error) {
      console.error("챗봇 API 연동 오류:", error);
      const errorResponse: Message = {
        id: `bot-${Date.now()}`,
        text: '죄송합니다. AI 챗봇 응답에 오류가 발생했습니다.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      handleSend();
    }
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? '오후' : '오전';
    const displayHours = hours % 12 || 12;
    return `${ampm} ${displayHours}:${minutes.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-blue-50">
      {/* 헤더 - 카카오톡 스타일 */}
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shadow-sm">
        <button
          onClick={handleBack}
          className="text-gray-700 hover:text-gray-900 transition-colors"
          aria-label="뒤로가기"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex flex-col items-center">
          <h1 className="text-lg font-semibold text-gray-900">AI 챗봇</h1>
          <span className="text-xs text-gray-500">일본어</span>
        </div>
        <div className="w-6"></div>
      </header>

      {/* 채팅 영역 */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-br from-pink-50/30 via-purple-50/30 to-blue-50/30"
        style={{ 
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 10px, rgba(255,192,203,0.1) 10px, rgba(255,192,203,0.1) 11px),
            radial-gradient(circle at 20% 50%, rgba(255,182,193,0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(216,191,216,0.15) 0%, transparent 50%)
          `,
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-message-appear`}
          >
            <div className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} max-w-[75%]`}>
              <div
                className={`px-4 py-3 rounded-2xl shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-sakura to-sakura-dark text-white rounded-tr-sm'
                    : 'bg-white text-gray-800 rounded-tl-sm'
                }`}
              >
                {msg.text.split('\n').map((line, index) => (
                  <p key={index} className="leading-relaxed">{line}</p>
                ))}
              </div>
              <span className="text-xs text-gray-500 mt-1 px-2">
                {formatTime(msg.timestamp)}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start animate-message-appear">
            <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce-dot" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce-dot" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce-dot" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 입력 영역 - 카카오톡 스타일 */}
      <div className="bg-white/95 backdrop-blur-sm border-t border-pink-100 px-4 py-3 shadow-lg">
        <div className="flex items-center space-x-2">
          <button
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="추가 기능"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
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
              className="w-full px-4 py-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-full focus:outline-none focus:ring-2 focus:ring-sakura-dark transition-all shadow-sm"
              disabled={isLoading}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={isLoading || input.trim() === ''}
            className="p-3 bg-gradient-to-r from-sakura to-sakura-dark text-white rounded-full hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:transform-none"
            aria-label="전송"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>

      {/* CSS 애니메이션 */}
      <style>{`
        @keyframes messageAppear {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounceDot {
          0%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-8px);
          }
        }

        .animate-message-appear {
          animation: messageAppear 0.3s ease-out;
        }

        .animate-bounce-dot {
          animation: bounceDot 1.4s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Chatbot;