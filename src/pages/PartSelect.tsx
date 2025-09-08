// src/pages/PartSelect.tsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SelectPage from "../components/SelectPage";

type Part = {
  id: string;
  title: string;
  backendValue: string; // 백엔드 API에서 사용하는 값
  wordCount: number;
  progress: number;
};

// 백엔드 API에서 사용하는 품사명으로 매핑
const partData: Part[] = [
  { id: "noun", title: "명사", backendValue: "명사", wordCount: 120, progress: 20 },
  { id: "adj", title: "형용사", backendValue: "형용사", wordCount: 80, progress: 10 },
  { id: "adjv", title: "형용동사", backendValue: "형용동사", wordCount: 60, progress: 5 },
  { id: "verb", title: "동사", backendValue: "동사", wordCount: 150, progress: 30 },
];

const PartSelect: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const level = location.state?.level;

  if (!level) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg mb-4">급수를 선택해주세요.</div>
          <button
            onClick={() => navigate("/levelSelect")}
            className="px-4 py-2 bg-sakura-dark text-white rounded-lg"
          >
            급수 선택하러 가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <SelectPage
      headerTitle={`${level} 품사 선택`}
      headerExtra="✿"
      items={partData.map((part) => ({
        id: part.id,
        title: part.title,
        description: `단어 수: ${part.wordCount}개\n진도율: ${part.progress}%`,
        onClick: () => navigate("/study", { 
          state: { 
            level: level, // N5, N4, N3, N2, N1
            partId: part.backendValue // 백엔드에서 사용하는 품사명
          } 
        }),
      }))}
    />
  );
};

export default PartSelect;