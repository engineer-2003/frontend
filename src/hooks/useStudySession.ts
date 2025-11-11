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
        studyType,
        isRetrySession: isRetryMode,
      });

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
        studyType,
      }));

      const payload = {
        correctCount,
        incorrectCount: totalCount - correctCount,
        totalCount,
        studyResults: studyResultsArray,
      };

      console.log("세션 종료 페이로드:", payload);

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
          console.log("Beacon으로 학습 세션 강제 종료 요청 전송");
        }
        
        sessionEnded.current = true;
      }
    }
  };

  // 정답 확인 함수 - 세션 ID 포함해서 전송
  const checkAnswerWithSession = async (
    wordId: number,
    answer: string,
    formType?: string,
    studyType?: string
  ) => {
    try {
      const response = await fetch(`${BASE_API_URL}/study/${wordId}/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem("token") && {
            'Authorization': `Bearer ${localStorage.getItem("token")}`
          })
        },
        body: JSON.stringify({
          answer: answer,
          formType: formType || "",
          studyType: studyType || "sentence",
          sessionId: sessionId?.toString() || "" // 세션 ID 추가
        }),
      });

      if (!response.ok) {
        throw new Error('정답 확인에 실패했습니다.');
      }

      return await response.json();
    } catch (error) {
      throw error;
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
        await fetch(`${BASE_API_URL}/study/result`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            wordId,
            isCorrect,
            studyType,
          }),
        });
      }
    } catch (error) {
      console.error("학습 결과 저장 실패:", error);
    }
  };

  // 뒤로가기 버튼 클릭 핸들러
  const handleBackButtonClick = async () => {
    console.log("뒤로가기 버튼 클릭 - 세션 강제 종료 시작");
    await closeStudySession();
  };

  // useEffect로 이벤트 리스너 등록/해제
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