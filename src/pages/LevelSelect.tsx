// src/pages/LevelSelect.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SelectPage from "../components/SelectPage";

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
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/login");
    } else {
      setIsAuthorized(true);
    }
  }, [navigate]);

  if (!isAuthorized) {
    return null; // 인증되지 않은 경우 아무것도 렌더링하지 않음
  }

  return (
    <SelectPage
      headerTitle="급수 선택"
      headerExtra="✿"
      items={levels.map((level) => ({
        id: level.id,
        title: level.title,
        description: `단어 수: ${level.wordCount}개\n진도율: ${level.progress}%`,
        onClick: () => navigate("/partSelect", { state: { level: level.id } }),
        buttonClassName: "bg-sakura-dark text-white",
      }))}
    />
  );
};

export default LevelSelect;