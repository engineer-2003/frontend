// src/pages/ConjugationStudy.tsx
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import StudyPageComponent from "../components/StudyPage";

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
  const level = location.state?.level || "N3";
  const partId = location.state?.partId || "동사";

  const [words, setWords] = useState<WordDto[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentFormIndex, setCurrentFormIndex] = useState(0);
  const [availableForms, setAvailableForms] = useState<string[]>([]);
  const [currentProblem, setCurrentProblem] = useState<ConjugationProblem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // 단어 목록 가져오기
  useEffect(() => {
    const fetchWords = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8080/study?level=${level}&part=${partId}`);
        
        if (!response.ok) {
          throw new Error('단어 목록을 가져오는데 실패했습니다.');
        }
        
        const wordsData: WordDto[] = await response.json();
        
        if (wordsData.length === 0) {
          setError("해당 조건에 맞는 단어가 없습니다.");
          return;
        }
        
        // 활용형이 있는 단어만 필터링
        const conjugatableWords = wordsData.filter(word => 
          word.forms && Object.keys(word.forms).length > 0
        );

        if (conjugatableWords.length === 0) {
          setError("활용형 학습이 가능한 단어가 없습니다.");
          return;
        }
        
        setWords(conjugatableWords);
        
        // 첫 번째 단어의 활용형 목록 설정
        const firstWordForms = Object.keys(conjugatableWords[0].forms);
        setAvailableForms(firstWordForms);
        setCurrentFormIndex(0);
        
        await loadProblem(conjugatableWords[0].id, firstWordForms[0]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchWords();
  }, [level, partId]);

  // 문제 로드 (특정 활용형 지정)
  const loadProblem = async (wordId: number, formType?: string) => {
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
          formType: currentProblem.formType
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

  // 다음 활용형/단어로 이동
  const handleNext = () => {
    if (words.length === 0 || availableForms.length === 0) return;

    const currentWord = words[currentWordIndex];
    
    // 현재 단어의 다음 활용형이 있는지 확인
    if (currentFormIndex + 1 < availableForms.length) {
      // 같은 단어의 다음 활용형으로 이동
      const nextFormIndex = currentFormIndex + 1;
      setCurrentFormIndex(nextFormIndex);
      loadProblem(currentWord.id, availableForms[nextFormIndex]);
    } else {
      // 다음 단어의 첫 번째 활용형으로 이동
      const nextWordIndex = (currentWordIndex + 1) % words.length;
      const nextWord = words[nextWordIndex];
      const nextWordForms = Object.keys(nextWord.forms);
      
      setCurrentWordIndex(nextWordIndex);
      setCurrentFormIndex(0);
      setAvailableForms(nextWordForms);
      loadProblem(nextWord.id, nextWordForms[0]);
    }
  };

  // 이전 활용형/단어로 이동
  const handlePrevious = () => {
    if (words.length === 0 || availableForms.length === 0) return;

    // 현재 단어의 이전 활용형이 있는지 확인
    if (currentFormIndex > 0) {
      // 같은 단어의 이전 활용형으로 이동
      const prevFormIndex = currentFormIndex - 1;
      setCurrentFormIndex(prevFormIndex);
      const currentWord = words[currentWordIndex];
      loadProblem(currentWord.id, availableForms[prevFormIndex]);
    } else {
      // 이전 단어의 마지막 활용형으로 이동
      const prevWordIndex = currentWordIndex === 0 ? words.length - 1 : currentWordIndex - 1;
      const prevWord = words[prevWordIndex];
      const prevWordForms = Object.keys(prevWord.forms);
      const lastFormIndex = prevWordForms.length - 1;
      
      setCurrentWordIndex(prevWordIndex);
      setCurrentFormIndex(lastFormIndex);
      setAvailableForms(prevWordForms);
      loadProblem(prevWord.id, prevWordForms[lastFormIndex]);
    }
  };

  // 전체 학습 항목 수 계산 (단어 수 × 평균 활용형 수)
  const getTotalCount = () => {
    if (words.length === 0) return 0;
    const totalForms = words.reduce((sum, word) => sum + Object.keys(word.forms).length, 0);
    return totalForms;
  };

  // 현재 진행 상황 계산
  const getCurrentPosition = () => {
    if (words.length === 0) return 0;
    
    let position = 0;
    // 이전 단어들의 활용형 수 합계
    for (let i = 0; i < currentWordIndex; i++) {
      position += Object.keys(words[i].forms).length;
    }
    // 현재 단어의 현재 활용형 위치 추가
    position += currentFormIndex;
    
    return position;
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
        <div className="text-red-500 text-lg mb-4">{error}</div>
        <div className="text-sm text-gray-600 mb-4">
          현재 설정: 레벨={level}, 품사={partId}
        </div>
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

  const currentWord = words[currentWordIndex];

  return (
    <StudyPageComponent
      title={`${level} > ${partId}`}
      questionText={`다음 단어의 ${currentProblem.formName}을 입력하세요`}
      placeholder="활용형을 입력하세요"
      currentIndex={getCurrentPosition()}
      totalCount={getTotalCount()}
      onCheckAnswer={handleCheckAnswer}
      onNext={handleNext}
      onPrevious={handlePrevious}
      showHints={false} // 활용형 연습에서는 힌트를 표시하지 않음
      additionalInfo={
        <div className="text-center">
          {/* 기본형 단어 */}
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
            
            {/* 활용형 진행 상황 표시 */}
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