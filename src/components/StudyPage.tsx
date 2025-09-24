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
  onBackButtonClick?: () => Promise<void>; // 뒤로가기 버튼 콜백 추가
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
      
      // 정답 결과를 상위 컴포넌트에 전달
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

  // 뒤로가기 버튼 핸들러 수정
  const handleBackButton = async () => {
    if (isNavigating) return; // 중복 클릭 방지
    
    setIsNavigating(true);
    
    try {
      // 상위 컴포넌트의 뒤로가기 콜백이 있으면 실행 (세션 종료 등)
      if (onBackButtonClick) {
        await onBackButtonClick();
      }
      
      // 네비게이션 실행
      navigate(-1);
    } catch (error) {
      console.error("뒤로가기 처리 중 오류:", error);
      // 오류가 발생해도 페이지는 이동
      navigate(-1);
    } finally {
      setIsNavigating(false);
    }
  };

  // 진행률 계산
  const progressPercentage = ((currentIndex + 1) / totalCount) * 100;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      {/* Header */}
      <div className="w-full bg-white rounded-b-3xl py-4 px-6 shadow">
        <div className="flex justify-between items-center mb-3">
          <button
            onClick={handleBackButton}
            disabled={isNavigating}
            className={`text-gray-500 text-sm ${
              isNavigating ? 'opacity-50 cursor-not-allowed' : 'hover:text-gray-700'
            }`}
          >
            {isNavigating ? '처리 중...' : '〈 학습 화면'}
          </button>
          <div className="text-sm text-gray-500">
            {currentIndex + 1} / {totalCount}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div 
            className="bg-sakura-dark h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        
        {/* Progress Percentage */}
        <div className="text-xs text-gray-500 text-center">
          진행률: {Math.round(progressPercentage)}%
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center w-full max-w-md px-6 mt-6">
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        {subtitle && <div className="text-lg text-gray-600 mb-2">{subtitle}</div>}
        <div className="text-sakura text-xl mb-6">✿</div>

        <div className="bg-white rounded-2xl shadow-md w-full p-6 text-center">
          {/* Question */}
          <div className="mb-6">
            <div className="text-lg font-semibold mb-4 text-gray-800">
              {questionText}
            </div>
            {additionalInfo && (
              <div className="mb-4">
                {additionalInfo}
              </div>
            )}
          </div>

          {/* Result Display */}
          {checkResult && (
            <div className={`mb-4 p-3 rounded-lg ${
              checkResult.correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <div className="font-semibold">{checkResult.message}</div>
              {showHints && !checkResult.correct && checkResult.hint && (
                <div className="text-sm mt-2">{checkResult.hint}</div>
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
              className="w-full border-2 border-sakura-light focus:border-sakura-dark focus:outline-none px-4 py-3 rounded-lg text-center text-lg"
              disabled={checkResult?.correct}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-between gap-2">
            {showNavigationButtons && (
              <button
                onClick={handlePrevious}
                className="w-[30%] px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition text-sm"
              >
                이전
              </button>
            )}
            {showNavigationButtons && (
              <button
                onClick={handleNext}
                className="w-[30%] px-3 py-2 bg-sakura-dark text-white rounded-lg hover:bg-sakura-darker transition text-sm"
              >
                다음
              </button>
            )}
            <button
              onClick={handleCheckAnswer}
              disabled={!answer.trim() || checkResult?.correct}
              className={`${showNavigationButtons ? 'w-[35%]' : 'w-full'} px-3 py-2 border border-sakura-dark text-sakura-dark rounded-lg hover:bg-sakura-darker hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed text-sm`}
            >
              정답 확인
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyPage;