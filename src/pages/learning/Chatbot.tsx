import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
};

const Chatbot: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      text: 'こんにちは！AIチャットへようこそ。日本語で何でも聞いてください。',
      sender: 'bot',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);

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
      };
      setMessages((prev) => [...prev, botResponse]);

    } catch (error) {
      console.error("챗봇 API 연동 오류:", error);
      const errorResponse: Message = {
        id: `bot-${Date.now()}`,
        text: '죄송합니다. AI 챗봇 응답에 오류가 발생했습니다.',
        sender: 'bot',
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

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="flex items-center justify-between p-4 bg-white shadow-md">
        <button
          onClick={handleBack}
          className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
        >
          ← 뒤로가기
        </button>
        <h1 className="text-lg font-semibold">AI 챗봇 (일본어)</h1>
        <div className="w-20"></div>
      </header>

      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg shadow ${
                msg.sender === 'user'
                  ? 'bg-sakura-dark text-white'
                  : 'bg-white text-gray-800'
              }`}
            >
              {msg.text.split('\n').map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-lg shadow bg-white text-gray-500">
              답변 생각 중...
            </div>
          </div>
        )}
      </div>

      <div className="flex p-4 bg-white border-t border-gray-200">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="일본어로 메시지를 입력하세요..."
          className="flex-1 px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-sakura-dark"
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          disabled={isLoading || input.trim() === ''}
          className="px-6 py-2 bg-sakura-dark text-white rounded-r-lg hover:bg-sakura-darker disabled:bg-gray-300 transition"
        >
          전송
        </button>
      </div>
    </div>
  );
};

export default Chatbot;