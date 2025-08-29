import React from "react";
import { useNavigate } from "react-router-dom";
import SelectPage from "../components/SelectPage";

const levels = [
  { id: "N5", title: "N5", wordCount: 450, progress: 15 },
  { id: "N4", title: "N4", wordCount: 700, progress: 25 },
  { id: "N3", title: "N3", wordCount: 1000, progress: 50 },
  { id: "N2", title: "N2", wordCount: 2000, progress: 75 },
  { id: "N1", title: "N1", wordCount: 3000, progress: 90 },
];

const LevelSelect: React.FC = () => {
  const navigate = useNavigate();

  return (
    <SelectPage
      headerTitle="급수 선택"
      headerExtra={<div className="text-lg">✿</div>} // 기존 장식 아이콘
      items={levels.map((level) => ({
        id: level.id,
        title: level.title,
        description: `단어 수: ${level.wordCount}개 | 진도율: ${level.progress}%`,
        onClick: () => navigate("/partSelect", { state: { level: level.id } }),
      }))}
    />
  );
};

export default LevelSelect;
