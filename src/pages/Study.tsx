// src/pages/Study.tsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

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

interface CheckAnswerResponse {
  correct: boolean;
  userAnswer: string;
  correctAnswer: string;
  message: string;
  hint?: string;
  error?: string;
}

const Study: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const level = location.state?.level || "N3";
  const partId = location.state?.partId || "동사";
  const retryMode = location.state?.retryMode || false; // 재학습 모드
 
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [words, setWords] = useState<WordDto[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentWord, setCurrentWord] = useState<WordDto | null>(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [checkResult, setCheckResult] = useState<CheckAnswerResponse | null>(null);
  const [error, setError] = useState<string>("");
  
  // 학습 세션 관련 상태
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);

  // 예문에서 학습 단어를 빈칸으로 만들기
  const createBlankSentence = (sentence: string, word: string, reading: string) => {
    if (!sentence) return "例文がありません。";
   
    let blankSentence = sentence;
   
    if (word && word.trim()) {
      blankSentence = blankSentence.replace(new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '（　）');
    }
   
    if (reading && reading.trim() && !blankSentence.includes('（　）')) {
      blankSentence = blankSentence.replace(new RegExp(reading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '（　）');
    }
   
    return blankSentence;
  };

  // 학습 세션 시작
  const startStudySession = async (token: string) => {
    try {
      const response = await fetch(`http://localhost:8080/study/session/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          level: level,
          part: partId,
          studyType: 'sentence',
          isRetrySession: retryMode
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setSessionId(result.sessionId);
        setStartTime(new Date());
        console.log("학습 세션 시작:", result.sessionId);
      }
    } catch (error) {
      console.error("학습 세션 시작 실패:", error);
    }
  };

  // 학습 세션 종료
  const endStudySession = async () => {
    if (!sessionId) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:8080/study/session/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          sessionId: sessionId,
          totalQuestions: totalQuestions,
          correctAnswers: correctAnswers
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("학습 세션 종료:", result);
      }
    } catch (error) {
      console.error("학습 세션 종료 실패:", error);
    }
  };

  // 페이지 이탈 시 세션 종료
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (sessionId) {
        endStudySession();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (sessionId) {
        endStudySession();
      }
    };
  }, [sessionId, totalQuestions, correctAnswers]);

  // 단어 목록 가져오기
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }
    
    setIsAuthorized(true);

    const fetchWords = async () => {
      try {
        setLoading(true);
        
        // API URL 결정 (재학습 모드에 따라)
        const apiUrl = retryMode 
          ? `http://localhost:8080/study/incorrect?level=${level}&part=${partId}&studyType=sentence`
          : `http://localhost:8080/study?level=${level}&part=${partId}`;

        const response = await fetch(apiUrl, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
       
        if (!response.ok) {
          throw new Error('단어 목록을 가져오는데 실패했습니다.');
        }
       
        const wordsData: WordDto[] = await response.json();
       
        if (wordsData.length === 0) {
          if (retryMode) {
            setError("틀린 단어가 없습니다. 모든 단어를 정답으로 맞히셨네요!");
          } else {
            setError("해당 조건에 맞는 단어가 없습니다.");
          }
          return;
        }
       
        setWords(wordsData);
        setCurrentWord(wordsData[0]);
        
        // 학습 세션 시작
        await startStudySession(token);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchWords();
  }, [navigate, level, partId, retryMode]);

  // 정답 확인
  const handleCheckAnswer = async () => {
    if (!currentWord || !answer.trim()) {
      alert("답을 입력해주세요.");
      return;
    }
    
    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/study/${currentWord.id}/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          answer: answer.trim(),
          formType: "",
          studyType: "sentence" // 예문 학습임을 명시
        }),
      });

      if (!response.ok) {
        throw new Error('정답 확인에 실패했습니다.');
      }

      const result: CheckAnswerResponse = await response.json();
      setCheckResult(result);
      
      // 통계 업데이트
      setTotalQuestions(prev => prev + 1);
      if (result.correct) {
        setCorrectAnswers(prev => prev + 1);
      }
     
    } catch (err) {
      alert(err instanceof Error ? err.message : "정답 확인 중 오류가 발생했습니다.");
    }
  };

  // 다음 단어로 이동
  const handleNextWord = () => {
    if (words.length === 0) return;

    const nextIndex = (currentWordIndex + 1) % words.length;
    setCurrentWordIndex(nextIndex);
    setCurrentWord(words[nextIndex]);
    setAnswer("");
    setCheckResult(null);
  };

  // 이전 단어로 이동
  const handlePrevWord = () => {
    if (words.length === 0) return;

    const prevIndex = currentWordIndex === 0 ? words.length - 1 : currentWordIndex - 1;
    setCurrentWordIndex(prevIndex);
    setCurrentWord(words[prevIndex]);
    setAnswer("");
    setCheckResult(null);
  };

  // Enter 키로 정답 확인
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (checkResult?.correct) {
        handleNextWord();
      } else {
        handleCheckAnswer();
      }
    }
  };

  // 뒤로가기 시 세션 종료
  const handleGoBack = async () => {
    if (sessionId) {
      await endStudySession();
    }
    navigate(-1);
  };
  
  if (!isAuthorized) {
    return null;
  }

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
          {retryMode && " (재학습 모드)"}
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-sakura-dark text-white rounded-lg"
        >
          돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      {/* Header */}
      <div className="w-full bg-white rounded-b-3xl py-4 px-6 flex justify-between items-center shadow">
        <button
          onClick={handleGoBack}
          className="text-gray-500 text-sm"
        >
          〈 학습 화면
        </button>
        <div className="text-sm text-gray-500">
          {currentWordIndex + 1} / {words.length}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center w-full max-w-md px-6 mt-6">
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-3xl font-bold">
            {level} &gt; {partId}
          </h1>
          {retryMode && (
            <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
              재학습
            </span>
          )}
        </div>
        
        {/* 학습 진행 상황 표시 */}
        <div className="text-sm text-gray-600 mb-2">
          정답률: {totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0}% 
          ({correctAnswers}/{totalQuestions})
        </div>
        
        <div className="text-sakura text-xl mb-6">✿</div>

        {currentWord && (
          <div className="bg-white rounded-2xl shadow-md w-full p-6 text-center">
            {/* 한국어 번역 (의미) */}
            <h2 className="text-lg font-semibold mb-3 text-gray-700">
              📖 {currentWord.meaning}
            </h2>
           
            {/* 한국어 예문 번역 */}
            {currentWord.exampleTranslation && (
              <p className="text-base text-gray-600 mb-4 leading-relaxed">
                {currentWord.exampleTranslation}
              </p>
            )}
           
            {/* 일본어 예문 (빈칸 포함) */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-lg text-gray-800 font-medium leading-relaxed">
                {createBlankSentence(
                  currentWord.exampleSentence || `${currentWord.word}を使った例文が없します。`,
                  currentWord.word,
                  currentWord.reading
                )}
              </p>
            </div>

            {/* Result Display */}
            {checkResult && (
              <div className={`mb-4 p-3 rounded-lg ${
                checkResult.correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                <div className="font-semibold">{checkResult.message}</div>
                {!checkResult.correct && (
                  <div className="text-sm mt-2">
                    <div>정답: {checkResult.correctAnswer}</div>
                    {checkResult.hint && <div className="mt-1">{checkResult.hint}</div>}
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
                placeholder="정답을 입력하세요"
                className="w-full border-2 border-sakura-light focus:border-sakura-dark focus:outline-none px-4 py-3 rounded-lg text-center text-lg"
                disabled={checkResult?.correct}
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-between gap-2">
              <button
                onClick={handlePrevWord}
                className="w-[30%] px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition text-sm"
              >
                이전
              </button>
              <button
                onClick={checkResult?.correct ? handleNextWord : handleCheckAnswer}
                className="w-[35%] px-3 py-2 bg-sakura-dark text-white rounded-lg hover:bg-sakura-darker transition text-sm"
              >
                {checkResult?.correct ? "다음" : "정답 확인"}
              </button>
              <button
                onClick={handleNextWord}
                className="w-[30%] px-3 py-2 border border-sakura-dark text-sakura-dark rounded-lg hover:bg-sakura-darker hover:text-white transition text-sm"
              >
                건너뛰기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Study;