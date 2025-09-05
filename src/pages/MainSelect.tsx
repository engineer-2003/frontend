import React from "react";
import { useNavigate } from "react-router-dom";
import SelectPage from "../components/SelectPage";

const MainSelect: React.FC = () => {
  const navigate = useNavigate();

  const items = [
    {
      id: "level",
      title: "급수별 학습",
      description: `전체 단어 수: 7150개\n진도율: 30%`,
      onClick: () => navigate("/levelSelect"),
    },
    {
      id: "pattern",
      title: "문형별 학습",
      description: `전체 문형 수: 250개\n진도율: 10%`,
      onClick: () => navigate("/study"),
    },
    {
      id: "history",
      title: "학습 기록 확인",
      description: `7일 연속 학습 중`,
      onClick: () => navigate("/history"),
    },
  ];

  return (
    <SelectPage
      headerTitle="나의 학습"
      headerExtra="✿"
      items={items}
    />
  );
};

export default MainSelect;
