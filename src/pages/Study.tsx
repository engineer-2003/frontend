// src/pages/Study.tsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// WordDto 타입 정의
interface WordDto {
  id: number;
  levelName: string;
  partOfSpeech: string;
  word: string;
  reading: string;
  meaning: string;
  exampleSentence: string;
  exampleTranslation: string;
  forms: { [key: string]: string };
}

// API 응답 타입
interface CheckAnswerResponse {
  correct: boolean;
  message: string;
}

const Study: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const level = location.state?.level || "N3";
  const partId = location.state?.partId || "동사";

  const [words, setWords] = useState<WordDto[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; isCorrect: boolean } | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  // 현재 단어
  const currentWord = words[currentWordIndex];
  
  // 현재 단어의 활용형 키들
  const formKeys = currentWord ? Object.keys(currentWord.forms).filter(key => currentWord.forms[key]) : [];
  
  // 랜덤한 활용형 선택 (빈 칸에 들어갈 형태)
  const [currentFormType, setCurrentFormType] = useState<string>("");

  // 컴포넌트 마운트 시 단어 목록 가져오기
  useEffect(() => {
    fetchWords();
  }, [level, partId]);

  // 새로운 단어가 로드될 때 활용형 타입 설정
  useEffect(() => {
  if (!currentWord) return;

  const keys = Object.keys(currentWord.forms).filter(key => currentWord.forms[key]);
  if (keys.length > 0) {
    const randomFormType = keys[Math.floor(Math.random() * keys.length)];
    setCurrentFormType(randomFormType);
    setShowAnswer(false);
    setFeedback(null);
  } else {
    setCurrentFormType("");
  }
}, [currentWord]);

  // 단어 목록 가져오기
  const fetchWords = async () => {
    setIsLoading(true);
    setError(null);

    console.log("👉 API 호출 값:", level, partId);  // 디버깅
    
    try {
      const response = await fetch(
        `http://localhost:8080/study?level=${encodeURIComponent(level)}&part=${encodeURIComponent(partId)}`
      );
      
      if (!response.ok) {
        throw new Error('단어를 가져오는데 실패했습니다.');
      }
      
      const data: WordDto[] = await response.json();
      
      if (data.length === 0) {
        throw new Error('해당 레벨과 품사에 대한 단어가 없습니다.');
      }
      
      setWords(data);
      setCurrentWordIndex(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 정답 확인
  const handleCheckAnswer = async () => {
    if (!currentWord || !answer.trim()) {
      setFeedback({ message: "답을 입력해주세요.", isCorrect: false });
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/study/${currentWord.id}/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answer: answer.trim(),
          formType: currentFormType
        }),
      });

      if (!response.ok) {
        throw new Error('정답 확인에 실패했습니다.');
      }

      const result: CheckAnswerResponse = await response.json();
      setFeedback({ message: result.message, isCorrect: result.correct });
      
      if (result.correct) {
        setShowAnswer(true);
      }
    } catch (err) {
      setFeedback({ 
        message: '정답 확인 중 오류가 발생했습니다.', 
        isCorrect: false 
      });
    }
  };

  // 다음 단어로 이동
  const handleNextWord = () => {
    if (!showAnswer) {
      setFeedback({ message: "정답을 입력해야 다음 단어로 넘어갈 수 있습니다.", isCorrect: false });
      return;
    }

    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
    } else {
      // 마지막 단어인 경우 처음으로 돌아가거나 완료 처리
      setCurrentWordIndex(0);
    }

    setAnswer("");
    setFeedback(null);
    setShowAnswer(false);
  };

  // 정답 보기
  const handleShowAnswer = () => {
    setShowAnswer(true);
    if (currentWord && currentFormType) {
      setFeedback({ 
        message: `정답: ${currentWord.forms[currentFormType]}`, 
        isCorrect: true 
      });
    }
  };

  // 로딩 중
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">단어를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 발생
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center p-6">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">오류가 발생했습니다</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-x-2">
            <button
              onClick={fetchWords}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            >
              다시 시도
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 단어가 없는 경우
  if (!currentWord) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">단어를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  // 학습 단어를 빈 칸으로 변경
  const getExampleWithBlank = () => {
    if (!currentWord) return "";

    const sentence = currentWord.exampleSentence || "";

    // currentWord.word가 없으면 예문 그대로 반환
    if (!currentWord.word) return sentence;

    // 첫 번째 등장하는 단어를 빈 칸으로 교체
    const escapedWord = currentWord.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // 특수문자 이스케이프
    const regex = new RegExp(escapedWord);
    return sentence.replace(regex, "（　）");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      {/* Header */}
      <div className="w-full bg-white rounded-b-3xl py-4 px-6 flex justify-between items-center shadow">
        <button
          onClick={() => navigate(-1)}
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
        <h1 className="text-3xl font-bold mb-2">
          {level} &gt; {partId}
        </h1>
        <div className="text-green-500 text-xl mb-6">✿</div>

        <div className="bg-white rounded-2xl shadow-md w-full p-6 text-center">
          {/* 예문 */}
          <p className="text-gray-700 mb-4 text-lg">
            {getExampleWithBlank()}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            <strong>번역:</strong> {currentWord.exampleTranslation}
          </p>

          {/* 활용형 힌트 */}
          <p className="text-sm text-blue-600 mb-6">
            {currentFormType
              ? <>빈 칸에 들어갈 <strong>{currentFormType}</strong>을 입력하세요</>
              : <>빈 칸에 들어갈 단어를 입력하세요</>
            }
          </p>

          {/* 입력 필드 */}
          <div className="mb-4">
            <label className="block text-left text-sm font-medium text-gray-700 mb-1">
              정답 입력
            </label>
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={`${currentFormType} 형태로 입력`}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleCheckAnswer();
                }
              }}
              disabled={showAnswer}
            />
          </div>

          {/* 피드백 메시지 */}
          {feedback && (
            <div className={`mb-4 p-3 rounded-lg ${
              feedback.isCorrect 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-red-100 text-red-700 border border-red-200'
            }`}>
              {feedback.message}
            </div>
          )}

          {/* 정답이 표시된 경우 예문 번역 보여주기 */}
          {showAnswer && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>번역:</strong> {currentWord.exampleTranslation}
              </p>
            </div>
          )}

          {/* 버튼들 */}
          <div className="flex justify-between gap-2">
            <button
              onClick={handleNextWord}
              className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            >
              다음 단어
            </button>
            
            {!showAnswer ? (
              <>
                <button
                  onClick={handleCheckAnswer}
                  className="flex-1 px-4 py-2 border border-green-500 text-green-600 rounded-lg hover:bg-green-50 transition"
                >
                  정답 확인
                </button>
                <button
                  onClick={handleShowAnswer}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition text-sm"
                >
                  정답 보기
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setAnswer("");
                  setFeedback(null);
                  setShowAnswer(false);
                  // 다른 활용형으로 다시 문제 생성
                  if (formKeys.length > 1) {
                    const otherForms = formKeys.filter(form => form !== currentFormType);
                    const newFormType = otherForms[Math.floor(Math.random() * otherForms.length)];
                    setCurrentFormType(newFormType);
                  }
                }}
                className="flex-1 px-4 py-2 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition"
              >
                다시 풀기
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Study;