import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SelectPage from "../components/SelectPage";

type Part = {
  id: string;
  title: string;
  wordCount: number;
  progress: number;
};

const partData = [
  { id: "noun", title: "명사", wordCount: 120, progress: 20 },
  { id: "adj", title: "형용사", wordCount: 80, progress: 10 },
  { id: "adjv", title: "형용동사", wordCount: 60, progress: 5 },
  { id: "verb", title: "동사", wordCount: 150, progress: 30 },
];

const PartSelect: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const level = location.state?.level;

  if (!level) return <div>급수를 선택해주세요.</div>;

  return (
    <SelectPage
      headerTitle={`${level} 품사 선택`}
      headerExtra="✿"
      items={partData.map((part) => ({
        id: part.id,
        title: part.title,
        description: `단어 수: ${part.wordCount}개\n진도율: ${part.progress}%`,
        onClick: () => navigate(`/study?level=${level}&part=${part.id}`),
      }))}
    />
  );
};

export default PartSelect;
