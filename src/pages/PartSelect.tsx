// src/pages/PartSelect.tsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SelectPage from "../components/SelectPage";

type Part = {
  id: string;
  title: string;
  backendValue: string;
  wordCount: number;
  progress: number;
  hasConjugation: boolean; // 활용형 학습 가능 여부
};

const partData: Part[] = [
  { id: "noun", title: "명사", backendValue: "명사", wordCount: 120, progress: 20, hasConjugation: false },
  { id: "adj", title: "형용사", backendValue: "형용사", wordCount: 80, progress: 10, hasConjugation: true },
  { id: "adjv", title: "형용동사", backendValue: "형용동사", wordCount: 60, progress: 5, hasConjugation: false },
  { id: "verb", title: "동사", backendValue: "동사", wordCount: 150, progress: 30, hasConjugation: true },
];

const PartSelect: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const level = location.state?.level;

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
        // 예문 학습과 활용형 학습 버튼을 렌더링하는 커스텀 컴포넌트
        customContent: (
          <div className="flex gap-2">
            {/* 예문 학습 버튼 */}
            <button
              onClick={() => navigate("/study/sentence", { 
                state: { 
                  level: level,
                  partId: part.backendValue
                } 
              })}
              className="flex-1 px-3 py-2 bg-sakura-dark text-white rounded-lg hover:bg-sakura-darker transition text-sm"
            >
              예문 학습
            </button>
            
            {/* 활용형 학습 버튼 (동사/형용사만) */}
            {part.hasConjugation && (
              <button
                onClick={() => navigate("/study/conjugation", { 
                  state: { 
                    level: level,
                    partId: part.backendValue
                  } 
                })}
                className="flex-1 px-3 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-700 transition text-sm"
              >
                활용형 학습
              </button>
            )}
          </div>
        ),
        // onClick은 필수이지만 customContent를 사용하므로 빈 함수로 처리
        onClick: () => {},
      }))}
    />
  );
};

export default PartSelect;