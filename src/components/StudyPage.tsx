// src/components/StudyPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface CheckAnswerResponse {
  correct: boolean;
  userAnswer: string;
  correctAnswer: string;
  message: string;
  hint?: string;
  error?: string;
}

interface StudyPageProps {
  title: string;
  subtitle?: string;
  questionText: string;
  placeholder: string;
  currentIndex: number;
  totalCount: number;
  onCheckAnswer: (answer: string) => Promise<CheckAnswerResponse>;
  onNext: () => void;
  onPrevious: () => void;
  showNavigationButtons?: boolean;
  additionalInfo?: React.ReactNode;
  showHints?: boolean;
  currentWordId?: number;
  onAnswerResult?: (wordId: number, isCorrect: boolean) => void;
  onBackButtonClick?: () => Promise<void>;
  options: string[];
  label?: string;
  inputMode?: "card" | "keyboard";
  onToggleInputMode?: () => void;
}

const StudyPage: React.FC<StudyPageProps> = ({
  questionText,
  placeholder,
  currentIndex,
  totalCount,
  onCheckAnswer,
  onNext,
  onPrevious,
  showNavigationButtons = true,
  additionalInfo,
  showHints = true,
  currentWordId,
  onAnswerResult,
  onBackButtonClick,
  options,
  label = "N1 | 형용사 활용형",
  inputMode,
  onToggleInputMode,
}) => {
  const navigate = useNavigate();

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [checkResult, setCheckResult] = useState<CheckAnswerResponse | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [internalMode, setInternalMode] = useState<"card" | "keyboard">("card");

  const currentMode = inputMode ?? internalMode;

  // 문제 변경 시 상태 초기화
  useEffect(() => {
    setSelectedOption(null);
    setAnswer("");
    setCheckResult(null);
  }, [currentIndex, currentWordId]);

  // 입력 방식 전환
  const handleToggleMode = () => {
    if (checkResult) return;

    setSelectedOption(null);
    setAnswer("");

    if (onToggleInputMode) {
      onToggleInputMode();
    } else {
      setInternalMode((prev) => (prev === "card" ? "keyboard" : "card"));
    }
  };

  // 카드 선택
  const handleOptionClick = async (option: string) => {
    if (checkResult || isNavigating) return;

    setSelectedOption(option);

    try {
      const result = await onCheckAnswer(option);
      setCheckResult(result);

      if (onAnswerResult && currentWordId) {
        onAnswerResult(currentWordId, result.correct);
      }
    } catch (error) {
      setSelectedOption(null);
      alert("정답 확인 중 오류가 발생했습니다.");
    }
  };

  // 키보드 입력 정답 확인
  const handleKeyboardSubmit = async () => {
    if (!answer.trim() || checkResult || isNavigating) {
      if (!answer.trim()) alert("답을 입력해주세요.");
      return;
    }

    try {
      const result = await onCheckAnswer(answer.trim());
      setCheckResult(result);

      if (onAnswerResult && currentWordId) {
        onAnswerResult(currentWordId, result.correct);
      }
    } catch (error) {
      alert("정답 확인 중 오류가 발생했습니다.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !checkResult) {
      handleKeyboardSubmit();
    }
  };

  const handleNext = () => {
    onNext();
  };

  const handlePrevious = () => {
    onPrevious();
  };

  const handleBackButton = async () => {
    if (isNavigating) return;

    setIsNavigating(true);

    try {
      if (onBackButtonClick) {
        await onBackButtonClick();
      }

      navigate(-1);
    } catch (error) {
      console.error("뒤로가기 처리 중 오류:", error);
      navigate(-1);
    } finally {
      setIsNavigating(false);
    }
  };

  const progressPercentage =
    totalCount > 0 ? ((currentIndex + 1) / totalCount) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex justify-between items-center mb-3">
            <button
              onClick={handleBackButton}
              disabled={isNavigating}
              className={`flex items-center space-x-1 text-gray-700 hover:text-gray-900 transition-colors ${
                isNavigating ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <svg
                className="w-5 h-5"
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

              <span className="text-sm font-medium">
                {isNavigating ? "처리 중..." : "학습 화면"}
              </span>
            </button>

            <div className="flex items-center space-x-2">
              <div className="text-sm font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                {currentIndex + 1} / {totalCount}
              </div>

              {/* 입력 방식 전환 버튼 */}
              <button
                type="button"
                onClick={handleToggleMode}
                disabled={!!checkResult}
                aria-label="입력 방식 전환"
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                  currentMode === "keyboard"
                    ? "bg-sakura-dark text-white border-sakura-dark shadow-sm"
                    : "bg-white text-gray-700 border-gray-200 hover:border-sakura"
                } ${
                  checkResult
                    ? "opacity-50 cursor-not-allowed"
                    : "active:scale-95"
                }`}
              >
                <span>
                  {currentMode === "card" ? "키보드 입력" : "카드 선택"}
                </span>
              </button>
            </div>
          </div>

          <div className="relative w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-sakura rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-md mx-auto">
          {/* Question Card */}
          <div className="bg-white rounded-3xl shadow-lg p-6 mb-6 border border-gray-100">
            <div className="text-center mb-4">
              <div className="flex items-center justify-center gap-2 mb-2 flex-wrap">
                <span className="inline-block px-3 py-1 rounded-full bg-sakura-lighter text-sakura-dark text-xs font-bold tracking-wider">
                  {label}
                </span>
              </div>

              <h2 className="text-xl font-bold text-gray-800 leading-tight mt-3">
                {questionText}
              </h2>
            </div>

            {additionalInfo && (
              <div className="mb-6 py-4 border-y border-gray-100 text-center">
                {additionalInfo}
              </div>
            )}

            {/* 정답 및 오답 결과 */}
            {checkResult && (
              <div className="mb-6 p-4 rounded-2xl bg-gray-50 text-gray-700 border border-gray-200 text-center">
                <div className="font-bold text-lg mb-1">
                  {checkResult.correct ? "정답입니다!" : "정답을 확인해보세요."}
                </div>

                {checkResult.message && (
                  <p className="text-sm font-medium">
                    {checkResult.message}
                  </p>
                )}

                {/* 오답일 경우 정답 표시 */}
                {!checkResult.correct && (
                  <div className="mt-3 p-3 rounded-xl bg-white border border-gray-200">
                    <div className="text-xs text-gray-500 mb-1">
                      정답
                    </div>
                    <div className="text-lg font-bold text-sakura-dark">
                      {checkResult.correctAnswer}
                    </div>
                  </div>
                )}

                {showHints && !checkResult.correct && checkResult.hint && (
                  <p className="text-sm mt-2 font-medium text-gray-600">
                    {checkResult.hint}
                  </p>
                )}
              </div>
            )}

            {/* 카드 선택 모드 vs 키보드 입력 모드 */}
            {currentMode === "card" ? (
              <div className="grid grid-cols-2 gap-3 mb-6">
                {options.map((option, index) => {
                  const isSelected = selectedOption === option;
                  const isCorrectAnswer =
                    !!checkResult && option === checkResult.correctAnswer;
                  const isWrongSelection =
                    !!checkResult && !checkResult.correct && isSelected;

                  let optionClass =
                    "bg-white border-gray-100 text-gray-700 hover:border-sakura hover:shadow-md active:scale-95";

                  if (checkResult) {
                    if (isCorrectAnswer) {
                      optionClass =
                        "bg-sakura-lighter border-sakura text-sakura-dark cursor-default";
                    } else if (isWrongSelection) {
                      optionClass =
                        "bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed";
                    } else {
                      optionClass =
                        "bg-gray-50 border-gray-100 text-gray-300 opacity-50 cursor-not-allowed";
                    }
                  }

                  return (
                    <button
                      key={`${option}-${index}`}
                      onClick={() => handleOptionClick(option)}
                      disabled={!!checkResult}
                      className={`
                        relative p-3 h-20 flex items-center justify-center text-center rounded-2xl font-bold text-lg transition-all duration-200
                        border-2 shadow-sm
                        ${optionClass}
                      `}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholder || "정답을 입력하세요"}
                  disabled={!!checkResult}
                  className="w-full border-2 border-gray-200 focus:border-sakura-dark focus:outline-none px-4 py-4 rounded-2xl text-center text-lg font-bold transition-all disabled:bg-gray-50 disabled:text-gray-400"
                />

                <button
                  type="button"
                  onClick={handleKeyboardSubmit}
                  disabled={!answer.trim() || !!checkResult}
                  className="w-full py-3.5 bg-sakura text-white font-bold rounded-2xl shadow-sm hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {checkResult ? "정답 확인 완료" : "정답 확인"}
                </button>
              </div>
            )}

            {/* Navigation Buttons */}
            {showNavigationButtons && (
              <div className="flex gap-3">
                <button
                  onClick={handlePrevious}
                  className="flex-1 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-colors"
                >
                  이전
                </button>

                <button
                  onClick={handleNext}
                  className="flex-1 py-4 bg-sakura-dark text-white font-bold rounded-2xl shadow-sm hover:opacity-90 transition-opacity"
                >
                  {checkResult?.correct ? "다음 문제" : "건너뛰기"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyPage;