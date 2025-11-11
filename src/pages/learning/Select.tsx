// src/pages/learning/Select.tsx
import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SelectPage from "../../components/SelectPage";

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

type OverviewStats = {
  totalWords: number;
  studiedWords: number;
  progress: number;
  consecutiveDays: number;
};

type LevelStat = {
  level: string;
  totalWords: number;
  studiedWords: number;
  progress: number;
};

type PartStat = {
  part: string;
  totalWords: number;
  studiedWords: number;
  progress: number;
};

// --- Data ---
const partData: Part[] = [
  { id: "noun", title: "명사", backendValue: "명사", wordCount: 120, progress: 20, hasConjugation: false },
  { id: "adj", title: "형용사", backendValue: "형용사", wordCount: 80, progress: 10, hasConjugation: true },
  { id: "adjv", title: "형용동사", backendValue: "형용동사", wordCount: 60, progress: 5, hasConjugation: false },
  { id: "verb", title: "동사", backendValue: "동사", wordCount: 150, progress: 30, hasConjugation: true },
];

// --- Sub-Components for Views ---

// MainSelectView
const MainSelectView: React.FC<{ navigate: ReturnType<typeof useNavigate> }> = ({ navigate }) => {
  const BASE_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8080';
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [overviewStats, setOverviewStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/user/login");
    } else {
      setIsAuthorized(true);
      fetchOverviewStats(token);
    }
  }, [navigate]);

  const fetchOverviewStats = async (token: string) => {
    try {
      const response = await fetch(`${BASE_API_URL}/study/stats/overview`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setOverviewStats(data);
      }
    } catch (error) {
      console.error("전체 학습 통계 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    alert("로그아웃되었습니다.");
    navigate("/user/login");
  };

  if (!isAuthorized || loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  const items: SelectItem[] = [
    {
      id: "level",
      title: "급수별 학습",
      description: `전체 단어 수: ${overviewStats?.totalWords || 0}개\n학습한 단어: ${overviewStats?.studiedWords || 0}개\n진도율: ${overviewStats?.progress || 0}%`,
      onClick: () => navigate("/select/level"),
      buttonClassName: "bg-gradient-to-r from-sakura to-sakura-dark text-white hover:shadow-md transition-all transform hover:-translate-y-0.5 active:translate-y-0",
    },
    {
      id: "history",
      title: "학습 기록 확인",
      description: `${overviewStats?.consecutiveDays || 0}일 연속 학습 중`,
      onClick: () => navigate("/learning/history"),
      buttonClassName: "bg-gradient-to-r from-blue-400 to-blue-500 text-white hover:shadow-md transition-all transform hover:-translate-y-0.5 active:translate-y-0",
    },
    {
      id: "chatbot",
      title: "AI 챗봇과 대화하기",
      description: "학습한 내용을 챗봇으로 확인하기",
      onClick: () => navigate("/learning/chatbot"),
      buttonClassName: "bg-gradient-to-r from-green-400 to-green-500 text-white hover:shadow-md transition-all transform hover:-translate-y-0.5 active:translate-y-0",
    },
  ];

  return (
    <SelectPage
      headerTitle="나의 학습"
      headerExtra={
        <div className="flex items-center space-x-2">
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-white bg-gradient-to-r from-sakura to-sakura-dark rounded-xl hover:shadow-md transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            로그아웃
          </button>
        </div>
      }
      headerLeft={
        <button
          onClick={() => navigate("/")}
          className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
          aria-label="홈으로"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </button>
      }
      showBackButton={false}
      items={items}
    />
  );
};

const LevelSelectView: React.FC<{ navigate: ReturnType<typeof useNavigate> }> = ({ navigate }) => {
  const BASE_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8080';
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [levelStats, setLevelStats] = useState<LevelStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/user/login");
    } else {
      setIsAuthorized(true);
      fetchLevelStats(token);
    }
  }, [navigate]);

  const fetchLevelStats = async (token: string) => {
    try {
      const response = await fetch(`${BASE_API_URL}/study/stats/level`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setLevelStats(data);
      }
    } catch (error) {
      console.error("급수별 학습 통계 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthorized || loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  return (
    <SelectPage
      headerTitle="급수 선택"
      headerExtra="✿"
      items={levelStats.map((stat, index) => {
        // N5부터 N1까지 점점 진해지는 색상
        const gradientColors = [
          "from-sakura-lighter to-sakura-light",
          "from-sakura-light to-sakura",
          "from-sakura to-sakura-dark",
          "from-sakura-dark to-sakura-darker",
          "from-sakura-darker to-[#C04A5F]",
        ];
        
        return {
          id: stat.level,
          title: stat.level,
          description: `전체 단어: ${stat.totalWords}개\n학습한 단어: ${stat.studiedWords}개\n진도율: ${stat.progress}%`,
          onClick: () => navigate("/select/part", { state: { level: stat.level } }),
          buttonClassName: `bg-gradient-to-r ${gradientColors[index]} text-white hover:shadow-md transition-all transform hover:-translate-y-0.5 active:translate-y-0`,
        };
      })}
    />
  );
};

const PartSelectView: React.FC<{ navigate: ReturnType<typeof useNavigate>; location: ReturnType<typeof useLocation> }> = ({ navigate, location }) => {
  const BASE_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8080';
  const level = location.state?.level;
  
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [incorrectCounts, setIncorrectCounts] = useState<Record<string, IncorrectWordCount>>({});
  const [partStats, setPartStats] = useState<PartStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/user/login");
    } else {
      setIsAuthorized(true);
      if (level) {
        fetchData(token);
      } else {
        setLoading(false);
      }
    }
  }, [navigate, level]);

  const fetchData = async (token: string) => {
    try {
      // 품사별 통계 조회
      const statsResponse = await fetch(`${BASE_API_URL}/study/stats/part?level=${level}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setPartStats(statsData);
      }

      // 틀린 단어 개수 조회
      const counts: Record<string, IncorrectWordCount> = {};
      for (const part of partData) {
        try {
          const sentenceResponse = await fetch(
            `${BASE_API_URL}/study/incorrect/count?level=${level}&part=${part.backendValue}&studyType=sentence`,
            { headers: { "Authorization": `Bearer ${token}` } }
          );
          const sentenceData = await sentenceResponse.json();

          let conjugationCount = 0;
          if (part.hasConjugation) {
            const conjugationResponse = await fetch(
              `${BASE_API_URL}/study/incorrect/count?level=${level}&part=${part.backendValue}&studyType=conjugation`,
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
        }
      }

      setIncorrectCounts(counts);
    } catch (error) {
      console.error("데이터 조회 실패:", error);
    } finally {
      setLoading(false);
    }
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
            onClick={() => navigate("/select/level")}
            className="px-4 py-2 bg-gradient-to-r from-sakura to-sakura-dark text-white rounded-lg hover:shadow-md transition-all"
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
        const stat = partStats.find(s => s.part === part.backendValue);
        
        return {
          id: part.id,
          title: part.title,
          description: `전체 단어: ${stat?.totalWords || part.wordCount}개\n학습한 단어: ${stat?.studiedWords || 0}개\n진도율: ${stat?.progress || 0}%`,
          customContent: (
            <div className="space-y-3">
              <div className="flex gap-2">
                <button
                  onClick={() => navigate("/learning/study", {
                    state: {
                      level: level,
                      partId: part.backendValue,
                      studyType: "sentence"
                    }
                  })}
                  className="flex-1 px-3 py-3 bg-gradient-to-r from-sakura to-sakura-dark text-white rounded-xl hover:shadow-md transition-all font-semibold text-sm transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  예문 학습
                </button>
                
                {counts.sentence > 0 && (
                  <button
                    onClick={() => navigate("/learning/study", {
                      state: {
                        level: level,
                        partId: part.backendValue,
                        studyType: "sentence",
                        retryMode: true
                      }
                    })}
                    className="flex-1 px-3 py-3 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-xl hover:shadow-md transition-all font-semibold text-sm transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    재학습 ({counts.sentence}개)
                  </button>
                )}
              </div>

              {part.hasConjugation && (
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate("/learning/study", {
                      state: {
                        level: level,
                        partId: part.backendValue,
                        studyType: "conjugation"
                      }
                    })}
                    className="flex-1 px-3 py-3 bg-gradient-to-r from-purple-400 to-purple-500 text-white rounded-xl hover:shadow-md transition-all font-semibold text-sm transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    활용형 학습
                  </button>
                  
                  {counts.conjugation > 0 && (
                    <button
                      onClick={() => navigate("/learning/study", {
                        state: {
                          level: level,
                          partId: part.backendValue,
                          studyType: "conjugation",
                          retryMode: true
                        }
                      })}
                      className="flex-1 px-3 py-3 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-xl hover:shadow-md transition-all font-semibold text-sm transform hover:-translate-y-0.5 active:translate-y-0"
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

const Select: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;

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