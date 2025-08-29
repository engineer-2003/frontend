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

    if (!currentWord.word) return sentence;

    const escapedWord = currentWord.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); 
    const regex = new RegExp(escapedWord);
    return sentence.replace(regex, "（　）");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex
