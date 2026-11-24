// src/pages/learning/Study.tsx
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
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

const shuffle = <T,>(arr: T[]): T[] =>
  [...arr].sort(() => Math.random() - 0.5);

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

  const [currentFormIndex, setCurrentFormIndex] = useState(0);
  const [availableForms, setAvailableForms] = useState<string[]>([]);

  const [currentProblem, setCurrentProblem] = useState<
    ConjugationProblem | SentenceProblem | null
  >(null);

  const studySession = useStudySession({
    level,
    partId,
    studyType,
    isRetryMode,
  });

  const filterConjugatableWords = useCallback(
    (wordsData: WordDto[]) => {
      if (studyType === "conjugation") {
        return wordsData.filter(
          (word) => word.forms && Object.keys(word.forms).length > 0
        );
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

  const loadProblem = useCallback(
    async (wordId: number, formType?: string) => {
      try {
        let url: string;

        if (studyType === "conjugation") {
          url = formType
            ? `${BASE_API_URL}/study/${wordId}/form-problem?formType=${encodeURIComponent(
                formType
              )}`
            : `${BASE_API_URL}/study/${wordId}/form-problem`;
        } else {
          url = `${BASE_API_URL}/study/${wordId}/sentence-problem`;
        }

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("문제를 가져오는데 실패했습니다.");
        }

        const problemData: ConjugationProblem | SentenceProblem =
          await response.json();

        setCurrentProblem(problemData);
      } catch (err) {
        console.error("문제 로드 중 오류:", err);
        setCurrentProblem(null);
      }
    },
    [BASE_API_URL, studyType]
  );

  useEffect(() => {
    if (words.length > 0 && !sessionStartedRef.current) {
      sessionStartedRef.current = true;
      setCurrentWordIndex(0);
      setProblemStep(0);

      if (studyType === "conjugation" && words[0].forms) {
        const firstWordForms = Object.keys(words[0].forms);

        setAvailableForms(firstWordForms);
        setCurrentFormIndex(0);
        loadProblem(words[0].id, firstWordForms[0]);
      } else {
        loadProblem(words[0].id);
      }

      if (studySession.startStudySession) {
        studySession.startStudySession();
      }
    }
  }, [words, loadProblem, studySession.startStudySession, studyType]);

  useEffect(() => {
    sessionStartedRef.current = false;
  }, [level, partId, isRetryMode, studyType]);

  const currentWord = words[currentWordIndex];

  // 선택지 생성
  const options = useMemo<StudyOption[]>(() => {
    if (!currentProblem || !currentWord) return [];

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

    if (!correctAnswer) return [];

    // 실제 정답값은 word로 유지하고,
    // 화면에는 reading을 표시합니다.
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
    ).slice(0, 3);

    return shuffle([correctOption, ...distractors]);
  }, [currentProblem, studyType, words, currentWord, problemStep]);

  // 정답 확인
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

        const result: CheckAnswerResponse =
          await studySession.checkAnswerWithSession(
            currentWord.id,
            answer,
            formType,
            studyType
          );

        return result;
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

  // 다음 문제로 이동
  const handleNext = useCallback(async () => {
    if (words.length === 0) return;

    if (studyType === "conjugation") {
      if (availableForms.length === 0) return;

      const word = words[currentWordIndex];

      if (currentFormIndex + 1 < availableForms.length) {
        const nextFormIndex = currentFormIndex + 1;

        setCurrentFormIndex(nextFormIndex);
        setProblemStep((prev) => prev + 1);

        await loadProblem(word.id, availableForms[nextFormIndex]);
      } else if (currentWordIndex + 1 < words.length) {
        const nextWordIndex = currentWordIndex + 1;
        const nextWord = words[nextWordIndex];
        const nextWordForms = Object.keys(nextWord.forms);

        setCurrentWordIndex(nextWordIndex);
        setCurrentFormIndex(0);
        setAvailableForms(nextWordForms);
        setProblemStep((prev) => prev + 1);

        await loadProblem(nextWord.id, nextWordForms[0]);
      } else {
        if (studySession.endStudySession) {
          await studySession.endStudySession();
        }

        alert("모든 문제를 완료했습니다! 🎉");
        navigate(-1);
      }
    } else {
      if (currentWordIndex + 1 < words.length) {
        const nextIndex = currentWordIndex + 1;

        setCurrentWordIndex(nextIndex);
        setProblemStep((prev) => prev + 1);

        await loadProblem(words[nextIndex].id);
      } else {
        if (studySession.endStudySession) {
          await studySession.endStudySession();
        }

        alert("모든 문제를 완료했습니다! 🎉");
        navigate(-1);
      }
    }
  }, [
    words,
    availableForms,
    currentWordIndex,
    currentFormIndex,
    loadProblem,
    studyType,
    studySession.endStudySession,
    navigate,
  ]);

  // 이전 문제로 이동
  const handlePrevious = useCallback(async () => {
    if (words.length === 0) return;

    if (studyType === "conjugation") {
      if (availableForms.length === 0) return;

      if (currentFormIndex > 0) {
        const prevFormIndex = currentFormIndex - 1;

        setCurrentFormIndex(prevFormIndex);
        setProblemStep((prev) => prev + 1);

        await loadProblem(
          words[currentWordIndex].id,
          availableForms[prevFormIndex]
        );
      } else {
        const prevWordIndex =
          currentWordIndex === 0
            ? words.length - 1
            : currentWordIndex - 1;

        const prevWord = words[prevWordIndex];
        const prevWordForms = Object.keys(prevWord.forms);
        const lastFormIndex = prevWordForms.length - 1;

        setCurrentWordIndex(prevWordIndex);
        setCurrentFormIndex(lastFormIndex);
        setAvailableForms(prevWordForms);
        setProblemStep((prev) => prev + 1);

        await loadProblem(
          prevWord.id,
          prevWordForms[lastFormIndex]
        );
      }
    } else {
      const prevIndex =
        currentWordIndex === 0
          ? words.length - 1
          : currentWordIndex - 1;

      setCurrentWordIndex(prevIndex);
      setProblemStep((prev) => prev + 1);

      await loadProblem(words[prevIndex].id);
    }
  }, [
    words,
    availableForms,
    currentWordIndex,
    currentFormIndex,
    loadProblem,
    studyType,
  ]);

  const getTotalCount = useCallback(() => {
    if (words.length === 0) return 0;

    if (studyType === "conjugation") {
      return words.reduce(
        (sum, word) => sum + Object.keys(word.forms).length,
        0
      );
    }

    return words.length;
  }, [words, studyType]);

  const getCurrentPosition = useCallback(() => {
    if (words.length === 0) return 0;

    if (studyType === "conjugation") {
      let position = 0;

      for (let i = 0; i < currentWordIndex; i++) {
        position += Object.keys(words[i].forms).length;
      }

      position += currentFormIndex;
      return position;
    }

    return currentWordIndex;
  }, [words, currentWordIndex, currentFormIndex, studyType]);

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
            className="px-4 py-2 bg-sakura-dark text-white rounded-lg hover:bg-sakura-darker transition"
          >
            돌아가기
          </button>
        )}
      </div>
    );
  }

  if (!currentProblem || !currentWord) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-lg">문제를 로드하는 중...</div>
      </div>
    );
  }

  const studyTypeLabel =
    studyType === "conjugation" ? "활용형" : "예문";

  const baseProps = {
    key: `${currentWord.id}-${problemStep}`,
    title: `${level} > ${partId}${isRetryMode ? " (재학습)" : ""}`,
    label: `${level} | ${partId} ${studyTypeLabel}`,
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

  // 예문 학습
  if (studyType === "sentence") {
    const problem = currentProblem as SentenceProblem;

    return (
      <StudyPageComponent
        {...baseProps}
        additionalInfo={
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-400">
                {currentWord.word}
              </div>

              <div className="text-2xl font-bold text-gray-800">
                {currentWord.reading}
              </div>

              <div className="text-base font-medium text-gray-700 mt-1">
                {problem.meaning}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl text-lg font-medium">
              {problem.blankSentence}
            </div>

            {problem.exampleTranslation && (
              <div className="text-gray-500 text-sm italic">
                {problem.exampleTranslation}
              </div>
            )}
          </div>
        }
      />
    );
  }

  // 활용형 학습
  if (studyType === "conjugation") {
    const problem = currentProblem as ConjugationProblem;

    return (
      <StudyPageComponent
        {...baseProps}
        additionalInfo={
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-400">
                {problem.word}
              </div>

              <div className="text-2xl font-bold text-gray-800">
                {problem.reading}
              </div>

              <div className="text-base font-medium text-gray-700 mt-1">
                {problem.meaning}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl text-base font-medium text-gray-800">
              <span>{problem.word}</span>의{" "}
              <span className="font-bold text-sakura-dark">
                {problem.formName}
              </span>

              <div className="flex justify-center space-x-1 mt-3">
                {availableForms.map((form, index) => (
                  <div
                    key={form}
                    className={`w-2 h-2 rounded-full ${
                      index === currentFormIndex
                        ? "bg-sakura-dark"
                        : index < currentFormIndex
                        ? "bg-sakura"
                        : "bg-gray-300"
                    }`}
                    title={form}
                  />
                ))}
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