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
  
  const [words, setWords] = useState<WordDto[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentWord, setCurrentWord] = useState<WordDto | null>(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [checkResult, setCheckResult] = useState<CheckAnswerResponse | null>(null);
  const [error, setError] = useState<string>("");

  // 예문에서 학습 단어를 빈칸으로 만들기
  const createBlankSentence = (sentence: string, word: string, reading: string) => {
    if (!sentence) return "例文がありません。";
    
    // 단어 또는 읽기로 빈칸 만들기
    let blankSentence = sentence;
    
    // 한자 형태의 단어를 빈칸으로
    if (word && word.trim()) {
      blankSentence = blankSentence.replace(new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\  const [error, setError] = useState<string>("");'), 'gi'), '（　）');
    }
    
    // 히라가나 읽기도 빈칸으로 (아직 빈칸이 안 된 경우)
    if (reading && reading.trim() && !blankSentence.includes('（　）')) {
      blankSentence = blankSentence.replace(new RegExp(reading.replace(/[.*+?^${}()|[\]\\]/g, '\\  const [error, setError] = useState<string>("");'), 'gi'), '（　）');
    }
    
    return blankSentence;
  };

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
        
        setWords(wordsData);
        setCurrentWord(wordsData[0]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchWords();
  }, [level, partId]);

  // 정답 확인
  const handleCheckAnswer = async () => {
    if (!currentWord || !answer.trim()) {
      alert("답을 입력해주세요.");
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
          formType: "" // 기본적으로 단어 자체를 체크, 필요시 활용형 타입 추가
        }),
      });

      if (!response.ok) {
        throw new Error('정답 확인에 실패했습니다.');
      }

      const result: CheckAnswerResponse = await response.json();
      setCheckResult(result);
      
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
      handleCheckAnswer();
    }
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
                  currentWord.exampleSentence || `${currentWord.word}を使った例文이 없습니다。`, 
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
                onClick={handleNextWord}
                className="w-[30%] px-3 py-2 bg-sakura-dark text-white rounded-lg hover:bg-sakura-darker transition text-sm"
              >
                다음
              </button>
              <button
                onClick={handleCheckAnswer}
                disabled={!answer.trim() || checkResult?.correct}
                className="w-[35%] px-3 py-2 border border-sakura-dark text-sakura-dark rounded-lg hover:bg-sakura-darker hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                정답 확인
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Study;