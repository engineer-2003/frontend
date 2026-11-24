// src/pages/learning/History.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Target, Lightbulb, Flame } from "lucide-react";

interface StudyRecord {
  studyDate: string;
  levelName: string;
  partOfSpeech: string;
  wordCount: number;
  correctCount: number;
  studyTime: number;
  studyDuration: string;
}

interface DayStat {
  day: string;
  studyTime: number;
  accuracy: number;
  hasRecord: boolean;
}

interface SummaryPoint {
  icon: "trend" | "target" | "bulb";
  title: string;
  text: string;
}

interface WeeklySummary {
  headline: string;
  comment: string;
  points: SummaryPoint[];
  streak: number;
}

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

export default function History() {
  const BASE_API_URL =
    import.meta.env.VITE_BACKEND_API_URL || "http://localhost:8080";

  const navigate = useNavigate();

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [totalTime, setTotalTime] = useState(0);

  const [weekData, setWeekData] = useState<DayStat[]>(
    DAYS.map((day) => ({
      day,
      studyTime: 0,
      accuracy: 0,
      hasRecord: false,
    }))
  );

  const [summary, setSummary] = useState<WeeklySummary>({
    headline: "이번 주 학습을 시작해보세요!",
    comment:
      "아직 최근 7일간의 학습 기록이 없어요. 오늘 첫 단어 학습을 진행해보세요.",
    points: [
      {
        icon: "trend",
        title: "강점",
        text: "꾸준한 학습 기록이 쌓이면 강점 요일을 분석해드려요.",
      },
      {
        icon: "target",
        title: "보완할 점",
        text: "정답률이 낮은 요일의 단어를 복습 퀴즈로 다시 확인해보세요.",
      },
      {
        icon: "bulb",
        title: "다음 주 추천",
        text: "하루 15문제씩 목표를 설정하고 연속 학습일을 늘려보세요.",
      },
    ],
    streak: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/user/login");
    } else {
      setIsAuthorized(true);
      fetchStudyRecords(token);
    }
  }, [navigate]);

  const fetchStudyRecords = async (token: string) => {
    try {
      const response = await fetch(`${BASE_API_URL}/study/records`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("token");
          alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
          navigate("/user/login");
          return;
        }

        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: StudyRecord[] = await response.json();

      const sortedData = data.sort(
        (a, b) =>
          new Date(b.studyDate).getTime() -
          new Date(a.studyDate).getTime()
      );

      const hasRecentRecords = calculateWeekStats(sortedData);

      if (hasRecentRecords) {
        fetchAiWeeklySummary(token);
      }
    } catch (error) {
      console.error("학습 기록 조회 오류:", error);
      alert("학습 기록을 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAiWeeklySummary = async (token: string) => {
    setAiLoading(true);

    try {
      const response = await fetch(
        `${BASE_API_URL}/api/chat/weekly-summary`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const aiData = await response.json();

        if (
          aiData &&
          aiData.headline &&
          aiData.comment &&
          Array.isArray(aiData.points)
        ) {
          setSummary((prev) => ({
            ...prev,
            headline: aiData.headline,
            comment: aiData.comment,
            points: aiData.points,
          }));
        }
      }
    } catch (error) {
      console.error(
        "AI 주간 요약 조회 오류 (기본 요약 유지):",
        error
      );
    } finally {
      setAiLoading(false);
    }
  };

  // 전체 기록 기준 연속 학습 일수 계산
  const calculateStreak = (data: StudyRecord[]): number => {
    if (data.length === 0) return 0;

    const uniqueDates = Array.from(
      new Set(data.map((record) => record.studyDate))
    ).sort(
      (a, b) =>
        new Date(b).getTime() - new Date(a).getTime()
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const latestDate = new Date(`${uniqueDates[0]}T00:00:00`);

    if (latestDate < yesterday) return 0;

    let streak = 1;
    let current = latestDate;

    for (let i = 1; i < uniqueDates.length; i++) {
      const prev = new Date(`${uniqueDates[i]}T00:00:00`);

      const diffDays = Math.round(
        (current.getTime() - prev.getTime()) /
          (1000 * 60 * 60 * 24)
      );

      if (diffDays === 1) {
        streak++;
        current = prev;
      } else {
        break;
      }
    }

    return streak;
  };

  const calculateWeekStats = (data: StudyRecord[]): boolean => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentRecords = data.filter((record) => {
      const recordDate = new Date(
        `${record.studyDate}T00:00:00`
      );

      return (
        recordDate >= sevenDaysAgo &&
        recordDate <= today
      );
    });

    const totalSeconds = recentRecords.reduce(
      (sum, record) => sum + record.studyTime,
      0
    );

    setTotalTime(totalSeconds);

    const timeStats = [0, 0, 0, 0, 0, 0, 0];
    const totalWords = [0, 0, 0, 0, 0, 0, 0];
    const totalCorrects = [0, 0, 0, 0, 0, 0, 0];

    recentRecords.forEach((record) => {
      const recordDate = new Date(
        `${record.studyDate}T00:00:00`
      );

      const dayOfWeek = recordDate.getDay();

      timeStats[dayOfWeek] += record.studyTime;
      totalWords[dayOfWeek] += record.wordCount || 0;
      totalCorrects[dayOfWeek] += record.correctCount || 0;
    });

    const computedWeekData: DayStat[] = DAYS.map(
      (day, index) => {
        const hasRecord = totalWords[index] > 0;

        const accuracy = hasRecord
          ? Math.round(
              (totalCorrects[index] / totalWords[index]) * 100
            )
          : 0;

        return {
          day,
          studyTime: timeStats[index],
          accuracy,
          hasRecord,
        };
      }
    );

    setWeekData(computedWeekData);

    // 기본 요약 설정
    const streak = calculateStreak(data);
    const activeDays = computedWeekData.filter(
      (day) => day.hasRecord
    );

    if (activeDays.length > 0) {
      const bestDay = [...activeDays].sort(
        (a, b) => b.accuracy - a.accuracy
      )[0];

      const lowestDay = [...activeDays].sort(
        (a, b) => a.accuracy - b.accuracy
      )[0];

      const mostStudiedDay = [...activeDays].sort(
        (a, b) => b.studyTime - a.studyTime
      )[0];

      const recentLevel = recentRecords[0]?.levelName || "N4";
      const recentPos =
        recentRecords[0]?.partOfSpeech || "동사";

      setSummary({
        headline:
          bestDay.accuracy >= 85
            ? "이번 주 실력이 꾸준히 오르고 있어요!"
            : "이번 주도 성실하게 학습을 이어갔어요!",

        comment: `최근 7일 동안 총 ${activeDays.length}일 학습을 완료했습니다. ${mostStudiedDay.day}요일에 가장 오래 학습했고, ${bestDay.day}요일에 ${bestDay.accuracy}%로 가장 높은 정답률을 기록했어요.`,

        points: [
          {
            icon: "trend",
            title: "강점",
            text: `${bestDay.day}요일에 정답률 ${bestDay.accuracy}%로 가장 뛰어난 집중력을 보여주었어요.`,
          },
          {
            icon: "target",
            title: "보완할 점",
            text:
              activeDays.length > 1 &&
              lowestDay.day !== bestDay.day
                ? `${lowestDay.day}요일 정답률(${lowestDay.accuracy}%)이 상대적으로 낮아요. 해당 날의 오답을 복습해보세요.`
                : "학습한 단어를 다음 날 복습 퀴즈로 한 번 더 점검해보세요.",
          },
          {
            icon: "bulb",
            title: "다음 주 추천",
            text: `최근 학습한 ${recentPos} · ${recentLevel} 단어를 하루 15문제씩 이어가면 목표 달성에 도움이 돼요.`,
          },
        ],

        streak,
      });

      return true;
    } else {
      setSummary((prev) => ({
        ...prev,
        streak,
      }));

      return false;
    }
  };

  if (!isAuthorized) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-sakura-dark border-t-transparent mb-4"></div>
          <div className="text-lg text-gray-600">
            학습 기록을 불러오는 중...
          </div>
        </div>
      </div>
    );
  }

  const weekStats = weekData.map((day) => day.studyTime);
  const studiedDays = weekData.filter((day) => day.hasRecord);

  const avgAccuracy =
    studiedDays.length > 0
      ? Math.round(
          studiedDays.reduce(
            (sum, day) => sum + day.accuracy,
            0
          ) / studiedDays.length
        )
      : 0;

  const avgStudyTime = Math.round(
    totalTime / weekData.length
  );

  const maxTime = Math.max(...weekStats, 1);

  const formatTime = (seconds: number): string => {
    if (seconds === 0) return "0초";

    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    const parts: string[] = [];

    if (h > 0) parts.push(`${h}시간`);
    if (m > 0) parts.push(`${m}분`);
    if (s > 0 || parts.length === 0) {
      parts.push(`${s}초`);
    }

    return parts.join(" ");
  };

  const formatChartTime = (seconds: number): string => {
    if (seconds === 0) return "";

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return remainingSeconds > 0
        ? `${minutes}분${remainingSeconds}초`
        : `${minutes}분`;
    }

    return `${remainingSeconds}초`;
  };

  // 꺾은선 그래프 좌표 계산
  const W = 700;
  const H = 190;
  const padTop = 40;
  const padBottom = 14;
  const colW = W / weekData.length;
  const chartH = H - padTop - padBottom;

  const points = weekData.map((day, index) => ({
    x: colW * index + colW / 2,
    y: padTop + (1 - day.studyTime / maxTime) * chartH,
    time: day.studyTime,
  }));

  const linePath = points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`
    )
    .join(" ");

  const areaPath = `${linePath} L ${
    points[points.length - 1].x
  } ${H - padBottom} L ${points[0].x} ${
    H - padBottom
  } Z`;

  const renderIcon = (type: string) => {
    const cls = "w-4 h-4 text-white";

    if (type === "trend") {
      return <TrendingUp className={cls} />;
    }

    if (type === "target") {
      return <Target className={cls} />;
    }

    return <Lightbulb className={cls} />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white sticky top-0 z-10">
        <div className="relative flex items-center justify-center px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="absolute left-4 text-gray-700 hover:text-gray-900 transition-colors"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <h1 className="text-xl font-bold text-gray-900">
            학습 기록
          </h1>
        </div>
      </div>

      <div className="px-4 py-6 max-w-md mx-auto space-y-4">
        {/* 주간 통계 */}
        <div className="bg-white rounded-2xl p-6 animate-fade-in-slide">
          <div className="text-center mb-6">
            <div className="text-sm text-gray-600 mb-2">
              최근 7일 총 학습 시간
            </div>

            <div className="text-3xl font-bold text-sakura-dark">
              {formatTime(totalTime)}
            </div>
          </div>

          <div className="bg-sakura/5 rounded-xl p-4">
            <h3 className="text-sm font-bold text-gray-700 mb-2 text-center">
              주간 학습 통계
            </h3>

            {/* 꺾은선 그래프 */}
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="w-full h-auto"
            >
              {/* 가로 보조선 */}
              {[0, 0.5, 1].map((r, index) => (
                <line
                  key={index}
                  x1={0}
                  x2={W}
                  y1={padTop + r * chartH}
                  y2={padTop + r * chartH}
                  stroke="#e5e7eb"
                  strokeDasharray="6 6"
                  strokeWidth={2}
                />
              ))}

              {/* 그래프 영역 */}
              <path
                d={areaPath}
                fill="currentColor"
                fillOpacity={0.18}
                className="text-sakura"
              />

              {/* 그래프 선 */}
              <path
                d={linePath}
                fill="none"
                stroke="currentColor"
                strokeWidth={5}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-sakura-dark"
              />

              {/* 그래프 점과 시간 라벨 */}
              {points.map((point, index) => (
                <g key={index}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={9}
                    fill="#fff"
                    strokeWidth={5}
                    className="stroke-sakura-dark"
                  />

                  {point.time > 0 && (
                    <text
                      x={point.x}
                      y={point.y - 18}
                      textAnchor="middle"
                      fontSize={22}
                      fontWeight={700}
                      className="fill-sakura-dark"
                    >
                      {formatChartTime(point.time)}
                    </text>
                  )}
                </g>
              ))}
            </svg>

            {/* 요일 및 정답률 */}
            <div className="relative grid grid-cols-7 mt-1">
              {weekData.map((day, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center"
                >
                  <span className="text-xs font-bold text-gray-700">
                    {day.day}
                  </span>

                  <span className="text-[11px] font-semibold text-sakura-dark mt-1">
                    {day.hasRecord ? `${day.accuracy}%` : "-"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI 주간 요약 */}
        <div className="bg-white rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">
              AI 주간 요약 코멘트
            </h3>

            {aiLoading && (
              <span className="text-xs text-sakura-dark animate-pulse">
                AI 분석 중...
              </span>
            )}
          </div>

          {/* 핵심 지표 */}
          <div className="grid grid-cols-3 gap-2 mb-4 items-stretch">
            <div className="bg-gray-50 rounded-xl p-3 flex flex-col items-center justify-start text-center">
              <div className="text-[10px] text-gray-700 whitespace-nowrap">
                평균 정답률
              </div>

              <div className="text-xl font-bold text-sakura-dark mt-1 h-7 flex items-center justify-center">
                {avgAccuracy}%
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 flex flex-col items-center justify-start text-center">
              <div className="text-[10px] text-gray-700 whitespace-nowrap">
                평균 학습 시간
              </div>

              <div className="text-xl font-bold text-sakura-dark mt-1 h-7 flex items-center justify-center">
                {Math.round(avgStudyTime / 60)}분
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 flex flex-col items-center justify-start text-center">
              <div className="text-[10px] text-gray-700 whitespace-nowrap">
                연속 학습
              </div>

              <div className="text-xl font-bold text-sakura-dark mt-1 h-7 flex items-center justify-center gap-1">
                <Flame className="w-4 h-4 text-sakura-dark" />
                {summary.streak}일
              </div>
            </div>
          </div>

          {/* AI 총평 */}
          {aiLoading ? (
            <div className="bg-sakura/10 rounded-xl p-4 mb-4 animate-pulse space-y-2">
              <div className="h-4 bg-sakura/30 rounded w-2/3"></div>
              <div className="h-3 bg-sakura/20 rounded w-full"></div>
              <div className="h-3 bg-sakura/20 rounded w-5/6"></div>
            </div>
          ) : (
            <div className="bg-sakura/10 rounded-xl p-4 mb-4">
              <div className="text-sm font-bold text-sakura-dark mb-2">
                {summary.headline}
              </div>

              <p className="text-xs text-gray-700 leading-relaxed">
                {summary.comment}
              </p>
            </div>
          )}

          {/* 세부 코멘트 */}
          <ul className="space-y-3">
            {summary.points.map((point, index) => (
              <li
                key={index}
                className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl animate-slide-in"
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <div className="flex-shrink-0 w-8 h-8 bg-[#d4f08e] rounded-full flex items-center justify-center">
                  {renderIcon(point.icon)}
                </div>

                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-gray-900">
                    {point.title}
                  </span>

                  <span className="text-xs text-gray-600 leading-relaxed">
                    {point.text}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <div className="text-center mt-4 pt-4">
            <span className="text-[11px] text-gray-400">
              ✿ 하루의 일본어
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
