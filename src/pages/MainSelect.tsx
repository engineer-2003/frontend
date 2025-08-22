// src/pages/MainSelect.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

const MainPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center">
      {/* Header */}
      <div className="w-full py-10 text-center shadow-sm">
        <h1 className="text-2xl font-bold">나의 학습</h1>
      </div>

      {/* Content */}
      <div className="w-full max-w-md bg-green-50 rounded-3xl shadow-md p-10 flex flex-col items-center">
        {/* 상단 장식 */}
        <div className="text-green-500 text-2xl mb-6">✿</div>

        {/* 급수별 학습 버튼 */}
        <button
          className="w-3/4 py-3 border border-green-500 text-green-600 rounded-lg mb-6 hover:bg-green-100 transition"
          onClick={() => navigate("/levelSelect")}
        >
          급수별 학습
        </button>

        {/* 중간 장식 */}
        <div className="text-green-400 text-xl mb-6">✿</div>

        {/* 문형별 학습 버튼 */}
        <button className="w-3/4 py-3 border border-green-500 text-green-600 rounded-lg mb-10 hover:bg-green-100 transition">
          문형별 학습
        </button>

        {/* 학습 기록 확인 버튼 */}
        <button 
        onClick={() => navigate("/history")}
        className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
          학습 기록 확인
        </button>
      </div>
    </div>
  );
};

export default MainPage;