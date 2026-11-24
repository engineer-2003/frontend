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

type SentencePhase = "learning" | "test";

const WORDS_PER_SET = 10;

const shuffle = <T,>(arr: T[]): T[] =>
  [...arr].sort(() => Math.random() - 0.5);

/**
 * 예문에 실제 활용형이 포함되어 있는지 확인
 */
const hasMatchingConjugationForm = (word: WordDto): boolean => {
  const sentence = word.exampleSentence;
  const forms = word.forms;

  if (!sentence || !forms || Object.keys(forms).length === 0) {
    return false;
  }

  return Object.values(forms).some(
    (form) =>
      typeof form === "string" &&
      form.trim().length > 0 &&
      sentence.includes(form)
  );
};

const Study: React.FC = () => {
  const BASE_API_URL =
    import.meta.env.VITE_BACKEND_API_URL || "http://localhost:8080";

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

  const studySession = useStudySession({
    level,
    partId,
    studyType,
    isRetryMode,
  });

  /**
   * 활용형 학습에서는 예문에 실제 활용형이 존재하는 단어만 사용
   */
  const filterConjugatableWords = useCallback(
    (wordsData: WordDto[]) => {
      if (studyType === "conjugation") {
        return wordsData.filter(hasMatchingConjugationForm);
      }

      return wordsData;
    },
    [studyType]
  );

  const { words, loading, error } = useWordsFetch({
    level,
    partId,
    studyType,
    isRetryMode,
    filterWords: filterConjugatableWords,
  });

  /**
   * 문제 로드
   *
   * 활용형 학습은 백엔드가 예문에 실제로 등장하는
   * 활용형 하나를 선택해서 반환합니다.
   */
  const loadProblem = useCallback(
    async (
      wordId: number
    ): Promise<ConjugationProblem | SentenceProblem | null> => {
      try {
        let url: string;

        if (studyType === "conjugation") {
          url = `${BASE_API_URL}/study/${wordId}/form-problem`;
        } else {
          url = `${BASE_API_URL}/study/${wordId}/sentence-problem`;
        }

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("문제를 가져오는데 실패했습니다.");
        }

        const problemData:
          | ConjugationProblem
          | SentenceProblem = await response.json();

        setCurrentProblem(problemData);

        return problemData;
      } catch (err) {
        console.error("문제 로드 중 오류:", err);
        setCurrentProblem(null);
        return null;
      }
    },
    [BASE_API_URL, studyType]
  );

  /**
   * 학습 세션 초기화
   */
  useEffect(() => {
    sessionStartedRef.current = false;
  }, [level, partId, isRetryMode, studyType]);

  useEffect(() => {
    if (words.length === 0 || sessionStartedRef.current) {
      return;
    }

    sessionStartedRef.current = true;

    const initializeStudy = async () => {
      setCurrentWordIndex(0);
      setProblemStep(0);
      setBatchStartIndex(0);
      setSentencePhase("learning");

      await loadProblem(words[0].id);

      if (studySession.startStudySession) {
        studySession.startStudySession();
      }
    };

    initializeStudy();
  }, [words, loadProblem, studySession.startStudySession]);

  const currentWord = words[currentWordIndex];

  const currentSetCount = Math.min(
    WORDS_PER_SET,
    Math.max(0, words.length - batchStartIndex)
  );

  const currentSetPosition = currentWordIndex - batchStartIndex;

  /**
   * 선택지 생성
   */
  const options = useMemo<StudyOption[]>(() => {
    if (!currentProblem || !currentWord) {
      return [];
    }

    if (studyType === "conjugation") {
      const problem = currentProblem as ConjugationProblem;
      const correctAnswer = problem.correctAnswer;

      const sameWordForms = currentWord.forms
        ? Object.values(currentWord.forms).filter(
            (form) => form && form !== correctAnswer
          )
        : [];

      const otherWordForms = words
        .flatMap((word) =>
          word.forms ? Object.values(word.forms) : []
        )
        .filter(
          (form) =>
            form &&
            form !== correctAnswer &&
            !sameWordForms.includes(form)
        );

      const distractors = [
        ...shuffle(sameWordForms),
        ...shuffle(otherWordForms),
      ].slice(0, 3);

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
        wordOptions.map((option) => [option.value, option])
      ).values()
    );

    const correctOption = uniqueOptions.find(
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

    return shuffle([correctOption, ...distractors]);
  }, [currentProblem, studyType, words, currentWord, problemStep]);

  /**
   * 정답 확인
   */
  const handleCheckAnswer = useCallback(
    async (answer: string): Promise<CheckAnswerResponse> => {
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

    // 예문 학습
    if (studyType === "sentence") {
      // 단어 학습 단계
      if (sentencePhase === "learning") {
        const nextIndex = currentWordIndex + 1;

        if (nextIndex < batchStartIndex + currentSetCount) {
          setCurrentWordIndex(nextIndex);
          setProblemStep((prev) => prev + 1);

          await loadProblem(words[nextIndex].id);
          return;
        }

        // 학습 완료 후 테스트 시작
        setSentencePhase("test");
        setCurrentWordIndex(batchStartIndex);
        setProblemStep((prev) => prev + 1);

        await loadProblem(words[batchStartIndex].id);
        return;
      }

      // 테스트 단계
      const nextIndex = currentWordIndex + 1;

      if (nextIndex < batchStartIndex + currentSetCount) {
        setCurrentWordIndex(nextIndex);
        setProblemStep((prev) => prev + 1);

        await loadProblem(words[nextIndex].id);
        return;
      }

      // 다음 10개 단어 세트
      const nextBatchStart = batchStartIndex + WORDS_PER_SET;

      if (nextBatchStart < words.length) {
        setBatchStartIndex(nextBatchStart);
        setCurrentWordIndex(nextBatchStart);
        setSentencePhase("learning");
        setProblemStep((prev) => prev + 1);

        await loadProblem(words[nextBatchStart].id);
        return;
      }

      // 전체 학습 완료
      if (studySession.endStudySession) {
        await studySession.endStudySession();
      }

      alert("모든 예문 학습을 완료했습니다!");
      navigate(-1);
      return;
    }

    /**
     * 활용형 학습
     * 단어당 문제 하나만 출제
     */
    if (studyType === "conjugation") {
      const nextIndex = currentWordIndex + 1;

      if (nextIndex < words.length) {
        setCurrentWordIndex(nextIndex);
        setProblemStep((prev) => prev + 1);

        await loadProblem(words[nextIndex].id);
        return;
      }

      // 모든 활용형 예문 학습 완료
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
    if (words.length === 0 || studyType === "sentence") {
      return;
    }

    const prevIndex =
      currentWordIndex === 0
        ? words.length - 1
        : currentWordIndex - 1;

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

    // 활용형 학습은 단어당 한 문제
    return words.length;
  }, [words, studyType, currentSetCount]);

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
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  /**
   * 오류 화면
   */
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
        <div className="text-red-500 text-lg mb-4 text-center px-4">
          {error}
        </div>

        <div className="text-sm text-gray-600 mb-4">
          현재 설정: 레벨={level}, 품사={partId}
          {isRetryMode && ", 재학습 모드"}
        </div>

        {isRetryMode && error.includes("재학습할") && (
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-sakura-dark text-white rounded-lg"
          >
            돌아가기
          </button>
        )}
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
            ? "예문에서 학습할 활용형을 찾을 수 있는 단어가 없습니다."
            : "학습할 단어가 없습니다."}
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
        <div className="text-lg">문제를 로드하는 중...</div>
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
   * 예문 학습 및 테스트
   */
  if (studyType === "sentence") {
    const problem = currentProblem as SentenceProblem;

    // 단어 학습 단계
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

    // 예문 테스트 단계
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
   * 예문 기반 활용형 학습
   */
  if (studyType === "conjugation") {
    const problem = currentProblem as ConjugationProblem;

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
