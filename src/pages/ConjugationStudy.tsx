// src/pages/ConjugationStudy.tsx
import React, { useState, useEffect, useCallback, useRef } from "react";
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

interface ConjugationProblem {
  id: number;
  word: string;
  reading: string;
  meaning: string;
  part: string;
  level: string;
  formType: string;
  formName: string;
  correctAnswer: string;
  hint: string;
}

interface CheckAnswerResponse {
  correct: boolean;
  userAnswer: string;
  correctAnswer: string;
  message: string;
  hint?: string;
  error?: string;
}

const ConjugationStudy: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const level = location.state?.level || "N3";
  const partId = location.state?.partId || "동사";
  const isRetryMode = location.state?.retryMode || false;

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentFormIndex, setCurrentFormIndex] = useState(0);
  const [availableForms, setAvailableForms] = useState<string[]>([]);
  const [currentProblem, setCurrentProblem] = useState<ConjugationProblem | null>(null);
  
  // 세션 시작 여부를 추적
  const sessionStartedRef = useRef(false);

  // 커스텀 훅 사용
  const studySession = useStudySession({
    level,
    partId,
    studyType: "conjugation",
    isRetryMode,
  });

  // 활용형이 있는 단어만 필터링 - useCallback으로 메모이제이션
  const filterConjugatableWords = useCallback((wordsData: WordDto[]) => {
    return wordsData.filter(word => word.forms && Object.keys(word.forms).length > 0);
  }, []);

  const { words, loading, error } = useWordsFetch({
    level,
    partId,
    studyType: "conjugation",
    isRetryMode,
    filterWords: filterConjugatableWords,
  });

  // 문제 로드 함수를 useCallback으로 메모이제이션
  const loadProblem = useCallback(async (wordId: number, formType?: string) => {
    try {
      const url = formType 
        ? `http://localhost:8080/study/${wordId}/form-problem?formType=${formType}`
        : `http://localhost:8080/study/${wordId}/form-problem`;
        
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('활용형 문제를 가져오는데 실패했습니다.');
      }
      
      const problemData: ConjugationProblem = await response.json();
      setCurrentProblem(problemData);
    } catch (err) {
      console.error("활용형 문제 로드 중 오류:", err);
      setCurrentProblem(null);
    }
  }, []);

  // 첫 번째 단어 로드 및 세션 시작 - 한 번만 실행되도록 개선
  useEffect(() => {
    if (words.length > 0 && !sessionStartedRef.current) {
      sessionStartedRef.current = true;
      
      const firstWordForms = Object.keys(words[0].forms);
      setAvailableForms(firstWordForms);
      setCurrentFormIndex(0);
      loadProblem(words[0].id, firstWordForms[0]);
      
      // 세션 시작
      if (studySession.startStudySession) {
        studySession.startStudySession();
      }
    }
  }, [words, loadProblem, studySession.startStudySession]);

  // words가 변경될 때 sessionStartedRef 리셋
  useEffect(() => {
    sessionStartedRef.current = false;
  }, [level, partId, isRetryMode]);

  // 정답 확인 함수를 useCallback으로 메모이제이션
  const handleCheckAnswer = useCallback(async (answer: string): Promise<CheckAnswerResponse> => {
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
          formType: currentProblem.formType,
          studyType: "conjugation"
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
  }, [currentProblem]);

  // 다음 활용형/단어로 이동
  const handleNext = useCallback(() => {
    if (words.length === 0 || availableForms.length === 0) return;

    const currentWord = words[currentWordIndex];
    
    if (currentFormIndex + 1 < availableForms.length) {
      const nextFormIndex = currentFormIndex + 1;
      setCurrentFormIndex(nextFormIndex);
      loadProblem(currentWord.id, availableForms[nextFormIndex]);
    } else {
      const nextWordIndex = (currentWordIndex + 1) % words.length;
      const nextWord = words[nextWordIndex];
      const nextWordForms = Object.keys(nextWord.forms);
      
      setCurrentWordIndex(nextWordIndex);
      setCurrentFormIndex(0);
      setAvailableForms(nextWordForms);
      loadProblem(nextWord.id, nextWordForms[0]);
    }
  }, [words, availableForms, currentWordIndex, currentFormIndex, loadProblem]);

  // 이전 활용형/단어로 이동
  const handlePrevious = useCallback(() => {
    if (words.length === 0 || availableForms.length === 0) return;

    if (currentFormIndex > 0) {
      const prevFormIndex = currentFormIndex - 1;
      setCurrentFormIndex(prevFormIndex);
      const currentWord = words[currentWordIndex];
      loadProblem(currentWord.id, availableForms[prevFormIndex]);
    } else {
      const prevWordIndex = currentWordIndex === 0 ? words.length - 1 : currentWordIndex - 1;
      const prevWord = words[prevWordIndex];
      const prevWordForms = Object.keys(prevWord.forms);
      const lastFormIndex = prevWordForms.length - 1;
      
      setCurrentWordIndex(prevWordIndex);
      setCurrentFormIndex(lastFormIndex);
      setAvailableForms(prevWordForms);
      loadProblem(prevWord.id, prevWordForms[lastFormIndex]);
    }
  }, [words, availableForms, currentWordIndex, currentFormIndex, loadProblem]);

  // 전체 학습 항목 수 계산 - useCallback으로 메모이제이션
  const getTotalCount = useCallback(() => {
    if (words.length === 0) return 0;
    const totalForms = words.reduce((sum, word) => sum + Object.keys(word.forms).length, 0);
    return totalForms;
  }, [words]);

  // 현재 진행 상황 계산 - useCallback으로 메모이제이션
  const getCurrentPosition = useCallback(() => {
    if (words.length === 0) return 0;
    
    let position = 0;
    for (let i = 0; i < currentWordIndex; i++) {
      position += Object.keys(words[i].forms).length;
    }
    position += currentFormIndex;
    
    return position;
  }, [words, currentWordIndex, currentFormIndex]);

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
        {isRetryMode && error.includes("재학습할") && (
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

  if (!currentProblem || words.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-lg">문제를 로드하는 중...</div>
      </div>
    );
  }

  return (
    <StudyPageComponent
      title={`${level} > ${partId}${isRetryMode ? " (재학습)" : ""}`}
      questionText={`다음 단어의 ${currentProblem.formName}을 입력하세요`}
      placeholder="활용형을 입력하세요"
      currentIndex={getCurrentPosition()}
      totalCount={getTotalCount()}
      onCheckAnswer={handleCheckAnswer}
      onNext={handleNext}
      onPrevious={handlePrevious}
      currentWordId={currentProblem.id}
      onAnswerResult={studySession.handleAnswerResult}
      onBackButtonClick={studySession.handleBackButtonClick}
      showHints={false}
      additionalInfo={
        <div className="text-center">
          <div className="bg-sakura-lighter rounded-lg p-4 mb-4">
            <div className="text-2xl font-bold text-gray-800 mb-2">
              {currentProblem.word}
            </div>
            <div className="text-lg text-gray-600 mb-1">
              {currentProblem.reading}
            </div>
            <div className="text-base text-gray-500 mb-3">
              {currentProblem.meaning}
            </div>
            
            <div className="text-sm text-gray-600">
              <div className="mb-2">현재 활용형: <span className="font-semibold text-sakura-dark">{currentProblem.formName}</span></div>
              <div className="flex justify-center space-x-1">
                {availableForms.map((form, index) => (
                  <div
                    key={form}
                    className={`w-2 h-2 rounded-full ${
                      index === currentFormIndex 
                        ? 'bg-sakura-dark' 
                        : index < currentFormIndex 
                          ? 'bg-sakura' 
                          : 'bg-gray-300'
                    }`}
                    title={form}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      }
    />
  );
};

export default ConjugationStudy;