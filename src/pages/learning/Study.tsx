// src/pages/learning/Study.tsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import StudyPageComponent from "../../components/StudyPage";
import { useStudySession } from "../../hooks/useStudySession";
import { useWordsFetch } from "../../hooks/useWordsFetch";

// --- Type Definitions ---
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

const Study: React.FC = () => {
  const BASE_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8080';
  const location = useLocation();
  const navigate = useNavigate();
  
  // studyType을 location.state에서 읽어와 분기 처리
  const level = location.state?.level || "N3";
  const partId = location.state?.partId || "동사";
  const studyType = location.state?.studyType || "sentence"; // 'sentence' 또는 'conjugation'
  const isRetryMode = location.state?.retryMode || false;

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const sessionStartedRef = useRef(false);

  // 활용형 학습에만 필요한 상태
  const [currentFormIndex, setCurrentFormIndex] = useState(0);
  const [availableForms, setAvailableForms] = useState<string[]>([]);
  
  // 현재 문제 상태 (공통)
  const [currentProblem, setCurrentProblem] = useState<ConjugationProblem | SentenceProblem | null>(null);

  // 커스텀 훅 사용
  const studySession = useStudySession({
    level,
    partId,
    studyType,
    isRetryMode,
  });

  // 활용형 학습 필터링 로직 (useWordsFetch의 filterWords에 전달)
  const filterConjugatableWords = useCallback((wordsData: WordDto[]) => {
    if (studyType === "conjugation") {
        return wordsData.filter(word => word.forms && Object.keys(word.forms).length > 0);
    }
    return wordsData;
  }, [studyType]);

  const { words, loading, error } = useWordsFetch({
    level,
    partId,
    studyType,
    isRetryMode,
    filterWords: filterConjugatableWords,
  });

  // 문제 로드 함수
  const loadProblem = useCallback(async (wordId: number, formType?: string) => {
    try {
      let url;
      if (studyType === "conjugation") {
        url = formType 
          ? `${BASE_API_URL}/study/${wordId}/form-problem?formType=${formType}`
          : `${BASE_API_URL}/study/${wordId}/form-problem`;
      } else { // sentence
        url = `${BASE_API_URL}/study/${wordId}/sentence-problem`;
      }
        
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('문제를 가져오는데 실패했습니다.');
      }
      
      const problemData: ConjugationProblem | SentenceProblem = await response.json();
      setCurrentProblem(problemData);
    } catch (err) {
      console.error("문제 로드 중 오류:", err);
      setCurrentProblem(null);
    }
  }, [studyType]);

  // 첫 번째 단어 로드 및 세션 시작
  useEffect(() => {
    if (words.length > 0 && !sessionStartedRef.current) {
      sessionStartedRef.current = true;
      
      if (studyType === "conjugation" && words[0].forms) {
        const firstWordForms = Object.keys(words[0].forms);
        setAvailableForms(firstWordForms);
        setCurrentFormIndex(0);
        loadProblem(words[0].id, firstWordForms[0]);
      } else {
        loadProblem(words[0].id);
      }
      
      // 세션 시작
      if (studySession.startStudySession) {
        studySession.startStudySession();
      }
    }
  }, [words, loadProblem, studySession.startStudySession, studyType]);

  // words가 변경될 때 sessionStartedRef 리셋
  useEffect(() => {
    sessionStartedRef.current = false;
  }, [level, partId, isRetryMode, studyType]);

  // 정답 확인 함수 - 세션 기반으로 수정
  const handleCheckAnswer = useCallback(async (answer: string): Promise<CheckAnswerResponse> => {
    if (!currentProblem) {
      throw new Error("문제가 로드되지 않았습니다.");
    }

    try {
      // 활용형 학습인 경우 formType을 전달
      const formType = studyType === "conjugation" 
        ? (currentProblem as ConjugationProblem).formType
        : "";

      // 세션 기반 정답 확인 함수 사용
      const result: CheckAnswerResponse = await studySession.checkAnswerWithSession(
        currentProblem.id,
        answer,
        formType,
        studyType
      );
      return result;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "정답 확인 중 오류가 발생했습니다.");
    }
  }, [currentProblem, studySession.checkAnswerWithSession, studyType]);

  // 다음 활용형/단어로 이동
  const handleNext = useCallback(() => {
    if (words.length === 0) return;

    if (studyType === "conjugation") {
        if (availableForms.length === 0) return;

        const currentWord = words[currentWordIndex];
        
        if (currentFormIndex + 1 < availableForms.length) {
            // 다음 활용형
            const nextFormIndex = currentFormIndex + 1;
            setCurrentFormIndex(nextFormIndex);
            loadProblem(currentWord.id, availableForms[nextFormIndex]);
        } else {
            // 다음 단어의 첫 번째 활용형
            const nextWordIndex = (currentWordIndex + 1) % words.length;
            const nextWord = words[nextWordIndex];
            const nextWordForms = Object.keys(nextWord.forms);
            
            setCurrentWordIndex(nextWordIndex);
            setCurrentFormIndex(0);
            setAvailableForms(nextWordForms);
            loadProblem(nextWord.id, nextWordForms[0]);
        }
    } else { // sentence
        const nextIndex = (currentWordIndex + 1) % words.length;
        setCurrentWordIndex(nextIndex);
        loadProblem(words[nextIndex].id);
    }
  }, [words, availableForms, currentWordIndex, currentFormIndex, loadProblem, studyType]);

  // 이전 활용형/단어로 이동
  const handlePrevious = useCallback(() => {
    if (words.length === 0) return;

    if (studyType === "conjugation") {
        if (availableForms.length === 0) return;

        if (currentFormIndex > 0) {
            // 이전 활용형
            const prevFormIndex = currentFormIndex - 1;
            setCurrentFormIndex(prevFormIndex);
            const currentWord = words[currentWordIndex];
            loadProblem(currentWord.id, availableForms[prevFormIndex]);
        } else {
            // 이전 단어의 마지막 활용형
            const prevWordIndex = currentWordIndex === 0 ? words.length - 1 : currentWordIndex - 1;
            const prevWord = words[prevWordIndex];
            const prevWordForms = Object.keys(prevWord.forms);
            const lastFormIndex = prevWordForms.length - 1;
            
            setCurrentWordIndex(prevWordIndex);
            setCurrentFormIndex(lastFormIndex);
            setAvailableForms(prevWordForms);
            loadProblem(prevWord.id, prevWordForms[lastFormIndex]);
        }
    } else { // sentence
        const prevIndex = currentWordIndex === 0 ? words.length - 1 : currentWordIndex - 1;
        setCurrentWordIndex(prevIndex);
        loadProblem(words[prevIndex].id);
    }
  }, [words, availableForms, currentWordIndex, currentFormIndex, loadProblem, studyType]);

  // 전체 학습 항목 수 계산
  const getTotalCount = useCallback(() => {
    if (words.length === 0) return 0;
    
    if (studyType === "conjugation") {
        return words.reduce((sum, word) => sum + Object.keys(word.forms).length, 0);
    } else {
        return words.length;
    }
  }, [words, studyType]);

  // 현재 진행 상황 계산
  const getCurrentPosition = useCallback(() => {
    if (words.length === 0) return 0;
    
    if (studyType === "conjugation") {
        let position = 0;
        for (let i = 0; i < currentWordIndex; i++) {
            position += Object.keys(words[i].forms).length;
        }
        position += currentFormIndex;
        return position;
    } else {
        return currentWordIndex;
    }
  }, [words, currentWordIndex, currentFormIndex, studyType]);

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
        {(isRetryMode && error.includes("재학습할")) && (
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

  const baseProps = {
    title: `${level} > ${partId}${isRetryMode ? " (재학습)" : ""}`,
    currentIndex: getCurrentPosition(),
    totalCount: getTotalCount(),
    onCheckAnswer: handleCheckAnswer,
    onNext: handleNext,
    onPrevious: handlePrevious,
    currentWordId: currentProblem.id,
    onAnswerResult: studySession.handleAnswerResult,
    onBackButtonClick: studySession.handleBackButtonClick,
  };

  // 문장 학습 뷰
  if (studyType === "sentence") {
    const problem = currentProblem as SentenceProblem;
    return (
      <StudyPageComponent
        {...baseProps}
        questionText="다음 빈칸에 들어갈 단어를 입력하세요"
        placeholder="정답을 입력하세요"
        showHints={true}
        additionalInfo={
          <div>
            {/* 한국어 의미 */}
            <div className="text-lg font-semibold mb-3 text-gray-700">
              📖 {problem.meaning}
            </div>
            
            {/* 한국어 예문 번역 */}
            {problem.exampleTranslation && (
              <p className="text-base text-gray-600 mb-4 leading-relaxed">
                {problem.exampleTranslation}
              </p>
            )}
            
            {/* 일본어 예문 (빈칸 포함) */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-lg text-gray-800 font-medium leading-relaxed">
                {problem.blankSentence}
              </p>
            </div>
          </div>
        }
      />
    );
  } 
  
  // 활용형 학습 뷰
  else if (studyType === "conjugation") {
    const problem = currentProblem as ConjugationProblem;
    return (
      <StudyPageComponent
        {...baseProps}
        questionText={`다음 단어의 ${problem.formName}을 입력하세요`}
        placeholder="활용형을 입력하세요"
        showHints={false}
        additionalInfo={
          <div className="text-center">
            <div className="bg-sakura-lighter rounded-lg p-4 mb-4">
              <div className="text-2xl font-bold text-gray-800 mb-2">
                {problem.word}
              </div>
              <div className="text-lg text-gray-600 mb-1">
                {problem.reading}
              </div>
              <div className="text-base text-gray-500 mb-3">
                {problem.meaning}
              </div>
              
              <div className="text-sm text-gray-600">
                <div className="mb-2">현재 활용형: <span className="font-semibold text-sakura-dark">{problem.formName}</span></div>
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
  }

  // 기본 오류 처리
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-lg text-red-500">잘못된 학습 유형입니다.</div>
    </div>
  );
};

export default Study;