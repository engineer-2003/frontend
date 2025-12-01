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
  currentWordId,
  onAnswerResult,
  onBackButtonClick,
}) => {
  const navigate = useNavigate();
  const [answer, setAnswer] = useState("");
  const [checkResult, setCheckResult] = useState<CheckAnswerResponse | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  
  // 정답 확인 상태 (false: 입력 중, true: 결과 확인 중)
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    // 문제 변경 시 상태 초기화
    setAnswer("");
    setCheckResult(null);
    setIsChecked(false);
  }, [currentIndex, currentWordId]);

  // 메인 액션 (정답 확인 -> 다음 문제)
  const handleMainAction = async () => {
    // 1. 이미 정답을 확인한 상태라면 '다음'으로 이동
    if (isChecked) {
      handleNext();
      return;
    }

    // 2. 답을 입력하지 않았다면 경고
    if (!answer.trim()) {
      alert("답을 입력해주세요.");
      return;
    }

    // 3. 정답 체크 수행
    try {
      const result = await onCheckAnswer(answer.trim());
      setCheckResult(result);
      setIsChecked(true); // 확인 상태로 변경
      
      if (onAnswerResult && currentWordId) {
        onAnswerResult(currentWordId, result.correct);
      }
    } catch (error) {
      alert("정답 확인 중 오류가 발생했습니다.");
    }
  };

  const handleNext = () => {
    onNext();
  };

  const handlePrevious = () => {
    onPrevious();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleMainAction();
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
      navigate(-1);
    } finally {
      setIsNavigating(false);
    }
  };

  const progressPercentage = totalCount > 0 ? ((currentIndex + 1) / totalCount) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sakura-lighter to-sakura-light flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="animate-float-slow absolute top-20 left-10 text-sakura text-4xl opacity-20">✿</div>
        <div className="animate-float-medium absolute bottom-32 right-20 text-sakura-dark text-5xl opacity-15">✿</div>
        <div className="animate-float-slow absolute top-1/2 right-1/4 text-sakura text-3xl opacity-20">✿</div>
      </div>

      {/* Header - 반투명 효과 적용 */}
      <div className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-20">
        <div className="px-4 py-3">
          <div className="flex justify-between items-center mb-3">
            <button
              onClick={handleBackButton}
              disabled={isNavigating}
              className="flex items-center space-x-1 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm font-medium">{isNavigating ? '처리 중...' : '학습 화면'}</span>
            </button>
            <div className="px-3 py-1 bg-gradient-to-r from-sakura to-sakura-dark text-white text-sm font-bold rounded-full shadow-md">
              {currentIndex + 1} / {totalCount}
            </div>
          </div>
          
          <div className="relative w-full bg-gray-200 rounded-full h-2.5 overflow-hidden shadow-inner">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-sakura to-sakura-dark rounded-full transition-all duration-500 ease-out shadow-sm"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 relative z-10">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
            {subtitle && <div className="text-base text-gray-600">{subtitle}</div>}
          </div>

          <div className="bg-white/95 rounded-3xl shadow-xl p-6 backdrop-blur-sm border border-pink-100">
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

            {/* 결과 표시 영역 */}
            {checkResult && (
              <div className={`mb-4 p-4 rounded-2xl shadow-sm ${
                  checkResult.correct 
                    ? 'bg-green-50 border-2 border-green-300' 
                    : 'bg-pink-50 border-2 border-sakura'
                }`}
              >
                <div className="flex items-center justify-center space-x-2 mb-2">
                  {checkResult.correct ? (
                    <span className="font-bold text-green-700 text-lg">정답입니다! 🎉</span>
                  ) : (
                    <span className="font-bold text-sakura-dark text-lg">틀렸습니다 😢</span>
                  )}
                </div>
                
                {/* 오답일 때 정답 명확히 표시 */}
                {!checkResult.correct && (
                  <div className="mt-3 p-3 bg-white rounded-lg text-center border border-sakura shadow-sm">
                    <div className="text-xs text-gray-500 mb-1">정답</div>
                    <div className="text-xl font-bold text-sakura-dark">{checkResult.correctAnswer}</div>
                  </div>
                )}
              </div>
            )}

            {/* 입력창 */}
            <div className="mb-6">
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={placeholder}
                className="w-full border-2 border-gray-200 focus:border-sakura-dark focus:outline-none focus:ring-2 focus:ring-sakura/30 px-4 py-4 rounded-xl text-center text-lg transition-all shadow-sm"
                disabled={isChecked && checkResult?.correct}
                autoFocus
              />
            </div>

            {/* 메인 액션 버튼 */}
            <button
              onClick={handleMainAction}
              className={`w-full py-4 text-white font-bold text-lg rounded-xl shadow-md hover:shadow-lg transform active:scale-95 transition-all duration-200 ${
                  isChecked 
                  ? 'bg-gradient-to-r from-sakura-dark to-sakura hover:from-sakura-darker hover:to-sakura-dark' 
                  : 'bg-gradient-to-r from-sakura to-sakura-dark hover:shadow-sakura/50'
              }`}
            >
              {isChecked ? '다음 문제 →' : '정답 확인'}
            </button>

            {/* 이전/건너뛰기 네비게이션 (확인 전일 때만 노출) */}
            {showNavigationButtons && !isChecked && (
              <div className="flex gap-3 mt-3">
                <button
                  onClick={handlePrevious}
                  className="flex-1 py-3 bg-gray-100 text-gray-600 font-semibold rounded-xl hover:bg-gray-200 transition-colors shadow-sm"
                >
                  ← 이전
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 py-3 bg-gray-100 text-gray-600 font-semibold rounded-xl hover:bg-gray-200 transition-colors shadow-sm"
                >
                  건너뛰기
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