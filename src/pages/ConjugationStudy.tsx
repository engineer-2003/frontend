// src/pages/ConjugationStudy.tsx
import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const level = location.state?.level || "N3";
  const partId = location.state?.partId || "동사";
  const isRetryMode = location.state?.retryMode || false;

  const [words, setWords] = useState<WordDto[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentFormIndex, setCurrentFormIndex] = useState(0);
  const [availableForms, setAvailableForms] = useState<string[]>([]);
  const [currentProblem, setCurrentProblem] = useState<ConjugationProblem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  
  // 학습 세션 추적을 위한 상태
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [studyResults, setStudyResults] = useState<Map<number, boolean>>(new Map());
  const sessionStartTime = useRef<Date>(new Date());
  const studiedWords = useRef<Set<number>>(new Set());
  const sessionEnded = useRef<boolean>(false);

  // 학습 세션 시작
  const startStudySession = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      console.log("학습 세션 시작 요청:", {
        level,
        part: partId,
        studyType: "conjugation",
        isRetrySession: isRetryMode,
      });

      const response = await fetch("http://localhost:8080/study/session/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          level,
          part: partId,
          studyType: "conjugation",
          isRetrySession: isRetryMode,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("학습 세션 시작 성공:", data);
        setSessionId(data.sessionId);
        sessionStartTime.current = new Date();
        sessionEnded.current = false;
      } else {
        console.error("학습 세션 시작 실패:", response.status);
      }
    } catch (error) {
      console.error("학습 세션 시작 실패:", error);
    }
  };

  // 학습 세션 정상 종료 (완료 시)
  const endStudySession = async () => {
    if (!sessionId || sessionEnded.current) {
      console.log("세션 종료 스킵:", { sessionId, sessionEnded: sessionEnded.current });
      return;
    }

    sessionEnded.current = true;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("토큰 없음 - 세션 종료 불가");
        return;
      }

      const correctCount = Array.from(studyResults.values()).filter(result => result).length;
      const totalCount = studiedWords.current.size;

      console.log("학습 세션 종료 시도:", {
        sessionId,
        correctCount,
        totalCount,
        studyResults: Array.from(studyResults.entries())
      });

      const studyResultsArray = Array.from(studyResults.entries()).map(([wordId, isCorrect]) => ({
        wordId,
        isCorrect,
        studyType: "conjugation",
      }));

      const payload = {
        correctCount,
        incorrectCount: totalCount - correctCount,
        totalCount,
        studyResults: studyResultsArray,
      };

      console.log("세션 종료 페이로드:", payload);

      const response = await fetch(`http://localhost:8080/study/session/${sessionId}/end`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log("학습 세션 종료 완료:", responseData);
      } else {
        const errorText = await response.text();
        console.error("학습 세션 종료 실패:", {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
      }
    } catch (error) {
      console.error("학습 세션 종료 실패:", error);
    }
  };

  // 학습 세션 강제 종료 (뒤로가기 시)
  const closeStudySession = async () => {
    if (!sessionId || sessionEnded.current) {
      console.log("세션 강제 종료 스킵:", { sessionId, sessionEnded: sessionEnded.current });
      return;
    }

    sessionEnded.current = true;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("토큰 없음 - 세션 강제 종료 불가");
        return;
      }

      console.log("학습 세션 강제 종료 시도:", { sessionId });

      const response = await fetch(`http://localhost:8080/study/session/${sessionId}/close`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log("학습 세션 강제 종료 완료:", responseData);
      } else {
        const errorText = await response.text();
        console.error("학습 세션 강제 종료 실패:", {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
      }
    } catch (error) {
      console.error("학습 세션 강제 종료 실패:", error);
    }
  };

  // beforeunload 이벤트 핸들러 (동기적 처리)
  const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    if (sessionId && !sessionEnded.current) {
      const token = localStorage.getItem("token");
      if (token) {
        // Beacon API를 사용한 비동기 요청으로 강제 종료
        if (navigator.sendBeacon) {
          const url = `http://localhost:8080/study/session/${sessionId}/close?authToken=${encodeURIComponent(token)}`;
          const blob = new Blob(['{}'], { type: 'application/json' });
          navigator.sendBeacon(url, blob);
          console.log("Beacon으로 학습 세션 강제 종료 요청 전송");
        }
        
        sessionEnded.current = true;
      }
    }
  };

  // 단어 목록 가져오기
  useEffect(() => {
    const fetchWords = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        
        let endpoint = `http://localhost:8080/study?level=${level}&part=${partId}`;
        
        if (isRetryMode && token) {
          endpoint = `http://localhost:8080/study/incorrect?level=${level}&part=${partId}&studyType=conjugation`;
        }
        
        const headers: HeadersInit = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
        
        const response = await fetch(endpoint, { headers });
        
        if (!response.ok) {
          throw new Error('단어 목록을 가져오는데 실패했습니다.');
        }
        
        const wordsData: WordDto[] = await response.json();
        
        if (wordsData.length === 0) {
          if (isRetryMode) {
            setError("재학습할 틀린 단어가 없습니다. 모든 문제를 정답으로 맞추셨네요! 🎉");
          } else {
            setError("해당 조건에 맞는 단어가 없습니다.");
          }
          return;
        }
        
        const conjugatableWords = wordsData.filter(word => 
          word.forms && Object.keys(word.forms).length > 0
        );

        if (conjugatableWords.length === 0) {
          if (isRetryMode) {
            setError("재학습할 활용형 문제가 없습니다.");
          } else {
            setError("활용형 학습이 가능한 단어가 없습니다.");
          }
          return;
        }
        
        setWords(conjugatableWords);
        
        const firstWordForms = Object.keys(conjugatableWords[0].forms);
        setAvailableForms(firstWordForms);
        setCurrentFormIndex(0);
        
        await loadProblem(conjugatableWords[0].id, firstWordForms[0]);
        await startStudySession();
      } catch (err) {
        setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchWords();

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      if (!sessionEnded.current) {
        closeStudySession();
      }
    };
  }, [level, partId, isRetryMode]);

  // 문제 로드
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
  };

  // 정답 결과 처리
  const handleAnswerResult = async (wordId: number, isCorrect: boolean) => {
    setStudyResults(prev => new Map(prev).set(wordId, isCorrect));
    studiedWords.current.add(wordId);

    console.log("정답 결과 처리:", { wordId, isCorrect, totalStudied: studiedWords.current.size });

    try {
      const token = localStorage.getItem("token");
      if (token) {
        await fetch("http://localhost:8080/study/result", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            wordId,
            isCorrect,
            studyType: "conjugation",
          }),
        });
      }
    } catch (error) {
      console.error("학습 결과 저장 실패:", error);
    }
  };

  // 뒤로가기 버튼 클릭 시 세션 강제 종료 처리
  const handleBackButtonClick = async () => {
    console.log("뒤로가기 버튼 클릭 - 세션 강제 종료 시작");
    await closeStudySession();
  };

  // 다음 활용형/단어로 이동
  const handleNext = () => {
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
  };

  // 이전 활용형/단어로 이동
  const handlePrevious = () => {
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
  };

  // 전체 학습 항목 수 계산
  const getTotalCount = () => {
    if (words.length === 0) return 0;
    const totalForms = words.reduce((sum, word) => sum + Object.keys(word.forms).length, 0);
    return totalForms;
  };

  // 현재 진행 상황 계산
  const getCurrentPosition = () => {
    if (words.length === 0) return 0;
    
    let position = 0;
    for (let i = 0; i < currentWordIndex; i++) {
      position += Object.keys(words[i].forms).length;
    }
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

  const currentWord = words[currentWordIndex];

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
      onAnswerResult={handleAnswerResult}
      onBackButtonClick={handleBackButtonClick}
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