// src/pages/learning/Select.tsx
import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SelectPage from "../../components/SelectPage"; // 경로 조정

// --- Type Definitions ---
type SelectItem = {
  id: string;
  title: string;
  description?: string;
  onClick: () => void;
  buttonClassName?: string;
  customContent?: React.ReactNode;
  hideDefaultButton?: boolean;
};

type Level = {
  id: string;
  title: string;
  wordCount: number;
  progress: number;
};

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

// --- Data ---
const levels: Level[] = [
  { id: "N5", title: "N5", wordCount: 450, progress: 15 },
  { id: "N4", title: "N4", wordCount: 700, progress: 25 },
  { id: "N3", title: "N3", wordCount: 1000, progress: 50 },
  { id: "N2", title: "N2", wordCount: 2000, progress: 75 },
  { id: "N1", title: "N1", wordCount: 3000, progress: 90 },
];

const partData: Part[] = [
  { id: "noun", title: "명사", backendValue: "명사", wordCount: 120, progress: 20, hasConjugation: false },
  { id: "adj", title: "형용사", backendValue: "형용사", wordCount: 80, progress: 10, hasConjugation: true },
  { id: "adjv", title: "형용동사", backendValue: "형용동사", wordCount: 60, progress: 5, hasConjugation: false },
  { id: "verb", title: "동사", backendValue: "동사", wordCount: 150, progress: 30, hasConjugation: true },
];

// --- Sub-Components for Views ---

// MainSelectView
const MainSelectView: React.FC<{ navigate: ReturnType<typeof useNavigate> }> = ({ navigate }) => {
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/user/login");
    } else {
      setIsAuthorized(true);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    alert("로그아웃되었습니다.");
    navigate("/user/login");
  };

  const items: SelectItem[] = [
    {
      id: "level",
      title: "급수별 학습",
      description: `전체 단어 수: 7150개\n진도율: 30%`,
      onClick: () => navigate("/select/level"),
    },
    {
      id: "pattern",
      title: "문형별 학습",
      description: `전체 문형 수: 250개\n진도율: 10%`,
      onClick: () => {
        // 문형별 학습 페이지가 없으므로 임시로 '문장 학습'으로 이동 (기존 MainSelect.tsx와 동일)
        navigate("/learning/study", { state: { level: "N3", partId: "동사", studyType: "sentence" } }); 
      },
    },
    {
      id: "history",
      title: "학습 기록 확인",
      description: `7일 연속 학습 중`,
      onClick: () => navigate("/learning/history"),
    },
  ];

  if (!isAuthorized) {
    return null;
  }

  return (
    <SelectPage
      headerTitle="나의 학습"
      headerExtra={
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm text-white bg-sakura-dark rounded-lg hover:bg-sakura-darker transition"
        >
          로그아웃
        </button>
      }
      showBackButton={false}
      items={items}
    />
  );
};

// LevelSelectView
const LevelSelectView: React.FC<{ navigate: ReturnType<typeof useNavigate> }> = ({ navigate }) => {
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/user/login");
    } else {
      setIsAuthorized(true);
    }
  }, [navigate]);

  if (!isAuthorized) {
    return null;
  }

  return (
    <SelectPage
      headerTitle="급수 선택"
      headerExtra="✿"
      items={levels.map((level) => ({
        id: level.id,
        title: level.title,
        description: `단어 수: ${level.wordCount}개\n진도율: ${level.progress}%`,
        onClick: () => navigate("/select/part", { state: { level: level.id } }),
        buttonClassName: "bg-sakura-dark text-white",
      }))}
    />
  );
};


// PartSelectView
const PartSelectView: React.FC<{ navigate: ReturnType<typeof useNavigate>; location: ReturnType<typeof useLocation> }> = ({ navigate, location }) => {
  const level = location.state?.level;
  
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [incorrectCounts, setIncorrectCounts] = useState<Record<string, IncorrectWordCount>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/user/login");
    } else {
      setIsAuthorized(true);
      fetchIncorrectWordCounts(token);
    }
  }, [navigate, level]);

  const fetchIncorrectWordCounts = useCallback(async (token: string) => {
    if (!level) {
      setLoading(false);
      return;
    }

    const counts: Record<string, IncorrectWordCount> = {};
    let allFetchesSuccessful = true;

    for (const part of partData) {
      try {
        // 예문 학습 틀린 단어 개수
        const sentenceResponse = await fetch(
          `http://localhost:8080/study/incorrect/count?level=${level}&part=${part.backendValue}&studyType=sentence`,
          { headers: { "Authorization": `Bearer ${token}` } }
        );
        const sentenceData = await sentenceResponse.json();

        // 활용형 학습 틀린 단어 개수 (동사/형용사만)
        let conjugationCount = 0;
        if (part.hasConjugation) {
          const conjugationResponse = await fetch(
            `http://localhost:8080/study/incorrect/count?level=${level}&part=${part.backendValue}&studyType=conjugation`,
            { headers: { "Authorization": `Bearer ${token}` } }
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
        allFetchesSuccessful = false;
      }
    }

    setIncorrectCounts(counts);
    setLoading(false);
    // if (!allFetchesSuccessful) { alert("일부 학습 정보를 불러오는 데 실패했습니다."); }
  }, [level]);

  if (!isAuthorized) {
    return null;
  }

  if (!level) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg mb-4">급수를 선택해주세요.</div>
          <button
            onClick={() => navigate("/select/level")}
            className="px-4 py-2 bg-sakura-dark text-white rounded-lg"
          >
            급수 선택하러 가기
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
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
                  onClick={() => navigate("/learning/study", {
                    state: {
                      level: level,
                      partId: part.backendValue,
                      studyType: "sentence" // 통합된 Study.tsx에서 사용
                    }
                  })}
                  className="flex-1 px-3 py-2 bg-sakura text-branch rounded-lg hover:bg-sakura-darker transition text-sm"
                >
                  예문 학습
                </button>
                
                {counts.sentence > 0 && (
                  <button
                    onClick={() => navigate("/learning/study", {
                      state: {
                        level: level,
                        partId: part.backendValue,
                        studyType: "sentence", // 통합된 Study.tsx에서 사용
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
                    onClick={() => navigate("/learning/study", {
                      state: {
                        level: level,
                        partId: part.backendValue,
                        studyType: "conjugation" // 통합된 Study.tsx에서 사용
                      }
                    })}
                    className="flex-1 px-3 py-2 bg-blue-300 text-white rounded-lg hover:bg-blue-500 transition text-sm"
                  >
                    활용형 학습
                  </button>
                  
                  {counts.conjugation > 0 && (
                    <button
                      onClick={() => navigate("/learning/study", {
                        state: {
                          level: level,
                          partId: part.backendValue,
                          studyType: "conjugation", // 통합된 Study.tsx에서 사용
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


// Main Select Component
const Select: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;

    // 현재 경로에 따라 뷰를 분기합니다.
    if (currentPath.endsWith("/select/main")) {
        return <MainSelectView navigate={navigate} />;
    }
    
    if (currentPath.endsWith("/select/level")) {
        return <LevelSelectView navigate={navigate} />;
    }
    
    if (currentPath.endsWith("/select/part")) {
        return <PartSelectView navigate={navigate} location={location} />;
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="text-lg text-red-500">잘못된 접근입니다.</div>
        </div>
    );
}

export default Select;