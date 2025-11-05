// src/components/StudyPage.tsx
import React, { useState } from "react";
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
}

const StudyPage: React.FC<StudyPageProps> = ({
  title,
  subtitle,
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
}) => {
  const navigate = useNavigate();
  const [answer, setAnswer] = useState("");
  const [checkResult, setCheckResult] = useState<CheckAnswerResponse | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  const handleCheckAnswer = async () => {
    if (!answer.trim()) {
      alert("답을 입력해주세요.");
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

  const handleNext = () => {
    setAnswer("");
    setCheckResult(null);
    onNext();
  };

  const handlePrevious = () => {
    setAnswer("");
    setCheckResult(null);
    onPrevious();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !checkResult?.correct) {
      handleCheckAnswer();
    }
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

  const progressPercentage = ((currentIndex + 1) / totalCount) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex justify-between items-center mb-3">
            <button
              onClick={handleBackButton}
              disabled={isNavigating}
              className={`flex items-center space-x-1 text-gray-700 hover:text-gray-900 transition-colors ${
                isNavigating ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm">{isNavigating ? '처리 중...' : '학습 화면'}</span>
            </button>
            <div className="text-sm font-semibold text-gray-900">
              {currentIndex + 1} / {totalCount}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="relative w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-sakura to-sakura-dark rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></div>
            </div>
          </div>
          
          {/* Progress Text */}
          <div className="text-xs text-sakura-dark font-semibold text-center mt-2">
            진행률: {Math.round(progressPercentage)}%
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-md mx-auto">
          {/* Title Section */}
          <div className="text-center mb-6 animate-fade-in-05s">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
            {subtitle && <div className="text-base text-gray-600">{subtitle}</div>}
            <div className="text-sakura text-3xl mt-2 animate-pulse-gentle">✿</div>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-2xl shadow-sm p-6 animate-slide-up">
            {/* Question - 가운데 정렬 */}
            <div className="mb-6">
              <div className="text-base font-bold text-gray-900 mb-4 pb-3 border-b border-gray-200 text-center">
                {questionText}
              </div>
              {additionalInfo && (
                <div className="mb-4 text-center">
                  {additionalInfo}
                </div>
              )}
            </div>

            {/* Result Display */}
            {checkResult && (
              <div 
                className={`mb-4 p-4 rounded-xl animate-bounce-in ${
                  checkResult.correct 
                    ? 'bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-300' 
                    : 'bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-300'
                }`}
              >
                <div className="flex items-center justify-center space-x-2 mb-2">
                  {checkResult.correct ? (
                    <>
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="font-bold text-green-800">정답입니다!</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="font-bold text-red-800">틀렸습니다</span>
                    </>
                  )}
                </div>
                <div className={`text-sm text-center ${checkResult.correct ? 'text-green-700' : 'text-red-700'}`}>
                  {checkResult.message}
                </div>
                {showHints && !checkResult.correct && checkResult.hint && (
                  <div className="text-sm mt-2 text-red-600 bg-white bg-opacity-50 p-2 rounded text-center">
                    💡 {checkResult.hint}
                  </div>
                )}
              </div>
            )}

            {/* Input */}
            <div className="mb-4">
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={placeholder}
                className="w-full border-2 border-gray-200 focus:border-sakura-dark focus:outline-none px-4 py-4 rounded-xl text-center text-base transition-all"
                disabled={checkResult?.correct}
              />
            </div>

            {/* Buttons */}
            <div className="space-y-2">
              {/* 정답 확인 버튼 */}
              <button
                onClick={handleCheckAnswer}
                disabled={!answer.trim() || checkResult?.correct}
                className="w-full py-4 bg-gradient-to-r from-sakura to-sakura-dark text-white font-semibold rounded-xl hover:shadow-md transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {checkResult?.correct ? '✓ 정답 확인 완료' : '정답 확인'}
              </button>

              {/* 네비게이션 버튼 */}
              {showNavigationButtons && (
                <div className="flex gap-2">
                  <button
                    onClick={handlePrevious}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    ← 이전
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex-1 py-3 bg-gradient-to-r from-sakura to-sakura-dark text-white font-semibold rounded-xl hover:shadow-md transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    다음 →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyPage;