// src/pages/learning/Study.tsx

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";

import { useLocation, useNavigate } from "react-router-dom";
import StudyPageComponent from "../../components/StudyPage";
import { useStudySession } from "../../hooks/useStudySession";
import { useWordsFetch } from "../../hooks/useWordsFetch";
import type { WordDto } from "../../hooks/useWordsFetch";

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
  blankSentence: string;
  exampleSentence: string;
  exampleTranslation: string;
  available?: boolean;
  fallbackUsed?: boolean;
  matchedText?: string;
}

interface SentenceProblem {
  id: number;
  word?: string;
  reading?: string;
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

export interface StudyOption {
  value: string;
  label: string;
}

interface ConjugationItem {
  word: WordDto;
  problem: ConjugationProblem;
}

type SentencePhase = "learning" | "test";

const WORDS_PER_SET = 10;

/**
 * 배열 무작위 섞기
 */
const shuffle = <T,>(arr: T[]): T[] => {
  const result = [...arr];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
};

/**
 * 활용형 표기 정규화
 */
const normalizeForm = (form: string): string => {
  return form.trim().replace(/[()（）]/g, "");
};

/**
 * 활용형 데이터 유효성 검사
 */
const isValidForm = (form: unknown): form is string => {
  if (typeof form !== "string") {
    return false;
  }

  const value = form.trim();

  return (
    value.length > 0 &&
    value !== "-" &&
    value.toLowerCase() !== "null" &&
    value.toLowerCase() !== "nan"
  );
};

const Study: React.FC = () => {
  const BASE_API_URL =
    import.meta.env.VITE_BACKEND_API_URL ||
    "http://localhost:8080";

  const location = useLocation();
  const navigate = useNavigate();

  const level = location.state?.level || "N3";
  const partId = location.state?.partId || "동사";
  const studyType = location.state?.studyType || "sentence";
  const isRetryMode = location.state?.retryMode || false;

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [problemStep, setProblemStep] = useState(0);

  const sessionStartedRef = useRef(false);

  const [sentencePhase, setSentencePhase] =
    useState<SentencePhase>("learning");

  const [batchStartIndex, setBatchStartIndex] = useState(0);

  const [currentProblem, setCurrentProblem] = useState<
    ConjugationProblem | SentenceProblem | null
  >(null);

  const [conjugationItems, setConjugationItems] =
    useState<ConjugationItem[]>([]);

  const [preparingProblems, setPreparingProblems] = useState(
    studyType === "conjugation"
  );

  const studySession = useStudySession({
    level,
    partId,
    studyType,
    isRetryMode,
  });

  /**
   * 활용형 학습에서는 프론트엔드에서
   * 단어를 임의로 제거하지 않습니다.
   */
  const filterWords = useCallback(
    (wordsData: WordDto[]) => wordsData,
    []
  );

  const {
    words: fetchedWords,
    loading,
    error,
  } = useWordsFetch({
    level,
    partId,
    studyType,
    isRetryMode,
    filterWords,
  });

  /**
   * 인증 헤더
   */
  const getAuthHeaders = useCallback((): HeadersInit => {
    const token = localStorage.getItem("token");

    const headers: HeadersInit = {};

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }, []);

  /**
   * 활용형 문제 가져오기
   */
  const fetchConjugationProblem = useCallback(
    async (
      wordId: number
    ): Promise<ConjugationProblem | null> => {
      try {
        const url =
          `${BASE_API_URL}/study/${wordId}/form-problem`;

        const response = await fetch(url, {
          method: "GET",
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          console.error(
            "활용형 API 응답 오류:",
            wordId,
            response.status,
            response.statusText
          );

          return null;
        }

        const problemData: ConjugationProblem =
          await response.json();

        if (
          !problemData ||
          problemData.available === false ||
          !isValidForm(problemData.correctAnswer) ||
          !problemData.formType ||
          !problemData.blankSentence
        ) {
          console.warn(
            "유효하지 않은 활용형 문제:",
            wordId,
            problemData
          );

          return null;
        }

        return problemData;

      } catch (err) {
        console.error(
          `활용형 문제 로드 실패 - 단어 ID: ${wordId}`,
          err
        );

        return null;
      }
    },
    [BASE_API_URL, getAuthHeaders]
  );

  /**
   * 문제 로드
   */
  const loadProblem = useCallback(
    async (
      wordId: number
    ): Promise<ConjugationProblem | SentenceProblem | null> => {
      try {
        if (studyType === "conjugation") {
          const item = conjugationItems.find(
            (item) => item.word.id === wordId
          );

          if (!item) {
            setCurrentProblem(null);
            return null;
          }

          setCurrentProblem(item.problem);
          return item.problem;
        }

        setCurrentProblem(null);

        const url =
          `${BASE_API_URL}/study/${wordId}/sentence-problem`;

        const response = await fetch(url, {
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          throw new Error(
            `문제 조회 실패: ${response.status}`
          );
        }

        const problemData: SentenceProblem =
          await response.json();

        setCurrentProblem(problemData);

        return problemData;

      } catch (err) {
        console.error("문제 로드 중 오류:", err);
        setCurrentProblem(null);
        return null;
      }
    },
    [
      BASE_API_URL,
      studyType,
      conjugationItems,
      getAuthHeaders,
    ]
  );

  /**
   * 실제 학습에 사용할 단어 목록
   */
  const words = useMemo<WordDto[]>(() => {
    if (studyType === "conjugation") {
      return conjugationItems.map((item) => item.word);
    }

    return fetchedWords;
  }, [studyType, conjugationItems, fetchedWords]);

  const currentWord = words[currentWordIndex];

  /**
   * 학습 세션 및 문제 상태 초기화
   */
  useEffect(() => {
    sessionStartedRef.current = false;

    setCurrentWordIndex(0);
    setProblemStep(0);
    setBatchStartIndex(0);
    setSentencePhase("learning");

    setCurrentProblem(null);
    setConjugationItems([]);

    setPreparingProblems(studyType === "conjugation");

  }, [
    level,
    partId,
    isRetryMode,
    studyType,
  ]);

  /**
   * 학습 시작 및 활용형 문제 사전 준비
   */
  useEffect(() => {
    if (loading || sessionStartedRef.current) {
      return;
    }

    if (fetchedWords.length === 0) {
      setPreparingProblems(false);
      return;
    }

    sessionStartedRef.current = true;

    let cancelled = false;

    const initializeStudy = async () => {
      setCurrentWordIndex(0);
      setProblemStep(0);
      setBatchStartIndex(0);
      setSentencePhase("learning");

      console.log("===== 학습 초기화 =====");
      console.log("레벨:", level);
      console.log("품사:", partId);
      console.log("학습 유형:", studyType);
      console.log("조회된 단어 수:", fetchedWords.length);

      /**
       * 활용형 학습
       */
      if (studyType === "conjugation") {
        setPreparingProblems(true);

        const availableItems: ConjugationItem[] = [];

        for (const word of shuffle(fetchedWords)) {
          if (cancelled) {
            return;
          }

          if (!word || !word.id) {
            continue;
          }

          console.log("활용형 문제 요청:", {
            id: word.id,
            word: word.word,
            reading: word.reading,
            forms: word.forms,
            exampleSentence: word.exampleSentence,
          });

          const problem =
            await fetchConjugationProblem(word.id);

          if (!problem) {
            console.warn(
              "출제 불가능한 단어:",
              word.id,
              word.word
            );

            continue;
          }

          console.log("문제 생성 성공:", {
            word: word.word,
            formType: problem.formType,
            formName: problem.formName,
            answer: problem.correctAnswer,
            fallbackUsed: problem.fallbackUsed,
          });

          availableItems.push({
            word,
            problem,
          });
        }

        if (cancelled) {
          return;
        }

        console.log(
          "최종 출제 가능 단어 수:",
          availableItems.length
        );

        setConjugationItems(availableItems);

        if (availableItems.length > 0) {
          setCurrentWordIndex(0);
          setCurrentProblem(availableItems[0].problem);

          if (studySession.startStudySession) {
            studySession.startStudySession();
          }
        } else {
          setCurrentProblem(null);
        }

        setPreparingProblems(false);
        return;
      }

      /**
       * 예문 학습
       */
      const firstWord = fetchedWords[0];

      if (firstWord) {
        const url =
          `${BASE_API_URL}/study/${firstWord.id}/sentence-problem`;

        try {
          const response = await fetch(url, {
            headers: getAuthHeaders(),
          });

          if (!response.ok) {
            throw new Error(
              `문제 조회 실패: ${response.status}`
            );
          }

          const problemData: SentenceProblem =
            await response.json();

          if (cancelled) {
            return;
          }

          setCurrentProblem(problemData);

        } catch (err) {
          console.error("첫 번째 예문 문제 로드 실패:", err);

          if (!cancelled) {
            setCurrentProblem(null);
          }
        }
      }

      if (!cancelled && studySession.startStudySession) {
        studySession.startStudySession();
      }
    };

    initializeStudy();

    return () => {
      cancelled = true;
    };

  }, [
    loading,
    fetchedWords,
    studyType,
    fetchConjugationProblem,
    BASE_API_URL,
    getAuthHeaders,
    studySession.startStudySession,
    level,
    partId,
  ]);

  /**
   * 현재 세트의 단어 수
   */
  const currentSetCount = Math.min(
    WORDS_PER_SET,
    Math.max(0, words.length - batchStartIndex)
  );

  const currentSetPosition =
    currentWordIndex - batchStartIndex;

  /**
   * 선택지 생성
   */
  const options = useMemo<StudyOption[]>(() => {
    if (!currentProblem || !currentWord) {
      return [];
    }

    if (studyType === "conjugation") {
      const problem =
        currentProblem as ConjugationProblem;

      const correctAnswer = problem.correctAnswer;

      if (!correctAnswer) {
        return [];
      }

      const sameWordForms = currentWord.forms
        ? Object.values(currentWord.forms)
            .filter(isValidForm)
            .map(normalizeForm)
            .filter(
              (form) =>
                form !== normalizeForm(correctAnswer)
            )
        : [];

      const otherWordForms = words
        .flatMap((word) =>
          word.forms
            ? Object.values(word.forms)
            : []
        )
        .filter(isValidForm)
        .map(normalizeForm)
        .filter(
          (form) =>
            form !== normalizeForm(correctAnswer) &&
            !sameWordForms.includes(form)
        );

      const uniqueDistractors = Array.from(
        new Set([
          ...shuffle(sameWordForms),
          ...shuffle(otherWordForms),
        ])
      );

      const distractors =
        uniqueDistractors.slice(0, 3);

      return shuffle(
        [correctAnswer, ...distractors].map((value) => ({
          value,
          label: value,
        }))
      );
    }

    const problem = currentProblem as SentenceProblem;

    const correctAnswer =
      problem.correctAnswers?.[0] || currentWord.word;

    if (!correctAnswer) {
      return [];
    }

    const wordOptions = words
      .filter((word) => word.word)
      .map((word) => ({
        value: word.word,
        label: word.reading || word.word,
      }));

    const uniqueOptions = Array.from(
      new Map(
        wordOptions.map((option) => [
          option.value,
          option,
        ])
      ).values()
    );

    const correctOption =
      uniqueOptions.find(
        (option) => option.value === correctAnswer
      ) || {
        value: correctAnswer,
        label: currentWord.reading || correctAnswer,
      };

    const distractors = shuffle(
      uniqueOptions.filter(
        (option) => option.value !== correctAnswer
      )
    ).slice(0, 5);

    return shuffle([
      correctOption,
      ...distractors,
    ]);

  }, [
    currentProblem,
    studyType,
    words,
    currentWord,
  ]);

  /**
   * 정답 확인
   */
  const handleCheckAnswer = useCallback(
    async (
      answer: string
    ): Promise<CheckAnswerResponse> => {
      if (!currentProblem || !currentWord) {
        throw new Error("문제가 로드되지 않았습니다.");
      }

      try {
        const formType =
          studyType === "conjugation"
            ? (currentProblem as ConjugationProblem).formType
            : "";

        return await studySession.checkAnswerWithSession(
          currentWord.id,
          answer,
          formType,
          studyType
        );

      } catch (err) {
        throw new Error(
          err instanceof Error
            ? err.message
            : "정답 확인 중 오류가 발생했습니다."
        );
      }
    },
    [
      currentProblem,
      currentWord,
      studySession.checkAnswerWithSession,
      studyType,
    ]
  );

  /**
   * 다음 문제
   */
  const handleNext = useCallback(async () => {
    if (words.length === 0) {
      return;
    }

    /**
     * 예문 학습
     */
    if (studyType === "sentence") {
      if (sentencePhase === "learning") {
        const nextIndex = currentWordIndex + 1;

        if (
          nextIndex <
          batchStartIndex + currentSetCount
        ) {
          setCurrentWordIndex(nextIndex);
          setProblemStep((prev) => prev + 1);

          await loadProblem(words[nextIndex].id);
          return;
        }

        setSentencePhase("test");
        setCurrentWordIndex(batchStartIndex);
        setProblemStep((prev) => prev + 1);

        await loadProblem(
          words[batchStartIndex].id
        );

        return;
      }

      const nextIndex = currentWordIndex + 1;

      if (
        nextIndex <
        batchStartIndex + currentSetCount
      ) {
        setCurrentWordIndex(nextIndex);
        setProblemStep((prev) => prev + 1);

        await loadProblem(words[nextIndex].id);
        return;
      }

      const nextBatchStart =
        batchStartIndex + WORDS_PER_SET;

      if (nextBatchStart < words.length) {
        setBatchStartIndex(nextBatchStart);
        setCurrentWordIndex(nextBatchStart);
        setSentencePhase("learning");
        setProblemStep((prev) => prev + 1);

        await loadProblem(words[nextBatchStart].id);
        return;
      }

      if (studySession.endStudySession) {
        await studySession.endStudySession();
      }

      alert("모든 예문 학습을 완료했습니다!");
      navigate(-1);
      return;
    }

    /**
     * 활용형 학습
     */
    if (studyType === "conjugation") {
      const nextIndex = currentWordIndex + 1;

      if (nextIndex < words.length) {
        setCurrentWordIndex(nextIndex);
        setProblemStep((prev) => prev + 1);

        await loadProblem(words[nextIndex].id);
        return;
      }

      if (studySession.endStudySession) {
        await studySession.endStudySession();
      }

      alert("모든 활용형 예문 학습을 완료했습니다!");
      navigate(-1);
    }

  }, [
    words,
    studyType,
    sentencePhase,
    currentWordIndex,
    batchStartIndex,
    currentSetCount,
    loadProblem,
    studySession.endStudySession,
    navigate,
  ]);

  /**
   * 이전 문제
   */
  const handlePrevious = useCallback(async () => {
    if (
      words.length === 0 ||
      studyType === "sentence"
    ) {
      return;
    }

    const prevIndex =
      currentWordIndex === 0
        ? words.length - 1
        : currentWordIndex - 1;

    setCurrentProblem(null);
    setCurrentWordIndex(prevIndex);
    setProblemStep((prev) => prev + 1);

    await loadProblem(words[prevIndex].id);

  }, [
    words,
    studyType,
    currentWordIndex,
    loadProblem,
  ]);

  /**
   * 전체 문제 수
   */
  const getTotalCount = useCallback(() => {
    if (words.length === 0) {
      return 0;
    }

    if (studyType === "sentence") {
      return currentSetCount;
    }

    return words.length;

  }, [
    words,
    studyType,
    currentSetCount,
  ]);

  /**
   * 현재 문제 위치
   */
  const getCurrentPosition = useCallback(() => {
    if (words.length === 0) {
      return 0;
    }

    if (studyType === "sentence") {
      return currentSetPosition;
    }

    return currentWordIndex;

  }, [
    words,
    studyType,
    currentSetPosition,
    currentWordIndex,
  ]);

  /**
   * 로딩 화면
   */
  if (
    loading ||
    (studyType === "conjugation" && preparingProblems)
  ) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-lg text-center px-6">
          {studyType === "conjugation"
            ? "출제할 수 있는 활용형 문제를 확인하고 있습니다..."
            : "로딩 중..."}
        </div>
      </div>
    );
  }

  /**
   * API 오류
   */
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-6">
        <div className="text-red-500 text-lg mb-4 text-center">
          {error}
        </div>

        <div className="text-sm text-gray-600 mb-4">
          현재 설정: 레벨={level}, 품사={partId}
          {isRetryMode && ", 재학습 모드"}
        </div>

        <button
          onClick={() => navigate(-1)}
          className="px-5 py-3 bg-sakura-dark text-white rounded-xl"
        >
          돌아가기
        </button>
      </div>
    );
  }

  /**
   * 학습할 단어가 없는 경우
   */
  if (words.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-6 text-center">
        <div className="text-lg font-medium text-gray-700">
          {studyType === "conjugation"
            ? "학습 가능한 활용형 문제가 없습니다. 단어 데이터와 활용형 정보를 확인해 주세요."
            : "학습할 단어가 없습니다."}
        </div>

        <div className="mt-3 text-sm text-gray-500">
          레벨: {level} / 품사: {partId}
        </div>

        <button
          onClick={() => navigate(-1)}
          className="mt-5 px-5 py-3 bg-sakura-dark text-white rounded-xl"
        >
          돌아가기
        </button>
      </div>
    );
  }

  /**
   * 문제 로딩 화면
   */
  if (!currentProblem || !currentWord) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-lg">
          문제를 로드하는 중...
        </div>
      </div>
    );
  }

  /**
   * 공통 props
   */
  const baseProps = {
    key: `${currentWord.id}-${problemStep}-${sentencePhase}`,
    title: `${level} > ${partId}${isRetryMode ? " (재학습)" : ""}`,
    label: `${level} | ${partId}`,
    currentIndex: getCurrentPosition(),
    totalCount: getTotalCount(),
    onCheckAnswer: handleCheckAnswer,
    onNext: handleNext,
    onPrevious: handlePrevious,
    currentWordId: currentWord.id,
    onAnswerResult: studySession.handleAnswerResult,
    onBackButtonClick: studySession.handleBackButtonClick,
    options,
    questionText: "괄호에 알맞은 카드를 선택하세요",
    placeholder: "",
  };

  /**
   * 예문 학습
   */
  if (studyType === "sentence") {
    const problem = currentProblem as SentenceProblem;

    if (sentencePhase === "learning") {
      return (
        <StudyPageComponent
          {...baseProps}
          phase="learning"
          additionalInfo={
            <div className="space-y-3 text-center">
              <div className="text-sm text-gray-400">
                {currentWord.reading}
              </div>

              <div className="text-2xl font-bold text-gray-800">
                {currentWord.word}
              </div>

              <div className="text-base text-gray-700">
                {currentWord.meaning}
              </div>

              <div className="bg-gray-50 p-5 rounded-xl space-y-3">
                <div className="text-lg font-medium text-gray-800 leading-relaxed">
                  {currentWord.exampleSentence}
                </div>

                <div className="text-sm text-gray-500 leading-relaxed">
                  {currentWord.exampleTranslation}
                </div>
              </div>
            </div>
          }
        />
      );
    }

    return (
      <StudyPageComponent
        {...baseProps}
        phase="test"
        additionalInfo={
          <div className="space-y-4 text-center">
            <div className="text-lg font-bold text-gray-800">
              {problem.meaning}
            </div>

            <div className="bg-gray-50 p-5 rounded-xl space-y-3">
              <div className="text-lg font-medium text-gray-800 leading-relaxed">
                {problem.blankSentence}
              </div>

              <div className="border-t border-gray-200 pt-3 text-sm text-gray-500 leading-relaxed">
                {problem.exampleTranslation}
              </div>
            </div>
          </div>
        }
      />
    );
  }

  /**
   * 활용형 학습
   */
  if (studyType === "conjugation") {
    const problem =
      currentProblem as ConjugationProblem;

    return (
      <StudyPageComponent
        {...baseProps}
        phase="test"
        additionalInfo={
          <div className="space-y-4 text-center">
            <div>
              <div className="text-sm text-gray-400">
                {problem.reading}
              </div>

              <div className="text-2xl font-bold text-gray-800">
                {problem.word}
              </div>

              <div className="text-base font-medium text-gray-700 mt-1">
                {problem.meaning}
              </div>

              <div className="mt-2 text-sm text-sakura-dark font-medium">
                {problem.formName || problem.formType}
              </div>
            </div>

            <div className="bg-gray-50 p-5 rounded-xl space-y-3">
              <div className="text-lg font-medium text-gray-800 leading-relaxed">
                {problem.blankSentence}
              </div>

              <div className="border-t border-gray-200 pt-3 text-sm text-gray-500 leading-relaxed">
                {problem.exampleTranslation}
              </div>
            </div>
          </div>
        }
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-lg text-red-500">
        잘못된 학습 유형입니다.
      </div>
    </div>
  );
};

export default Study;
