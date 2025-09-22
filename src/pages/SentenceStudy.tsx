// src/pages/SentenceStudy.tsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import StudyPageComponent from "../components/StudyPage";
import { useStudySession } from "../hooks/useStudySession";
import { useWordsFetch } from "../hooks/useWordsFetch";

interface WordDto {
  id: number;
  word: string;
  reading: string;
  meaning: string;
  level: string;
  part: string;
  exampleSentence: string;
  exampleTranslation: string;
  partOfSpeech: string;
  forms: { [key: string]: string };
}

interface SentenceProblem {
  id: number;
  meaning: string;
  exampleTranslation: string;
  blankSentence: string;
  correctAnswers: string[];
  hint: string;
  level: string;
  part: string;
}

interface CheckAnswerResponse {
  correct: boolean;
  userAnswer: string;
  correctAnswer: string;
  message: string;
  hint?: string;
  error?: string;
}

const SentenceStudy: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const level = location.state?.level || "N3";
  const partId = location.state?.partId || "동사";
  const isRetryMode = location.state?.retryMode || false;

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentProblem, setCurrentProblem] = useState<SentenceProblem | null>(null);

  // 커스텀 훅 사용
  const studySession = useStudySession({
    level,
    partId,
    studyType: "sentence",
    isRetryMode,
  });

  const { words, loading, error } = useWordsFetch({
    level,
    partId,
    studyType: "sentence",
    isRetryMode,
  });

  // 첫 번째 단어 로드 및 세션 시작
  useEffect(() => {
    if (words.length > 0) {
      loadProblem(words[0].id);
      studySession.startStudySession();
    }
  }, [words]);

  // 문제 로드
  const loadProblem = async (wordId: number) => {
    try {
      const response = await fetch(`http://localhost:8080/study/${wordId}/sentence-problem`);
      
      if (!response.ok) {
        throw new Error('문제를 가져오는데 실패했습니다.');
      }
      
      const problemData: SentenceProblem = await response.json();
      setCurrentProblem(problemData);
    } catch (err) {
      console.error("문제 로드 중 오류:", err);
      setCurrentProblem(null);
    }
  };

  // 정답 확인
  const handleCheckAnswer = async (answer: string): Promise<CheckAnswerResponse> => {
    if (!currentProblem) {
      throw new Error("문제가 로드되지 않았습니다.");
    }

    try {
      const response = await fetch(`http://localhost:8080/study/${currentProblem.id}/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answer: answer,
          formType: "",
          studyType: "sentence"
        }),
      });

      if (!response.ok) {
        throw new Error('정답 확인에 실패했습니다.');
      }

      const result: CheckAnswerResponse = await response.json();
      return result;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "정답 확인 중 오류가 발생했습니다.");
    }
  };

  // 다음 단어
  const handleNext = () => {
    if (words.length === 0) return;

    const nextIndex = (currentWordIndex + 1) % words.length;
    setCurrentWordIndex(nextIndex);
    loadProblem(words[nextIndex].id);
  };

  // 이전 단어
  const handlePrevious = () => {
    if (words.length === 0) return;

    const prevIndex = currentWordIndex === 0 ? words.length - 1 : currentWordIndex - 1;
    setCurrentWordIndex(prevIndex);
    loadProblem(words[prevIndex].id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
        <div className="text-red-500 text-lg mb-4 text-center px-4">{error}</div>
        <div className="text-sm text-gray-600 mb-4">
          현재 설정: 레벨={level}, 품사={partId}
          {isRetryMode && ", 재학습 모드"}
        </div>
        {isRetryMode && error.includes("재학습할 틀린 단어가 없습니다") && (
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-sakura-dark text-white rounded-lg hover:bg-sakura-darker transition"
          >
            돌아가기
          </button>
        )}
      </div>
    );
  }

  if (!currentProblem) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-lg">문제를 로드하는 중...</div>
      </div>
    );
  }

  return (
    <StudyPageComponent
      title={`${level} > ${partId}${isRetryMode ? " (재학습)" : ""}`}
      questionText="다음 빈칸에 들어갈 단어를 입력하세요"
      placeholder="정답을 입력하세요"
      currentIndex={currentWordIndex}
      totalCount={words.length}
      onCheckAnswer={handleCheckAnswer}
      onNext={handleNext}
      onPrevious={handlePrevious}
      currentWordId={currentProblem.id}
      onAnswerResult={studySession.handleAnswerResult}
      onBackButtonClick={studySession.handleBackButtonClick}
      additionalInfo={
        <div>
          {/* 한국어 의미 */}
          <div className="text-lg font-semibold mb-3 text-gray-700">
            📖 {currentProblem.meaning}
          </div>
          
          {/* 한국어 예문 번역 */}
          {currentProblem.exampleTranslation && (
            <p className="text-base text-gray-600 mb-4 leading-relaxed">
              {currentProblem.exampleTranslation}
            </p>
          )}
          
          {/* 일본어 예문 (빈칸 포함) */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-lg text-gray-800 font-medium leading-relaxed">
              {currentProblem.blankSentence}
            </p>
          </div>
        </div>
      }
    />
  );
};

export default SentenceStudy;