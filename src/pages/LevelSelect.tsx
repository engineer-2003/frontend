// src/pages/LevelSelect.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

type Level = {
  id: string;
  title: string;
  wordCount: number;
  progress: number;
};

const levels: Level[] = [
  { id: "N5", title: "N5", wordCount: 450, progress: 15 },
  { id: "N4", title: "N4", wordCount: 700, progress: 25 },
  { id: "N3", title: "N3", wordCount: 1000, progress: 50 },
  { id: "N2", title: "N2", wordCount: 2000, progress: 75 },
  { id: "N1", title: "N1", wordCount: 3000, progress: 90 },
];

const LevelSelect: React.FC = () => {
  const navigate = useNavigate();

  const handleStartClick = (levelId: string) => {
    navigate("/partSelect", { state: { level: levelId } });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      {/* Header */}
      <div className="w-full bg-green-500 rounded-b-3xl py-8 text-center text-white">
        <h1 className="text-2xl font-bold">급수 선택</h1>
        <div className="mt-2 text-lg">✿</div>
      </div>

      {/* Content */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md mt-6 p-6">
        {levels.map((level) => (
          <div key={level.id} className="mb-6">
            <h2 className="text-lg font-semibold">{level.title}</h2>
            <p className="text-gray-600 text-sm">
              단어 수: {level.wordCount}개
            </p>
            <p className="text-gray-600 text-sm mb-2">
              진도율: {level.progress}%
            </p>
            <button
              onClick={() => handleStartClick(level.id)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition">
              학습 시작
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LevelSelect;