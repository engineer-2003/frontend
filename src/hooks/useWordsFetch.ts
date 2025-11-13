// src/hooks/useWordsFetch.ts
import { useState, useEffect } from 'react';

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

interface UseWordsFetchParams {
  level: string;
  partId: string;
  studyType: string;
  isRetryMode: boolean;
  filterWords?: (words: WordDto[]) => WordDto[];
}

export const useWordsFetch = ({ level, partId, studyType, isRetryMode, filterWords }: UseWordsFetchParams) => {
  const [words, setWords] = useState<WordDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchWords = async () => {
      try {
        setLoading(true);
        const BASE_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8080';
        const token = localStorage.getItem("token");
        
        let endpoint = `${BASE_API_URL}/study?level=${level}&part=${partId}`;
        
        if (isRetryMode && token) {
          endpoint = `${BASE_API_URL}/study/incorrect?level=${level}&part=${partId}&studyType=${studyType}`;
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
        
        // 필터링 함수가 있으면 적용
        const filteredWords = filterWords ? filterWords(wordsData) : wordsData;
        
        if (filteredWords.length === 0) {
          if (isRetryMode) {
            setError(`재학습할 ${studyType === 'conjugation' ? '활용형' : '문장'} 문제가 없습니다.`);
          } else {
            setError(`${studyType === 'conjugation' ? '활용형 학습이 가능한' : '학습 가능한'} 단어가 없습니다.`);
          }
          return;
        }
        
        setWords(filteredWords);
      } catch (err) {
        setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchWords();
  }, [level, partId, isRetryMode, studyType, filterWords]);

  return { words, loading, error };
};