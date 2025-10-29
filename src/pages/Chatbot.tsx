import { useState } from "react";
import { useNavigate } from "react-router-dom";

// 챗봇 메시지 타입 정의
interface Message {
  sender: "user" | "bot";
  text: string;
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const navigate = useNavigate();

  // 사용자 메시지 전송 핸들러
  const handleSend = async () => {
    if (input.trim() === "") return;

    const newUserMessage: Message = { sender: "user", text: input };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setInput("");

    try {
      // API 호출 URL 수정: 백엔드 서버의 전체 경로를 명시
      const response = await fetch("http://localhost:8080/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: input }),
      });

      

      const data = await response.json();
      
      const newBotMessage: Message = { sender: "bot", text: data.reply };
      setMessages((prevMessages) => [...prevMessages, newBotMessage]);

    } catch (error) {
      console.error("챗봇 응답을 가져오는 중 오류 발생:", error);
      const errorMessage: Message = { sender: "bot", text: "죄송합니다. 챗봇과 연결하는 중 오류가 발생했습니다. 다시 시도해 주세요." };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* 헤더 */}
      <header className="flex items-center justify-between p-4 bg-white shadow-md">
        <button onClick={() => navigate(-1)} className="text-sakura-dark text-lg font-bold">
          ←
        </button>
        <h1 className="text-xl font-bold text-branch">챗봇과 대화하기</h1>
        <div></div>
      </header>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`p-3 rounded-xl max-w-xs break-words ${
                msg.sender === "user"
                  ? "bg-sakura-dark text-white"
                  : "bg-white text-gray-800"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* 입력 영역 */}
      <div className="p-4 bg-white border-t border-gray-200 flex space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="메시지를 입력하세요..."
          className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sakura-dark"
        />
        <button
          onClick={handleSend}
          className="p-2 bg-sakura-dark text-white rounded-lg font-medium hover:bg-sakura-darker"
        >
          전송
        </button>
      </div>
    </div>
  );
}