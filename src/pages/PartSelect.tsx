// src/pages/PartSelect.tsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

type Part = {
  id: string;
  title: string;
  wordCount: number;
  progress: number;
};

const partData: Part[] = [
  { id: "noun", title: "명사", wordCount: 120, progress: 20 },
  { id: "adj", title: "형용사", wordCount: 80, progress: 10 },
  { id: "adjv", title: "형용동사", wordCount: 60, progress: 5 },
  { id: "verb", title: "동사", wordCount: 150, progress: 30 },
];

const PartSelect: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const level = location.state?.level; // LevelSelect에서 전달받은 급수

  if (!level) {
    return <div>급수를 선택해주세요.</div>;
  }

  const handleStartClick = (partId: string) => {
    navigate("/study", { state: { level, partId } });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      {/* Header */}
      <div className="w-full bg-green-500 rounded-b-3xl py-8 text-center text-white">
        <h1 className="text-2xl font-bold">{level} 급수 품사 선택</h1>
        <div className="mt-2 text-lg">✿</div>
      </div>

      {/* Content */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md mt-6 p-6">
        {partData.map((part) => (
          <div key={part.id} className="mb-6">
            <h2 className="text-lg font-semibold">{part.title}</h2>
            <p className="text-gray-600 text-sm">단어 수: {part.wordCount}개</p>
            <p className="text-gray-600 text-sm mb-2">
              진도율: {part.progress}%
            </p>
            <button
              onClick={() => handleStartClick(part.id)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition">
              학습 시작
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PartSelect;