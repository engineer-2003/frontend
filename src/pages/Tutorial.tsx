// src/pages/Tutorial.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ReactNode } from "react";

interface TutorialStep {
  title: string;
  subtitle: string;
  description: string;
  content: ReactNode;
}

const tutorialSteps: TutorialStep[] = [
  {
    title: "하루의 일본어에 오신 것을 환영해요!",
    subtitle: "매일의 일본어, 하루의 일본어",
    description:
      "하루의 일본어는 JLPT 단어부터 활용형, 예문, AI 챗봇까지 다양한 방식으로 일본어를 학습할 수 있는 서비스예요.",
    content: (
      <div className="flex flex-col items-center py-5">
        <div className="text-7xl text-[#F2A9B8]">✿</div>
        <div className="mt-5 grid w-full grid-cols-2 gap-3">
          {[
            ["단어 학습", "일본어 단어와 의미 익히기"],
            ["활용형 학습", "일본어 활용형 연습하기"],
            ["예문 학습", "문장 속에서 단어 익히기"],
            ["AI 챗봇", "학습한 내용으로 대화하기"],
          ].map(([title, text]) => (
            <div
              key={title}
              className="rounded-2xl bg-[#FFF3F5] p-4 text-center"
            >
              <p className="font-bold text-[#A85D70]">{title}</p>
              <p className="mt-2 text-xs leading-relaxed text-gray-600">
                {text}
              </p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    title: "먼저 학습할 급수를 선택해요",
    subtitle: "나에게 맞는 JLPT 레벨",
    description:
      "N5부터 N1까지 원하는 일본어 능력시험 급수를 선택할 수 있어요. 자신의 수준에 맞는 단어부터 차근차근 학습해 보세요.",
    content: (
      <div className="grid grid-cols-5 gap-2 py-6">
        {["N5", "N4", "N3", "N2", "N1"].map((level, index) => (
          <div
            key={level}
            className={`flex flex-col items-center rounded-2xl border-2 p-3 ${
              index === 2
                ? "border-[#E99AAE] bg-[#FFF0F3]"
                : "border-gray-100 bg-white"
            }`}
          >
            <span className="text-lg font-bold text-[#A85D70]">
              {level}
            </span>
            <span className="mt-1 text-[10px] text-gray-500">
              {index === 0
                ? "초급"
                : index === 1
                  ? "초중급"
                  : index === 2
                    ? "중급"
                    : index === 3
                      ? "중상급"
                      : "고급"}
            </span>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "학습할 품사를 선택해요",
    subtitle: "다양한 품사의 일본어 단어",
    description:
      "명사, 형용사, 형용동사, 동사 중 원하는 품사를 선택할 수 있어요. 품사에 따라 예문 학습과 활용형 학습을 진행할 수 있습니다.",
    content: (
      <div className="grid grid-cols-2 gap-3 py-5">
        {[
          ["名詞", "명사"],
          ["い形容詞", "형용사"],
          ["な形容詞", "형용동사"],
          ["動詞", "동사"],
        ].map(([japanese, korean]) => (
          <div
            key={korean}
            className="rounded-2xl bg-[#FFF3F5] p-5 text-center"
          >
            <p className="text-xl font-bold text-[#A85D70]">
              {japanese}
            </p>
            <p className="mt-2 text-sm text-gray-600">{korean}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "예문으로 단어를 학습해요",
    subtitle: "단어의 의미와 실제 사용 방법 익히기",
    description:
      "먼저 일본어 단어와 읽는 법, 의미를 확인하고 예문과 한국어 번역을 살펴보세요. 학습 단계가 끝나면 테스트에서 괄호에 들어갈 알맞은 단어를 선택해요.",
    content: (
      <div className="space-y-4 py-4">
        <div className="rounded-2xl border border-[#F8DDE3] bg-[#FFF8F9] p-5 text-center">
          <p className="text-sm text-gray-400">がっこう</p>
          <p className="mt-1 text-3xl font-bold text-gray-800">
            学校
          </p>
          <p className="mt-2 text-gray-600">학교</p>
          <div className="mt-4 rounded-xl bg-white p-4">
            <p className="text-lg font-medium text-gray-800">
              毎日、学校へ行きます。
            </p>
            <p className="mt-2 text-sm text-gray-500">
              매일 학교에 갑니다.
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-[#FFF0F3] p-4 text-center">
          <p className="text-xs font-bold text-[#A85D70]">
            테스트 단계 예시
          </p>
          <p className="mt-3 text-lg font-medium text-gray-800">
            毎日、（　）へ行きます。
          </p>
          <p className="mt-2 text-sm text-gray-600">
            괄호에 들어갈 알맞은 단어를 선택하세요.
          </p>
          <div className="mt-3 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#A85D70]">
            学校
          </div>
        </div>

        <p className="text-center text-xs text-gray-500">
          예문 학습은 10개 단어씩 학습하고 테스트를 진행해요.
        </p>
      </div>
    ),
  },
  {
    title: "활용형을 직접 맞혀봐요",
    subtitle: "예문 속 일본어 활용형 익히기",
    description:
      "동사와 형용사의 활용형을 예문 속에서 학습해요. 실제 예문에 등장하는 활용형이 빈칸으로 표시되며, 알맞은 카드를 선택하면 됩니다.",
    content: (
      <div className="space-y-4 py-4">
        <div className="rounded-2xl border border-[#F8DDE3] bg-[#FFF8F9] p-5 text-center">
          <p className="text-sm text-gray-400">やる</p>
          <p className="mt-1 text-2xl font-bold text-gray-800">
            やる
          </p>
          <p className="mt-2 text-sm text-gray-600">
            하다
          </p>
          <div className="mt-4 rounded-xl bg-white p-4">
            <p className="text-lg font-medium leading-relaxed text-gray-800">
              慌てずにゆっくり（　）!
            </p>
            <p className="mt-2 text-sm text-gray-500">
              당황하지 말고 천천히 해!
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {["やる", "やれ", "やらない", "やって"].map(
            (form) => (
              <div
                key={form}
                className={`rounded-xl border-2 p-3 text-center font-semibold ${
                  form === "やれ"
                    ? "border-[#E99AAE] bg-[#FFF0F3] text-[#A85D70]"
                    : "border-gray-100 bg-white text-gray-600"
                }`}
              >
                {form}
                {form === "やれ" && (
                  <span className="ml-1 text-xs">정답</span>
                )}
              </div>
            )
          )}
        </div>

        <p className="text-center text-xs text-gray-500">
          활용형 학습은 단어당 한 문제씩 출제돼요.
        </p>
      </div>
    ),
  },
  {
    title: "AI 챗봇과 일본어로 대화해요",
    subtitle: "학습한 단어를 활용한 대화 연습",
    description:
      "AI 챗봇은 최근 학습한 단어를 바탕으로 일본어 문장 만들기 연습을 도와줘요. 궁금한 점이나 연습하고 싶은 일본어 문장을 입력해 보세요.",
    content: (
      <div className="space-y-4 rounded-2xl bg-[#FFF3F5] p-4 py-5">
        <div className="flex justify-start">
          <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white px-4 py-3 text-sm leading-relaxed text-gray-700">
            안녕! 최근 학습한 단어들을 활용해서 일본어 문장 만들기 연습을 해볼까?
          </div>
        </div>

        <div className="flex justify-end">
          <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-[#F5B1BF] px-4 py-3 text-sm text-white">
            学校へ行きます。
          </div>
        </div>

        <div className="flex justify-start">
          <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white px-4 py-3 text-sm leading-relaxed text-gray-700">
            좋아요! 자연스러운 문장이에요. 다른 표현도 연습해 볼까요?
          </div>
        </div>

        <div className="rounded-full border border-[#F2C6D0] bg-white px-4 py-3 text-xs text-gray-400">
          메시지를 입력하세요...
        </div>
      </div>
    ),
  },
  {
    title: "학습 기록과 AI 분석을 확인해요",
    subtitle: "나의 학습 과정을 한눈에",
    description:
      "학습 기록에서는 최근 7일간의 학습 시간과 요일별 정답률을 확인할 수 있어요. 평균 정답률, 평균 학습 시간, 연속 학습 일수도 확인할 수 있습니다.",
    content: (
      <div className="space-y-3 py-4">
        <div className="rounded-2xl bg-[#FFF3F5] p-5 text-center">
          <p className="text-sm text-gray-600">
            최근 7일 총 학습 시간
          </p>
          <p className="mt-2 text-3xl font-bold text-[#A85D70]">
            2시간 30분
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            ["평균 정답률", "85%"],
            ["평균 학습 시간", "21분"],
            ["연속 학습", "3일"],
          ].map(([title, value]) => (
            <div
              key={title}
              className="rounded-xl bg-gray-50 p-3 text-center"
            >
              <p className="text-[10px] text-gray-500">{title}</p>
              <p className="mt-2 text-lg font-bold text-[#A85D70]">
                {value}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-[#F8DDE3] bg-white p-4">
          <p className="font-bold text-[#A85D70]">
            AI 주간 요약 코멘트
          </p>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            최근 학습 기록을 바탕으로 학습 성과와 보완하면 좋을 부분을 AI가 분석해 줘요.
          </p>
        </div>

        <p className="text-center text-xs text-gray-400">
          위 수치는 기능 설명을 위한 예시입니다.
        </p>
      </div>
    ),
  },
];

export default function Tutorial() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const step = tutorialSteps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tutorialSteps.length - 1;

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStep((prev) => prev + 1);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-[#fff9fb] px-4 py-6 sm:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-2xl flex-col">
        {/* 헤더 */}
        <header className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="text-sm font-medium text-gray-500 transition-colors hover:text-[#A85D70]"
          >
            ← 홈으로
          </button>

          <span className="text-lg font-bold text-[#A85D70]">
            하루의 일본어
          </span>

          <button
            onClick={() => navigate("/")}
            className="text-sm text-gray-400 transition-colors hover:text-gray-700"
          >
            종료
          </button>
        </header>

        {/* 진행률 */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
            <span>튜토리얼 진행률</span>
            <span>
              {currentStep + 1} / {tutorialSteps.length}
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-[#F5E4E8]">
            <div
              className="h-full rounded-full bg-[#E99AAE] transition-all duration-300"
              style={{
                width: `${((currentStep + 1) / tutorialSteps.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* 단계 표시 */}
        <div className="mb-6 flex justify-center gap-2">
          {tutorialSteps.map((item, index) => (
            <button
              key={item.title}
              onClick={() => setCurrentStep(index)}
              aria-label={`${index + 1}단계로 이동`}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                index === currentStep
                  ? "w-7 bg-[#E99AAE]"
                  : index < currentStep
                    ? "w-2.5 bg-[#F2C6D0]"
                    : "w-2.5 bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* 튜토리얼 내용 */}
        <main className="flex-1 rounded-3xl border border-[#F8E5E9] bg-white p-5 shadow-sm sm:p-8">
          <div className="mb-6 text-center">
            <p className="mb-3 text-xs font-bold tracking-widest text-[#C47C8F]">
              STEP {String(currentStep + 1).padStart(2, "0")}
            </p>

            <h1 className="text-xl font-bold leading-relaxed text-gray-900 sm:text-2xl">
              {step.title}
            </h1>

            <p className="mt-2 text-sm font-medium text-[#A85D70]">
              {step.subtitle}
            </p>

            <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-gray-600">
              {step.description}
            </p>
          </div>

          <div className="mx-auto w-full max-w-md">
            {step.content}
          </div>
        </main>

        {/* 하단 버튼 */}
        <footer className="mt-6 flex items-center justify-between gap-3">
          <button
            onClick={handlePrevious}
            disabled={isFirstStep}
            className="min-w-24 rounded-xl border border-[#EBCBD3] bg-white px-5 py-3 text-sm font-semibold text-[#A85D70] transition-colors hover:bg-[#FFF0F3] disabled:cursor-not-allowed disabled:opacity-30"
          >
            이전
          </button>

          <button
            onClick={handleNext}
            className="flex-1 rounded-xl bg-[#E99AAE] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#D98299] active:opacity-90"
          >
            {isLastStep ? "튜토리얼 완료" : "다음"}
            {!isLastStep && " →"}
          </button>
        </footer>

        <p className="mt-5 text-center text-xs text-gray-400">
          언제든 홈 화면에서 튜토리얼을 다시 확인할 수 있어요.
        </p>
      </div>
    </div>
  );
}
