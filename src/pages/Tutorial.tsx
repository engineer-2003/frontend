// src/pages/Tutorial.tsx
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  Target,
  Lightbulb,
  Flame,
  Send,
} from "lucide-react";

import SelectPage from "../components/SelectPage";
import StudyPage from "../components/StudyPage";
import type { StudyOption } from "./learning/Study";

interface TutorialAnswerResponse {
  correct: boolean;
  userAnswer: string;
  correctAnswer: string;
  message: string;
  hint?: string;
}

interface TutorialMessage {
  id: number;
  text: string;
  sender: "user" | "bot";
  time: string;
}

const tutorialOptions: StudyOption[] = [
  { value: "学校", label: "がっこう" },
  { value: "会社", label: "かいしゃ" },
  { value: "先生", label: "せんせい" },
  { value: "友達", label: "ともだち" },
];

const tutorialMessages: TutorialMessage[] = [
  {
    id: 1,
    text: "안녕! 최근에 N5 명사를 공부했네! 오늘 복습하고 싶은 일본어 단어나 문장을 말해줄래?",
    sender: "bot",
    time: "오전 10:30",
  },
  {
    id: 2,
    text: "学校라는 단어를 복습하고 싶어.",
    sender: "user",
    time: "오전 10:31",
  },
  {
    id: 3,
    text: "좋아! 学校는 がっこう라고 읽고, '학교'라는 뜻이야. 예문으로 私は学校に行きます。(저는 학교에 갑니다.)처럼 사용할 수 있어.",
    sender: "bot",
    time: "오전 10:31",
  },
];

const mockWeekData = [
  { day: "일", studyTime: 600, accuracy: 80 },
  { day: "월", studyTime: 900, accuracy: 90 },
  { day: "화", studyTime: 450, accuracy: 85 },
  { day: "수", studyTime: 1200, accuracy: 95 },
  { day: "목", studyTime: 750, accuracy: 90 },
  { day: "금", studyTime: 1500, accuracy: 95 },
  { day: "토", studyTime: 900, accuracy: 90 },
];

// 튜토리얼 화면의 실제 UI는 보여주기만 하고 조작은 막는 래퍼
// - className="contents": 레이아웃에 영향을 주지 않음 (화면 구성 그대로 유지)
// - pointer-events-none: 마우스/터치 클릭 차단
// - inert: 키보드(Tab, Enter, Space) 포커스 및 조작 차단
const DisabledArea = ({ children }: { children: ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current as
      | (HTMLDivElement & { inert?: boolean })
      | null;
    if (el) {
      el.inert = true;
    }
  }, []);

  return (
    <div
      ref={ref}
      className="contents pointer-events-none select-none"
      aria-disabled="true"
    >
      {children}
    </div>
  );
};

const Tutorial = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const totalSteps = 8;

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleFinish = () => {
    navigate("/select/main");
  };

  // 튜토리얼 전용 정답 확인: 실제 서버 요청 및 학습 기록 저장 없음
  const handleCheckAnswer = async (
    answer: string
  ): Promise<TutorialAnswerResponse> => {
    const correctAnswer = "学校";
    const correct = answer === correctAnswer;

    return {
      correct,
      userAnswer: answer,
      correctAnswer,
      message: correct
        ? "정답입니다!"
        : "아쉽지만 다시 확인해 보세요.",
      hint: "학교는 일본어로 がっこう라고 읽습니다.",
    };
  };

  // 튜토리얼 상단 안내 영역
  const TutorialGuide = ({
    step,
    title,
    description,
  }: {
    step: number;
    title: string;
    description: string;
  }) => (
    <div className="bg-white px-4 py-5 shadow-sm">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-sakura-dark">
            튜토리얼 {step} / {totalSteps}
          </span>
        </div>

        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-sakura rounded-full transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        <h2 className="text-lg font-bold text-gray-900 mb-2">
          {title}
        </h2>

        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
          {description}
        </p>
      </div>
    </div>
  );

  // 공통 하단 버튼
  const TutorialNavigation = ({
    previousLabel = "이전",
    nextLabel = "다음",
    onNext = handleNext,
    onPrevious = handlePrevious,
  }: {
    previousLabel?: string;
    nextLabel?: string;
    onNext?: () => void;
    onPrevious?: () => void;
  }) => (
    <div className="fixed bottom-0 left-0 right-0 px-4 pb-5 pt-4 bg-white shadow-[0_-4px_16px_rgba(0,0,0,0.06)] z-20">
      <div className="max-w-md mx-auto flex gap-3">
        <button
          onClick={onPrevious}
          className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
        >
          {previousLabel}
        </button>

        <button
          onClick={onNext}
          className="flex-1 py-3 bg-sakura text-white rounded-xl font-bold hover:opacity-90 transition-all"
        >
          {nextLabel}
        </button>
      </div>
    </div>
  );

  // 1단계: 나의 학습
  if (currentStep === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <TutorialGuide
          step={1}
          title="하루의 일본어에 오신 것을 환영합니다!"
          description={
            "이곳에서 일본어 단어를 학습하고, 학습 기록을 확인하거나 AI 챗봇과 대화할 수 있어요.\n먼저 급수별 학습을 선택해 볼게요."
          }
        />

        <DisabledArea>
          <SelectPage
            headerTitle="나의 학습"
            showBackButton={false}
            items={[
              {
                id: "level",
                title: "급수별 학습",
                description:
                  "JLPT 급수에 맞춰 일본어 단어를 학습할 수 있어요.",
                onClick: handleNext,
              },
              {
                id: "history",
                title: "학습 기록 확인",
                description:
                  "지금까지의 학습 기록과 진도율을 확인할 수 있어요.",
                onClick: handleNext,
              },
              {
                id: "chatbot",
                title: "AI 챗봇과 대화하기",
                description:
                  "학습한 내용을 바탕으로 AI 챗봇과 대화할 수 있어요.",
                onClick: handleNext,
              },
            ]}
          />
        </DisabledArea>

        <TutorialNavigation
          previousLabel="종료"
          onPrevious={handleFinish}
          onNext={handleNext}
        />
      </div>
    );
  }

  // 2단계: 급수 선택
  if (currentStep === 1) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <TutorialGuide
          step={2}
          title="학습할 JLPT 급수를 선택해요."
          description={
            "N5부터 N1까지 원하는 급수를 선택할 수 있어요.\n각 급수의 전체 단어 수와 학습 진도도 확인할 수 있습니다."
          }
        />

        <DisabledArea>
          <SelectPage
            headerTitle="급수 선택"
            showBackButton={false}
            items={["N5", "N4", "N3", "N2", "N1"].map((level) => ({
              id: level,
              title: level,
              description:
                "전체 단어: 120개\n학습한 단어: 0개\n진도율: 0%",
              onClick: handleNext,
            }))}
          />
        </DisabledArea>

        <TutorialNavigation />
      </div>
    );
  }

  // 3단계: 품사 선택
  if (currentStep === 2) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <TutorialGuide
          step={3}
          title="학습할 품사를 선택해요."
          description={
            "명사, 형용사, 형용동사, 동사 중 원하는 품사를 선택할 수 있어요.\n품사에 따라 예문 학습과 활용형 학습을 진행할 수 있습니다."
          }
        />

        <DisabledArea>
          <SelectPage
            headerTitle="N5 품사 선택"
            showBackButton={false}
            items={[
              {
                id: "noun",
                title: "명사",
                description:
                  "전체 단어: 120개\n학습한 단어: 0개\n진도율: 0%",
                onClick: handleNext,
                customContent: (
                  <button
                    onClick={handleNext}
                    className="w-full px-3 py-3 bg-sakura text-white rounded-xl hover:opacity-90 transition-all font-semibold text-sm"
                  >
                    예문 학습
                  </button>
                ),
              },
              {
                id: "adjective",
                title: "형용사",
                description:
                  "전체 단어: 80개\n학습한 단어: 0개\n진도율: 0%",
                onClick: handleNext,
                customContent: (
                  <div className="space-y-3">
                    <button
                      onClick={handleNext}
                      className="w-full px-3 py-3 bg-sakura text-white rounded-xl hover:opacity-90 transition-all font-semibold text-sm"
                    >
                      예문 학습
                    </button>

                    <button
                      onClick={handleNext}
                      className="w-full px-3 py-3 bg-leaf text-white rounded-xl hover:opacity-90 transition-all font-semibold text-sm"
                    >
                      활용형 학습
                    </button>
                  </div>
                ),
              },
              {
                id: "adjectival-verb",
                title: "형용동사",
                description:
                  "전체 단어: 60개\n학습한 단어: 0개\n진도율: 0%",
                onClick: handleNext,
                customContent: (
                  <button
                    onClick={handleNext}
                    className="w-full px-3 py-3 bg-sakura text-white rounded-xl hover:opacity-90 transition-all font-semibold text-sm"
                  >
                    예문 학습
                  </button>
                ),
              },
              {
                id: "verb",
                title: "동사",
                description:
                  "전체 단어: 150개\n학습한 단어: 0개\n진도율: 0%",
                onClick: handleNext,
                customContent: (
                  <div className="space-y-3">
                    <button
                      onClick={handleNext}
                      className="w-full px-3 py-3 bg-sakura text-white rounded-xl hover:opacity-90 transition-all font-semibold text-sm"
                    >
                      예문 학습
                    </button>

                    <button
                      onClick={handleNext}
                      className="w-full px-3 py-3 bg-leaf text-white rounded-xl hover:opacity-90 transition-all font-semibold text-sm"
                    >
                      활용형 학습
                    </button>
                  </div>
                ),
              },
            ]}
          />
        </DisabledArea>

        <TutorialNavigation />
      </div>
    );
  }

  // 4단계: 예문 학습
  if (currentStep === 3) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <TutorialGuide
          step={4}
          title="단어와 예문을 학습해요."
          description={
            "단어의 읽는 방법과 의미를 확인하고 실제 예문을 통해 사용법을 익힐 수 있어요.\n단어 학습을 마치면 테스트가 진행됩니다."
          }
        />

        <DisabledArea>
          <StudyPage
            title="N5 | 명사"
            label="N5 | 명사"
            currentIndex={0}
            totalCount={2}
            questionText="단어와 예문을 학습해보세요."
            placeholder=""
            options={tutorialOptions}
            phase="learning"
            additionalInfo={
              <div className="space-y-3 text-center">
                <div className="text-sm text-gray-400">
                  がっこう
                </div>

                <div className="text-2xl font-bold text-gray-800">
                  学校
                </div>

                <div className="text-base text-gray-700">
                  학교
                </div>

                <div className="bg-gray-50 p-5 rounded-xl space-y-3">
                  <div className="text-lg font-medium text-gray-800 leading-relaxed">
                    私は学校に行きます。
                  </div>

                  <div className="text-sm text-gray-500 leading-relaxed">
                    저는 학교에 갑니다.
                  </div>
                </div>
              </div>
            }
            onCheckAnswer={handleCheckAnswer}
            onNext={handleNext}
            onPrevious={handlePrevious}
            showNavigationButtons={true}
          />
        </DisabledArea>

        <TutorialNavigation />
      </div>
    );
  }

  // 5단계: 예문 테스트
  if (currentStep === 4) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <TutorialGuide
          step={5}
          title="배운 단어를 테스트해요."
          description={
            "학습한 단어를 바탕으로 빈칸에 알맞은 단어를 선택해 보세요.\n카드 선택과 키보드 입력 중 원하는 방법으로 답할 수 있습니다."
          }
        />

        <DisabledArea>
          <StudyPage
            title="N5 | 명사"
            label="N5 | 명사"
            currentIndex={0}
            totalCount={2}
            questionText="괄호에 알맞은 카드를 선택하세요."
            placeholder="정답을 입력하세요."
            options={tutorialOptions}
            phase="test"
            additionalInfo={
              <div className="space-y-4 text-center">
                <div className="text-lg font-bold text-gray-800">
                  학교
                </div>

                <div className="bg-gray-50 p-5 rounded-xl space-y-3">
                  <div className="text-lg font-medium text-gray-800 leading-relaxed">
                    私は（　　　）に行きます。
                  </div>

                  <div className="border-t border-gray-200 pt-3 text-sm text-gray-500 leading-relaxed">
                    저는 학교에 갑니다.
                  </div>
                </div>
              </div>
            }
            onCheckAnswer={handleCheckAnswer}
            onNext={handleNext}
            onPrevious={handlePrevious}
            showNavigationButtons={true}
          />
        </DisabledArea>

        <TutorialNavigation />
      </div>
    );
  }

  // 6단계: AI 챗봇
  if (currentStep === 5) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <TutorialGuide
          step={6}
          title="AI 챗봇과 일본어로 대화해요."
          description={
            "최근 학습한 단어를 활용해 AI 챗봇과 대화할 수 있어요.\n모르는 단어나 문법을 질문하면서 자연스럽게 복습해 보세요."
          }
        />

        <DisabledArea>
          <div className="flex flex-col h-[calc(100vh-190px)] bg-[#FFF7F8]">
            <header className="flex items-center justify-between px-4 py-3 bg-white">
              <button
                onClick={handlePrevious}
                className="text-gray-700"
                aria-label="뒤로가기"
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

              <h1 className="text-lg font-semibold text-gray-900">
                AI 챗봇
              </h1>

              <div className="w-6" />
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {tutorialMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`flex flex-col ${
                      msg.sender === "user"
                        ? "items-end"
                        : "items-start"
                    } max-w-[85%]`}
                  >
                    <div
                      className={`px-4 py-3 rounded-2xl ${
                        msg.sender === "user"
                          ? "bg-[#F5B1BF] text-white rounded-tr-sm"
                          : "bg-white text-gray-800 rounded-tl-sm"
                      }`}
                    >
                      <p className="leading-relaxed text-sm">
                        {msg.text}
                      </p>
                    </div>

                    <span className="text-xs text-gray-500 mt-1 px-2">
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white px-4 py-3">
              <div className="flex items-center space-x-2">
                <div className="flex-1">
                  <div className="w-full px-4 py-3 bg-[#FFF0F3] text-gray-400 rounded-full text-sm">
                    메시지를 입력하세요...
                  </div>
                </div>

                <button
                  className="p-3 bg-[#F6C5CC] text-white rounded-full"
                  aria-label="전송"
                  type="button"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </DisabledArea>

        <TutorialNavigation />
      </div>
    );
  }

  // 7단계: 학습 기록 및 통계
  if (currentStep === 6) {
    const totalStudyTime = mockWeekData.reduce(
      (sum, day) => sum + day.studyTime,
      0
    );

    const avgAccuracy = Math.round(
      mockWeekData.reduce(
        (sum, day) => sum + day.accuracy,
        0
      ) / mockWeekData.length
    );

    const maxTime = Math.max(
      ...mockWeekData.map((day) => day.studyTime),
      1
    );

    const W = 700;
    const H = 190;
    const padTop = 40;
    const padBottom = 14;
    const colW = W / mockWeekData.length;
    const chartH = H - padTop - padBottom;

    const points = mockWeekData.map((day, index) => ({
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

    const formatTime = (seconds: number) => {
      const minutes = Math.floor(seconds / 60);
      return `${minutes}분`;
    };

    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <TutorialGuide
          step={7}
          title="나의 학습 기록을 확인해요."
          description={
            "최근 7일간의 학습 시간과 정답률을 한눈에 확인할 수 있어요.\nAI 주간 요약을 통해 나의 학습 습관과 보완할 점도 확인할 수 있습니다."
          }
        />

        <DisabledArea>
          <div className="bg-white sticky top-0 z-10">
            <div className="relative flex items-center justify-center px-4 py-4">
              <button
                onClick={handlePrevious}
                className="absolute left-4 text-gray-700"
                aria-label="뒤로가기"
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
            <div className="bg-white rounded-2xl p-6">
              <div className="text-center mb-6">
                <div className="text-sm text-gray-600 mb-2">
                  최근 7일 총 학습 시간
                </div>

                <div className="text-3xl font-bold text-sakura-dark">
                  {formatTime(totalStudyTime)}
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

                      <text
                        x={point.x}
                        y={point.y - 18}
                        textAnchor="middle"
                        fontSize={22}
                        fontWeight={700}
                        className="fill-sakura-dark"
                      >
                        {formatTime(point.time)}
                      </text>
                    </g>
                  ))}
                </svg>

                <div className="grid grid-cols-7 mt-1">
                  {mockWeekData.map((day, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center"
                    >
                      <span className="text-xs font-bold text-gray-700">
                        {day.day}
                      </span>

                      <span className="text-[11px] font-semibold text-sakura-dark mt-1">
                        {day.accuracy}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                AI 주간 요약 코멘트
              </h3>

              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-gray-50 rounded-xl p-3 flex flex-col items-center text-center">
                  <div className="text-[10px] text-gray-700 whitespace-nowrap">
                    평균 정답률
                  </div>

                  <div className="text-xl font-bold text-sakura-dark mt-1">
                    {avgAccuracy}%
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-3 flex flex-col items-center text-center">
                  <div className="text-[10px] text-gray-700 whitespace-nowrap">
                    평균 학습 시간
                  </div>

                  <div className="text-xl font-bold text-sakura-dark mt-1">
                    15분
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-3 flex flex-col items-center text-center">
                  <div className="text-[10px] text-gray-700 whitespace-nowrap">
                    연속 학습
                  </div>

                  <div className="text-xl font-bold text-sakura-dark mt-1 flex items-center gap-1">
                    <Flame className="w-4 h-4 text-sakura-dark" />
                    7일
                  </div>
                </div>
              </div>

              <div className="bg-sakura/10 rounded-xl p-4 mb-4">
                <div className="text-sm font-bold text-sakura-dark mb-2">
                  꾸준한 학습으로 좋은 성과를 내고 있어요!
                </div>

                <p className="text-xs text-gray-700 leading-relaxed">
                  최근 7일간 꾸준히 일본어 학습을 진행했어요.
                  특히 정답률이 안정적으로 유지되고 있습니다.
                  앞으로도 매일 조금씩 학습을 이어가 보세요.
                </p>
              </div>

              <ul className="space-y-3">
                <li className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl">
                  <div className="flex-shrink-0 w-8 h-8 bg-[#d4f08e] rounded-full flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>

                  <div>
                    <span className="text-sm font-semibold text-gray-900">
                      학습 성과
                    </span>

                    <p className="text-xs text-gray-600 leading-relaxed">
                      이번 주 평균 정답률이 {avgAccuracy}%로
                      안정적인 학습 성과를 보이고 있어요.
                    </p>
                  </div>
                </li>

                <li className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl">
                  <div className="flex-shrink-0 w-8 h-8 bg-[#d4f08e] rounded-full flex items-center justify-center">
                    <Target className="w-4 h-4 text-white" />
                  </div>

                  <div>
                    <span className="text-sm font-semibold text-gray-900">
                      학습 목표
                    </span>

                    <p className="text-xs text-gray-600 leading-relaxed">
                      매일 일정한 시간을 정해 학습하면
                      더욱 효과적으로 복습할 수 있어요.
                    </p>
                  </div>
                </li>

                <li className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl">
                  <div className="flex-shrink-0 w-8 h-8 bg-[#d4f08e] rounded-full flex items-center justify-center">
                    <Lightbulb className="w-4 h-4 text-white" />
                  </div>

                  <div>
                    <span className="text-sm font-semibold text-gray-900">
                      학습 팁
                    </span>

                    <p className="text-xs text-gray-600 leading-relaxed">
                      학습한 단어를 AI 챗봇에서 직접 사용해 보면
                      기억에 더 오래 남을 수 있어요.
                    </p>
                  </div>
                </li>
              </ul>

              <div className="text-center mt-4 pt-4">
                <span className="text-[11px] text-gray-400">
                  ✿ 하루의 일본어
                </span>
              </div>
            </div>
          </div>
        </DisabledArea>

        <TutorialNavigation />
      </div>
    );
  }

  // 8단계: 튜토리얼 완료
  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <TutorialGuide
        step={8}
        title="이제 직접 학습을 시작해 보세요!"
        description={
          "하루의 일본어의 주요 기능을 모두 살펴봤어요.\n급수별 단어 학습부터 AI 챗봇, 학습 통계까지 다양한 기능을 활용해 일본어 실력을 키워보세요."
        }
      />

      <DisabledArea>
        <SelectPage
          headerTitle="나의 학습"
          showBackButton={false}
          items={[
            {
              id: "history",
              title: "학습 기록 확인",
              description:
                "학습한 단어와 진도율, 연속 학습 일수 등을 확인할 수 있어요.",
              onClick: handleFinish,
            },
            {
              id: "chatbot",
              title: "AI 챗봇과 대화하기",
              description:
                "학습한 단어를 활용해 AI 챗봇과 일본어로 대화할 수 있어요.",
              onClick: handleFinish,
            },
            {
              id: "finish",
              title: "튜토리얼 완료",
              description:
                "이제 하루의 일본어에서 직접 학습을 시작해 보세요!",
              onClick: handleFinish,
            },
          ]}
        />
      </DisabledArea>

      <div className="fixed bottom-0 left-0 right-0 px-4 pb-5 pt-4 bg-white shadow-[0_-4px_16px_rgba(0,0,0,0.06)] z-20">
        <div className="max-w-md mx-auto flex gap-3">
          <button
            onClick={handlePrevious}
            className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
          >
            이전
          </button>

          <button
            onClick={handleFinish}
            className="flex-1 py-3 bg-sakura text-white rounded-xl font-bold hover:opacity-90 transition-all"
          >
            학습 시작하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default Tutorial;
