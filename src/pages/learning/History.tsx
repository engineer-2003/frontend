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
}

type SummaryStatus =
  | "waiting"
  | "loading"
  | "success"
  | "empty"
  | "error";

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

export default function History() {
  const BASE_API_URL =
    import.meta.env.VITE_BACKEND_API_URL || "http://localhost:8080";

  const navigate = useNavigate();

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [totalTime, setTotalTime] = useState(0);
  const [streak, setStreak] = useState(0);

  const [summaryStatus, setSummaryStatus] =
    useState<SummaryStatus>("waiting");

  const [summary, setSummary] =
    useState<WeeklySummary | null>(null);

  const [weekData, setWeekData] = useState<DayStat[]>(
    DAYS.map((day) => ({
      day,
      studyTime: 0,
      accuracy: 0,
      hasRecord: false,
    }))
  );

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
        await fetchAiWeeklySummary(token);
      } else {
        setSummaryStatus("empty");
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
    setSummaryStatus("loading");

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

      if (!response.ok) {
        throw new Error(`AI 요약 API 오류: ${response.status}`);
      }

      const aiData = await response.json();

      if (
        !aiData ||
        typeof aiData.headline !== "string" ||
        !aiData.headline.trim() ||
        typeof aiData.comment !== "string" ||
        !aiData.comment.trim() ||
        !Array.isArray(aiData.points) ||
        aiData.points.length !== 3
      ) {
        throw new Error("AI 요약 응답 형식이 올바르지 않습니다.");
      }

      const validIcons = ["trend", "target", "bulb"];

      const validPoints = aiData.points.every(
        (point: SummaryPoint) =>
          validIcons.includes(point.icon) &&
          typeof point.title === "string" &&
          typeof point.text === "string" &&
          point.text.trim().length > 0
      );

      if (!validPoints) {
        throw new Error("AI 요약 세부 항목이 올바르지 않습니다.");
      }

      setSummary({
        headline: aiData.headline,
        comment: aiData.comment,
        points: aiData.points,
      });

      setSummaryStatus("success");
    } catch (error) {
      console.error("AI 주간 요약 조회 오류:", error);
      setSummaryStatus("error");
    } finally {
      setAiLoading(false);
    }
  };

  // 전체 학습 기록 기준 연속 학습 일수 계산
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

  // 오늘을 포함한 최근 7일 통계 계산
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
      (sum, record) => sum + (record.studyTime || 0),
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

      timeStats[dayOfWeek] += record.studyTime || 0;
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

    const currentStreak = calculateStreak(data);
    setStreak(currentStreak);

    return computedWeekData.some((day) => day.hasRecord);
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

            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="w-full h-auto"
            >
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

              <path
                d={areaPath}
                fill="currentColor"
                fillOpacity={0.18}
                className="text-sakura"
              />

              <path
                d={linePath}
                fill="none"
                stroke="currentColor"
                strokeWidth={5}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-sakura-dark"
              />

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
                {streak}일
              </div>
            </div>
          </div>

          {/* AI 총평 */}
          {summaryStatus === "loading" ? (
            <div className="bg-sakura/10 rounded-xl p-4 mb-4 animate-pulse space-y-2">
              <div className="h-4 bg-sakura/30 rounded w-2/3"></div>
              <div className="h-3 bg-sakura/20 rounded w-full"></div>
              <div className="h-3 bg-sakura/20 rounded w-5/6"></div>
            </div>
          ) : summaryStatus === "empty" ? (
            <div className="bg-sakura/10 rounded-xl p-5 mb-4 text-center">
              <div className="text-sm font-bold text-sakura-dark mb-2">
                이번 주 학습을 시작해보세요!
              </div>

              <p className="text-xs text-gray-700 leading-relaxed">
                아직 최근 7일간의 학습 기록이 없어요.
                오늘 첫 단어 학습을 진행해보세요.
              </p>
            </div>
          ) : summaryStatus === "error" ? (
            <div className="bg-sakura/10 rounded-xl p-5 mb-4 text-center">
              <div className="text-sm font-bold text-sakura-dark mb-2">
                AI 요약을 불러오지 못했어요.
              </div>

              <p className="text-xs text-gray-700 leading-relaxed">
                학습 통계는 정상적으로 확인할 수 있어요.
                잠시 후 다시 방문해주세요.
              </p>
            </div>
          ) : summaryStatus === "success" && summary ? (
            <>
              <div className="bg-sakura/10 rounded-xl p-4 mb-4">
                <div className="text-sm font-bold text-sakura-dark mb-2">
                  {summary.headline}
                </div>

                <p className="text-xs text-gray-700 leading-relaxed">
                  {summary.comment}
                </p>
              </div>

              {/* AI 세부 코멘트 */}
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
            </>
          ) : null}

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
