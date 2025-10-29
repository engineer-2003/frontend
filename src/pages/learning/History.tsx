// src/pages/learning/History.tsx
import React, { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface StudyRecord {
  studyDate: string;
  levelName: string;
  partOfSpeech: string;
  wordCount: number;
  studyTime: number; // 초 단위
  studyDuration: string; // "n시간 n분 n초" 형태
}

export default function History() {
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
      const response = await fetch(`http://localhost:8080/study/records`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: StudyRecord[] = await response.json();
      console.log('학습 기록 데이터:', data);
      
      // 학습 기록을 날짜 기준으로 최신순 정렬
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

    // 최근 7일 데이터만 필터링
    const recentRecords = data.filter(record => {
      const recordDate = new Date(record.studyDate + 'T00:00:00');
      return recordDate >= sevenDaysAgo && recordDate <= today;
    });

    console.log('최근 7일 학습 기록:', recentRecords);

    // 총 학습 시간 계산 (초 단위)
    const totalSeconds = recentRecords.reduce((sum, record) => sum + record.studyTime, 0);
    setTotalTime(totalSeconds);

    // 요일별 학습 시간 계산 (초 단위)
    const stats = [0, 0, 0, 0, 0, 0, 0];
    
    recentRecords.forEach(record => {
      const recordDate = new Date(record.studyDate + 'T00:00:00');
      const dayOfWeek = recordDate.getDay();
      stats[dayOfWeek] += record.studyTime;
    });
    
    console.log('주간 통계 (초 단위):', stats);
    setWeekStats(stats);
  };
  
  const days = ["일", "월", "화", "수", "목", "금", "토"];

  if (!isAuthorized) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">학습 기록을 불러오는 중...</div>
      </div>
    );
  }

  // 초를 시간 형태로 포맷팅
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

  // 차트용 시간 포맷팅 (분 단위로 표시)
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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
      {/* 주간 통계 섹션 */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-6 mb-4">
        <h2 className="text-xl font-bold text-center mb-4">학습 기록</h2>
        
        <div className="text-center text-lg mb-4">
          <div className="text-gray-600 mb-1">최근 7일 총 학습 시간</div>
          <div className="text-2xl font-bold text-sakura-dark">
            {formatTime(totalTime)}
          </div>
        </div>
        
        <h3 className="text-lg font-semibold mt-4 mb-3 text-center">주간 학습 통계</h3>
        <div className="flex justify-around items-end h-32 bg-gray-50 rounded-lg p-2">
          {weekStats.map((timeInSeconds, index) => {
            const height = maxTime > 0 ? (timeInSeconds / maxTime) * 100 : 0;
            const barHeight = Math.max(height, timeInSeconds > 0 ? 5 : 1);
            
            return (
              <div key={index} className="flex flex-col items-center h-full justify-end">
                <div className="text-xs text-gray-600 mb-1">
                  {timeInSeconds > 0 ? formatChartTime(timeInSeconds) : ''}
                </div>
                <div 
                  className={`w-6 rounded-t-lg transition-all duration-300 ${
                    timeInSeconds > 0 ? 'bg-sakura' : 'bg-gray-200'
                  }`}
                  style={{ height: `${barHeight}%` }}
                />
                <span className="text-xs mt-2 font-medium">{days[index]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 학습 활동 목록 섹션 */}
      <div className="w-full max-w-md bg-white rounded-t-3xl shadow p-6">
        <div className="flex flex-col items-center mb-6">
          <div className="text-sakura text-2xl mb-2">✿</div>
          <h3 className="text-lg font-semibold text-gray-800">학습 활동</h3>
        </div>

        {records.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            아직 학습 기록이 없습니다.
            <br />
            첫 학습을 시작해보세요!
          </div>
        ) : (
          <ul className="space-y-4 text-sm">
            {records.slice(0, 20).map((record, index) => {
              const formattedDate = formatDate(record.studyDate);
              
              return (
                <li
                  key={index}
                  className="flex items-center justify-between border-b pb-3 last:border-b-0"
                >
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-gray-800 font-medium text-sm">
                        {formattedDate}
                      </span>
                      <span className="text-gray-600 text-xs">
                        {record.levelName} • {record.partOfSpeech}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-800 font-medium text-sm">
                      {record.wordCount}문제
                    </div>
                    <div className="text-sakura-dark text-xs font-medium">
                      {record.studyDuration || formatTime(record.studyTime)}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {records.length > 20 && (
          <div className="text-center mt-4">
            <span className="text-gray-500 text-sm">
              총 {records.length}개의 학습 기록
            </span>
          </div>
        )}
      </div>
    </div>
  );

}