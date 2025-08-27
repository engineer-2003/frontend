// src/pages/MainSelect.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

const MainPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    alert("로그아웃 되었습니다.");
    navigate("/"); // 로그인 페이지로 이동
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center">
      {/* Header */}
      <div className="w-full rounded-b-3xl py-8 shadow-sm relative text-center">
        {/* 중앙 제목 */}
        <h1 className="text-2xl font-bold">나의 학습</h1>

        {/* 오른쪽 로그아웃 버튼 */}
        <button
          onClick={handleLogout}
          className="absolute right-6 top-1/2 -translate-y-1/2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
        >
          로그아웃
        </button>
      </div>

      {/* Content */}
      <div className="w-full max-w-md bg-green-50 rounded-b-3xl shadow-md mt-6 p-10 flex flex-col items-center">
        {/* 상단 장식 */}
        <div className="text-green-500 text-2xl mb-6">✿</div>

        {/* 급수별 학습 버튼 */}
        <button
          className="w-3/4 py-3 border border-green-500 text-green-600 rounded-lg mb-6 bg-white hover:bg-green-100 transition"
          onClick={() => navigate("/levelSelect")}
        >
          급수별 학습
        </button>

        {/* 중간 장식 */}
        <div className="text-green-400 text-xl mb-6">✿</div>

        {/* 문형별 학습 버튼 */}
        <button
          className="w-3/4 py-3 border border-green-500 text-green-600 rounded-lg mb-10 bg-white hover:bg-green-100 transition"
          onClick={() => navigate("/study")}
        >
          문형별 학습
        </button>

        {/* 학습 기록 확인 버튼 */}
        <button
          onClick={() => navigate("/history")}
          className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
        >
          학습 기록 확인
        </button>
      </div>
    </div>
  );
};

export default MainPage;
