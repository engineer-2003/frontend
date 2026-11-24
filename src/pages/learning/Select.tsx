// src/pages/learning/Select.tsx
import React, { useEffect, useState } from "react";
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
const defaultLevels: string[] = ["N5", "N4", "N3", "N2", "N1"];

const partData: Part[] = [
  {
    id: "noun",
    title: "명사",
    backendValue: "명사",
    wordCount: 120,
    progress: 20,
    hasConjugation: false,
  },
  {
    id: "adj",
    title: "형용사",
    backendValue: "형용사",
    wordCount: 80,
    progress: 10,
    hasConjugation: true,
  },
  {
    id: "adjv",
    title: "형용동사",
    backendValue: "형용동사",
    wordCount: 60,
    progress: 5,
    hasConjugation: false,
  },
  {
    id: "verb",
    title: "동사",
    backendValue: "동사",
    wordCount: 150,
    progress: 30,
    hasConjugation: true,
  },
];

// --- Sub-Components for Views ---

// MainSelectView
const MainSelectView: React.FC<{
  navigate: ReturnType<typeof useNavigate>;
}> = ({ navigate }) => {
  const BASE_API_URL =
    import.meta.env.VITE_BACKEND_API_URL || "http://localhost:8080";

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [overviewStats, setOverviewStats] =
    useState<OverviewStats | null>(null);
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
      const response = await fetch(
        `${BASE_API_URL}/study/stats/overview`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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
      buttonClassName:
        "bg-sakura text-white hover:opacity-90 transition-all",
    },
    {
      id: "history",
      title: "학습 기록 확인",
      description: `${overviewStats?.consecutiveDays || 0}일 연속 학습 중`,
      onClick: () => navigate("/learning/history"),
      buttonClassName:
        "bg-sakura text-white hover:opacity-90 transition-all",
    },
    {
      id: "chatbot",
      title: "AI 챗봇과 대화하기",
      description: "학습한 내용을 챗봇으로 확인하기",
      onClick: () => navigate("/learning/chatbot"),
      buttonClassName:
        "bg-leaf text-white hover:opacity-90 transition-all",
    },
  ];

  return (
    <SelectPage
      headerTitle="나의 학습"
      headerExtra={
        <div className="flex items-center space-x-2">
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-white bg-sakura rounded-xl hover:opacity-90 transition-all"
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
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        </button>
      }
      showBackButton={false}
      items={items}
    />
  );
};

// LevelSelectView
const LevelSelectView: React.FC<{
  navigate: ReturnType<typeof useNavigate>;
}> = ({ navigate }) => {
  const BASE_API_URL =
    import.meta.env.VITE_BACKEND_API_URL || "http://localhost:8080";

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
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLevelStats(Array.isArray(data) ? data : []);
      } else {
        console.error("급수별 학습 통계 응답 오류:", response.status);
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

  const displayLevels: LevelStat[] =
    levelStats.length > 0
      ? levelStats
      : defaultLevels.map((lvl) => ({
          level: lvl,
          totalWords: 0,
          studiedWords: 0,
          progress: 0,
        }));

  return (
    <SelectPage
      headerTitle="급수 선택"
      headerExtra="✿"
      items={displayLevels.map((stat) => ({
        id: stat.level,
        title: stat.level,
        description: `전체 단어: ${stat.totalWords}개\n학습한 단어: ${stat.studiedWords}개\n진도율: ${stat.progress}%`,
        onClick: () =>
          navigate("/select/part", {
            state: { level: stat.level },
          }),
        buttonClassName:
          "bg-sakura text-white hover:opacity-90 transition-all",
      }))}
    />
  );
};

// PartSelectView
const PartSelectView: React.FC<{
  navigate: ReturnType<typeof useNavigate>;
  location: ReturnType<typeof useLocation>;
}> = ({ navigate, location }) => {
  const BASE_API_URL =
    import.meta.env.VITE_BACKEND_API_URL || "http://localhost:8080";

  const level = location.state?.level;

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [incorrectCounts, setIncorrectCounts] = useState<
    Record<string, IncorrectWordCount>
  >({});
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
      const statsResponse = await fetch(
        `${BASE_API_URL}/study/stats/part?level=${level}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setPartStats(statsData);
      }

      // 오늘의 학습 추천에 사용할 오답 개수 조회
      const counts: Record<string, IncorrectWordCount> = {};

      for (const part of partData) {
        try {
          const sentenceResponse = await fetch(
            `${BASE_API_URL}/study/incorrect/count?level=${level}&part=${part.backendValue}&studyType=sentence`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const sentenceData = await sentenceResponse.json();

          let conjugationCount = 0;

          if (part.hasConjugation) {
            const conjugationResponse = await fetch(
              `${BASE_API_URL}/study/incorrect/count?level=${level}&part=${part.backendValue}&studyType=conjugation`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            const conjugationData = await conjugationResponse.json();
            conjugationCount = conjugationData.count || 0;
          }

          counts[part.id] = {
            sentence: sentenceData.count || 0,
            conjugation: conjugationCount,
          };
        } catch (error) {
          console.error(
            `틀린 단어 개수 조회 실패 - ${part.title}:`,
            error
          );

          counts[part.id] = {
            sentence: 0,
            conjugation: 0,
          };
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
            className="px-4 py-2 bg-sakura text-white rounded-lg hover:opacity-90 transition-all"
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

  // 최다 오답 품사 계산
  const partTotals = partData.map((part) => {
    const count = incorrectCounts[part.id] || {
      sentence: 0,
      conjugation: 0,
    };

    return {
      part,
      sentence: count.sentence,
      conjugation: count.conjugation,
      total: count.sentence + count.conjugation,
    };
  });

  const maxIncorrect = Math.max(
    ...partTotals.map((part) => part.total),
    0
  );

  const topParts =
    maxIncorrect > 0
      ? partTotals.filter((part) => part.total === maxIncorrect)
      : [];

  const primaryTarget = topParts[0];

  // 오늘의 학습 추천
  const recommendationItem: SelectItem = {
    id: "recommendation",
    title: "💡 오늘의 학습 추천",
    customContent:
      maxIncorrect > 0 && primaryTarget ? (
        <div className="bg-sakura/10 border border-sakura/30 rounded-xl p-3.5 text-left space-y-2.5">
          <p className="text-sm text-gray-800 leading-relaxed">
            <span className="font-bold text-sakura-dark">
              {topParts.map((item) => item.part.title).join(" · ")}
            </span>
            에서 틀린 단어가 가장 많아요! (총{" "}
            <span className="font-bold text-sakura-dark">
              {maxIncorrect}개
            </span>
            )
            <br />
            오답이 누적된 품사부터 집중 복습하는 것을 추천해요.
          </p>

          <button
            onClick={() =>
              navigate("/learning/study", {
                state: {
                  level,
                  partId: primaryTarget.part.backendValue,
                  studyType:
                    primaryTarget.sentence >= primaryTarget.conjugation
                      ? "sentence"
                      : "conjugation",
                  retryMode: true,
                },
              })
            }
            className="w-full py-2.5 bg-sakura text-white rounded-xl text-xs font-bold hover:opacity-90 transition-all"
          >
            {primaryTarget.part.title} 틀린 단어 바로 복습하기 →
          </button>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-left">
          <p className="text-sm text-gray-700 leading-relaxed">
            아직 {level} 급수에서 틀린 단어가 없어요!
            <br />
            <span className="font-bold text-sakura-dark">동사</span> 또는{" "}
            <span className="font-bold text-sakura-dark">명사</span>부터
            차근차근 학습을 시작해보세요.
          </p>
        </div>
      ),
    onClick: () => {},
  };

  // 품사별 학습 선택지
  const partItems: SelectItem[] = partData.map((part) => {
    const stat = partStats.find(
      (item) => item.part === part.backendValue
    );

    return {
      id: part.id,
      title: part.title,
      description: `전체 단어: ${stat?.totalWords || part.wordCount}개\n학습한 단어: ${stat?.studiedWords || 0}개\n진도율: ${stat?.progress || 0}%`,
      customContent: (
        <div className="space-y-3">
          <button
            onClick={() =>
              navigate("/learning/study", {
                state: {
                  level,
                  partId: part.backendValue,
                  studyType: "sentence",
                },
              })
            }
            className="w-full px-3 py-3 bg-sakura text-white rounded-xl hover:opacity-90 transition-all font-semibold text-sm"
          >
            예문 학습
          </button>

          {part.hasConjugation && (
            <button
              onClick={() =>
                navigate("/learning/study", {
                  state: {
                    level,
                    partId: part.backendValue,
                    studyType: "conjugation",
                  },
                })
              }
              className="w-full px-3 py-3 bg-leaf text-white rounded-xl hover:opacity-90 transition-all font-semibold text-sm"
            >
              활용형 학습
            </button>
          )}
        </div>
      ),
      onClick: () => {},
    };
  });

  return (
    <SelectPage
      headerTitle={`${level} 품사 선택`}
      headerExtra="✿"
      items={[recommendationItem, ...partItems]}
    />
  );
};

// Select
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
    return (
      <PartSelectView
        navigate={navigate}
        location={location}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-lg text-red-500">잘못된 접근입니다.</div>
    </div>
  );
};

export default Select;