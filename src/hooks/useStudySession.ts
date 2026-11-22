// src/hooks/useStudySession.ts
import { useState, useRef, useEffect } from 'react';

interface StudySessionParams {
  level: string;
  partId: string;
  studyType: string;
  isRetryMode: boolean;
}

export const useStudySession = ({ level, partId, studyType, isRetryMode }: StudySessionParams) => {
  const BASE_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8080';
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [studyResults, setStudyResults] = useState(() => new Map<number, boolean>());
  const sessionStartTime = useRef<Date>(new Date());
  const studiedWords = useRef(new Set<number>());
  const sessionEnded = useRef<boolean>(false);

  // 학습 세션 시작
  const startStudySession = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${BASE_API_URL}/study/session/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          level,
          part: partId,
          studyType,
          isRetrySession: isRetryMode,
        }),
      });

      if (response.ok) {
        const data = await response.json();
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
      return;
    }

    sessionEnded.current = true;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return;
      }

      const correctCount = Array.from(studyResults.values()).filter(result => result).length;
      const totalCount = studiedWords.current.size;

      const studyResultsArray = Array.from(studyResults.entries()).map(([wordId, isCorrect]) => ({
        wordId,
        isCorrect,
        studyType,
      }));

      const payload = {
        correctCount,
        incorrectCount: totalCount - correctCount,
        totalCount,
        studyResults: studyResultsArray,
      };

      const response = await fetch(`${BASE_API_URL}/study/session/${sessionId}/end`, {
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
      return;
    }

    sessionEnded.current = true;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return;
      }

      const response = await fetch(`${BASE_API_URL}/study/session/${sessionId}/close`, {
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

  // beforeunload 이벤트 핸들러
  const handleBeforeUnload = (_event: BeforeUnloadEvent) => {
    if (sessionId && !sessionEnded.current) {
      const token = localStorage.getItem("token");
      if (token) {
        if (navigator.sendBeacon) {
          const url = `${BASE_API_URL}/study/session/${sessionId}/close?authToken=${encodeURIComponent(token)}`;
          const blob = new Blob(['{}'], { type: 'application/json' });
          navigator.sendBeacon(url, blob);
        }
        sessionEnded.current = true;
      }
    }
  };

  // 정답 확인 함수 - 세션 ID 및 인증 토큰 포함해서 백엔드에서 채점 + 결과 저장
  const checkAnswerWithSession = async (
    wordId: number,
    answer: string,
    formType?: string,
    studyType?: string
  ) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_API_URL}/study/${wordId}/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && {
          'Authorization': `Bearer ${token}`
        })
      },
      body: JSON.stringify({
        answer: answer,
        formType: formType || "",
        studyType: studyType || "sentence",
        sessionId: sessionId?.toString() || ""
      }),
    });

    if (!response.ok) {
      throw new Error('정답 확인에 실패했습니다.');
    }

    return await response.json();
  };

  // 로컬 세션 상태 업데이트 (DB 저장은 checkAnswerWithSession의 /check API에서 이미 처리됨)
  const handleAnswerResult = (wordId: number, isCorrect: boolean) => {
    setStudyResults(prev => new Map(prev).set(wordId, isCorrect));
    studiedWords.current.add(wordId);
  };

  // 뒤로가기 버튼 클릭 핸들러
  const handleBackButtonClick = async () => {
    await closeStudySession();
  };

  useEffect(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      if (!sessionEnded.current) {
        closeStudySession();
      }
    };
  }, [sessionId]);

  return {
    sessionId,
    studyResults,
    studiedWords: studiedWords.current,
    startStudySession,
    endStudySession,
    closeStudySession,
    handleAnswerResult,
    handleBackButtonClick,
    checkAnswerWithSession,
  };
};