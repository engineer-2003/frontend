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
  hasConjugation: boolean;
};

type IncorrectWordCount = {
  sentence: number;
  conjugation: number;
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
  const [incorrectCounts, setIncorrectCounts] = useState<Record<string, IncorrectWordCount>>({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/login");
    } else {
      setIsAuthorized(true);
      fetchIncorrectWordCounts(token);
    }
  }, [navigate, level]);

  const fetchIncorrectWordCounts = async (token: string) => {
    if (!level) return;

    const counts: Record<string, IncorrectWordCount> = {};

    for (const part of partData) {
      try {
        // 예문 학습 틀린 단어 개수
        const sentenceResponse = await fetch(
          `http://localhost:8080/study/incorrect/count?level=${level}&part=${part.backendValue}&studyType=sentence`,
          {
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          }
        );
        const sentenceData = await sentenceResponse.json();

        // 활용형 학습 틀린 단어 개수 (동사/형용사만)
        let conjugationCount = 0;
        if (part.hasConjugation) {
          const conjugationResponse = await fetch(
            `http://localhost:8080/study/incorrect/count?level=${level}&part=${part.backendValue}&studyType=conjugation`,
            {
              headers: {
                "Authorization": `Bearer ${token}`,
              },
            }
          );
          const conjugationData = await conjugationResponse.json();
          conjugationCount = conjugationData.count || 0;
        }

        counts[part.id] = {
          sentence: sentenceData.count || 0,
          conjugation: conjugationCount
        };

      } catch (error) {
        console.error(`틀린 단어 개수 조회 실패 - ${part.title}:`, error);
        counts[part.id] = { sentence: 0, conjugation: 0 };
      }
    }

    setIncorrectCounts(counts);
  };

  if (!isAuthorized) {
    return null;
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
      items={partData.map((part) => {
        const counts = incorrectCounts[part.id] || { sentence: 0, conjugation: 0 };
        
        return {
          id: part.id,
          title: part.title,
          description: `단어 수: ${part.wordCount}개\n진도율: ${part.progress}%`,
          customContent: (
            <div className="space-y-3">
              {/* 예문 학습 버튼들 */}
              <div className="flex gap-2">
                <button
                  onClick={() => navigate("/study/sentence", {
                    state: {
                      level: level,
                      partId: part.backendValue
                    }
                  })}
                  className="flex-1 px-3 py-2 bg-sakura text-branch rounded-lg hover:bg-sakura-darker transition text-sm"
                >
                  예문 학습
                </button>
                
                {counts.sentence > 0 && (
                  <button
                    onClick={() => navigate("/study/sentence", {
                      state: {
                        level: level,
                        partId: part.backendValue,
                        retryMode: true
                      }
                    })}
                    className="flex-1 px-3 py-2 bg-red-400 text-white rounded-lg hover:bg-red-600 transition text-sm"
                  >
                    재학습 ({counts.sentence}개)
                  </button>
                )}
              </div>

              {/* 활용형 학습 버튼들 (동사/형용사만) */}
              {part.hasConjugation && (
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate("/study/conjugation", {
                      state: {
                        level: level,
                        partId: part.backendValue
                      }
                    })}
                    className="flex-1 px-3 py-2 bg-blue-300 text-white rounded-lg hover:bg-blue-500 transition text-sm"
                  >
                    활용형 학습
                  </button>
                  
                  {counts.conjugation > 0 && (
                    <button
                      onClick={() => navigate("/study/conjugation", {
                        state: {
                          level: level,
                          partId: part.backendValue,
                          retryMode: true
                        }
                      })}
                      className="flex-1 px-3 py-2 bg-red-400 text-white rounded-lg hover:bg-red-600 transition text-sm"
                    >
                      재학습 ({counts.conjugation}개)
                    </button>
                  )}
                </div>
              )}
            </div>
          ),
          onClick: () => {},
        };
      })}
    />
  );
};

export default PartSelect;