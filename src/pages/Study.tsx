// src/pages/Study.tsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Study: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const level = location.state?.level || "N3";
  const partId = location.state?.partId || "동사";

  const [answer, setAnswer] = useState("");

  const handleCheckAnswer = () => {
    // 정답 확인 로직 (예: API 호출 or 로컬 데이터 비교)
    alert(`입력한 답: ${answer}`);
  };

  const handleNextWord = () => {
    // 다음 단어 로직
    setAnswer("");
    alert("다음 단어로 이동합니다.");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      {/* Header */}
      <div className="w-full bg-white py-4 px-6 flex justify-between items-center shadow">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-500 text-sm"
        >
          〈 학습 화면
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center w-full max-w-md px-6 mt-6">
        <h1 className="text-3xl font-bold mb-2">
          {level} &gt; {partId}
        </h1>
        <div className="text-green-500 text-xl mb-6">✿</div>

        <div className="bg-white rounded-2xl shadow-md w-full p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">승리의 쾌감을 맛보다</h2>
          <p className="text-gray-600 mb-6">勝利の快感を（　）</p>

          {/* Input */}
          <div className="mb-4">
            <label className="block text-left text-sm font-medium text-gray-700 mb-1">
              정답 입력
            </label>
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="정답"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-between">
            <button
              onClick={handleNextWord}
              className="w-[48%] px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            >
              다음 단어
            </button>
            <button
              onClick={handleCheckAnswer}
              className="w-[48%] px-4 py-2 border border-green-500 text-green-600 rounded-lg hover:bg-green-50 transition"
            >
              정답 확인
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Study;
