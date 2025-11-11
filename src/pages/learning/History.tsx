// src/pages/learning/History.tsx
import React, { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface StudyRecord {
  studyDate: string;
  levelName: string;
  partOfSpeech: string;
  wordCount: number;
  studyTime: number;
  studyDuration: string;
}

export default function History() {
  const BASE_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8080';
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [records, setRecords] = useState<StudyRecord[]>([]);
  const [totalTime, setTotalTime] = useState(0);
  const [weekStats, setWeekStats] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/user/login");
    } else {
      setIsAuthorized(true);
      fetchStudyRecords(token);
    }
  }, [navigate]);

  const fetchStudyRecords = async (token: string) => {
    try {
      const response = await fetch(`${BASE_API_URL}/study/records`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: StudyRecord[] = await response.json();
      const sortedData = data.sort((a, b) => new Date(b.studyDate).getTime() - new Date(a.studyDate).getTime());
      
      setRecords(sortedData);
      calculateWeekStats(sortedData);

    } catch (error) {
      console.error('학습 기록 조회 오류:', error);
      alert("학습 기록을 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const calculateWeekStats = (data: StudyRecord[]) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentRecords = data.filter(record => {
      const recordDate = new Date(record.studyDate + 'T00:00:00');
      return recordDate >= sevenDaysAgo && recordDate <= today;
    });

    const totalSeconds = recentRecords.reduce((sum, record) => sum + record.studyTime, 0);
    setTotalTime(totalSeconds);

    const stats = [0, 0, 0, 0, 0, 0, 0];
    recentRecords.forEach(record => {
      const recordDate = new Date(record.studyDate + 'T00:00:00');
      const dayOfWeek = recordDate.getDay();
      stats[dayOfWeek] += record.studyTime;
    });
    
    setWeekStats(stats);
  };
  
  const days = ["일", "월", "화", "수", "목", "금", "토"];

  if (!isAuthorized) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-sakura-dark border-t-transparent mb-4"></div>
          <div className="text-lg text-gray-600">학습 기록을 불러오는 중...</div>
        </div>
      </div>
    );
  }

  const formatTime = (seconds: number): string => {
    if (seconds === 0) return "0초";
    
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    const parts: string[] = [];
    if (h > 0) parts.push(`${h}시간`);
    if (m > 0) parts.push(`${m}분`);
    if (s > 0 || parts.length === 0) parts.push(`${s}초`);
    
    return parts.join(' ');
  };

  const formatChartTime = (seconds: number): string => {
    if (seconds === 0) return "";
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return remainingSeconds > 0 ? `${minutes}분${remainingSeconds}초` : `${minutes}분`;
    } else {
      return `${remainingSeconds}초`;
    }
  };

  const maxTime = Math.max(...weekStats, 1);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = days[date.getDay()];
    return `${month}/${day} (${dayOfWeek})`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="relative flex items-center justify-center px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="absolute left-4 text-gray-700 hover:text-gray-900 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-900">학습 기록</h1>
        </div>
      </div>

      <div className="px-4 py-6 max-w-md mx-auto space-y-4">
        {/* 주간 통계 카드 */}
        <div className="bg-white rounded-2xl shadow-sm p-6 animate-fade-in-slide">
          <div className="text-center mb-6">
            <div className="text-sm text-gray-600 mb-2">최근 7일 총 학습 시간</div>
            <div className="text-3xl font-bold text-sakura-dark">
              {formatTime(totalTime)}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-sakura-lighter to-white rounded-xl p-4">
            <h3 className="text-sm font-bold text-gray-700 mb-4 text-center">주간 학습 통계</h3>
            <div className="flex justify-around items-end h-40">
              {weekStats.map((timeInSeconds, index) => {
                const height = maxTime > 0 ? (timeInSeconds / maxTime) * 100 : 0;
                const barHeight = Math.max(height, timeInSeconds > 0 ? 8 : 2);
                
                return (
                  <div 
                    key={index} 
                    className="flex flex-col items-center h-full justify-end animate-bar-grow"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {timeInSeconds > 0 && (
                      <div className="text-xs text-sakura-dark font-semibold mb-2">
                        {formatChartTime(timeInSeconds)}
                      </div>
                    )}
                    <div 
                      className={`w-8 rounded-t-lg transition-all duration-500 shadow-sm ${
                        timeInSeconds > 0 ? 'bg-gradient-to-t from-sakura to-sakura-dark' : 'bg-gray-200'
                      }`}
                      style={{ height: `${barHeight}%` }}
                    />
                    <span className="text-xs font-bold mt-3 text-gray-700">{days[index]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 학습 활동 목록 */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">학습 활동</h3>
            <span className="text-sakura text-xl">✿</span>
          </div>

          {records.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-sakura text-5xl mb-4 opacity-30">✿</div>
              <div className="text-gray-500">
                아직 학습 기록이 없습니다.
                <br />
                첫 학습을 시작해보세요!
              </div>
            </div>
          ) : (
            <ul className="space-y-3">
              {records.slice(0, 20).map((record, index) => {
                const formattedDate = formatDate(record.studyDate);
                
                return (
                  <li
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors animate-slide-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold text-gray-900 truncate">
                          {formattedDate}
                        </span>
                        <span className="text-xs text-gray-600">
                          {record.levelName} • {record.partOfSpeech}
                        </span>
                      </div>
                    </div>
                    <div className="text-right ml-3">
                      <div className="text-sm font-bold text-gray-900">
                        {record.wordCount}문제
                      </div>
                      <div className="text-xs text-sakura-dark font-semibold">
                        {record.studyDuration || formatTime(record.studyTime)}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {records.length > 20 && (
            <div className="text-center mt-4 pt-4 border-t border-gray-200">
              <span className="text-sm text-gray-500">
                총 {records.length}개의 학습 기록
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}