// src/pages/History.tsx
import React, { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface StudyRecord {
  studyDate: string;
  levelName: string;
  partOfSpeech: string;
  wordCount: number;
  studyTime: number; // 분 단위
}

export default function History() {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [records, setRecords] = useState<StudyRecord[]>([]);
  const [totalTime, setTotalTime] = useState(0);
  const [weekStats, setWeekStats] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/login");
    } else {
      setIsAuthorized(true);

      fetch(`http://localhost:8080/api/study-records`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error('API 요청 실패');
          }
          return res.json();
        })
        .then((data: StudyRecord[]) => {
          //  학습 기록을 날짜 기준으로 최신순 정렬
          const sortedData = data.sort((a, b) => new Date(b.studyDate).getTime() - new Date(a.studyDate).getTime());
          
          // 학습 활동 리스트에는 정렬된 모든 데이터를 저장
          setRecords(sortedData);

          // 주간 통계에는 최근 7일치 데이터만 필터링해서 사용
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const sevenDaysAgo = new Date(today);
          sevenDaysAgo.setDate(today.getDate() - 6);

          const recentRecordsForStats = sortedData.filter(r => {
            const recordDate = new Date(r.studyDate + 'T00:00:00');
            return recordDate >= sevenDaysAgo && recordDate <= today;
          });

          const total = recentRecordsForStats.reduce((sum, r) => sum + r.studyTime, 0);
          setTotalTime(total);

          const stats = [0, 0, 0, 0, 0, 0, 0];
          recentRecordsForStats.forEach(r => {
            const localDate = new Date(r.studyDate + 'T00:00:00');
            const dayOfWeek = localDate.getDay();
            stats[dayOfWeek] += r.studyTime;
          });
          setWeekStats(stats);
        })
        .catch(error => {
          console.error(error);
          alert("학습 기록을 불러오는 데 실패했습니다.");
        });
    }
  }, [navigate]);
  
  const days = ["일", "월", "화", "수", "목", "금", "토"];

  if (!isAuthorized) {
    return null;
  }

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}시간 ${m}분` : `${m}분`;
  };

  const maxTime = Math.max(...weekStats, 1);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-6 mb-4">
        <h2 className="text-xl font-bold text-center mb-4">학습 기록</h2>
        <div className="text-center text-lg mb-2">총 학습 시간: <span className="text-sakura-dark font-semibold">{formatTime(totalTime)}</span></div>
        
        <h3 className="text-lg font-semibold mt-4 mb-2">주간 학습 통계</h3>
        <div className="flex justify-around items-end h-32">
          {weekStats.map((time, i) => {
            const height = (time / maxTime) * 100;
            const barHeight = Math.max(height, 1); 
            return (
              <div key={i} className="flex flex-col items-center h-full justify-end">
                <div 
                  className="bg-sakura-light w-4 rounded-t-lg transition-all duration-300" 
                  style={{ height: `${barHeight}%` }}
                ></div>
                <span className="text-xs mt-1">{days[i]}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="w-full max-w-md bg-white rounded-t-3xl shadow p-6">
        <div className="flex flex-col items-center mb-6">
          <div className="text-green-500 text-2xl mb-2">✿</div>
          <h3 className="text-lg font-semibold text-gray-800">학습 활동</h3>
        </div>

        <ul className="space-y-4 text-sm">
          {records.slice(0, 5).map((r, i) => {
            const localDate = new Date(r.studyDate + 'T00:00:00');
            const dayName = days[localDate.getDay()];
            return (
              <li
                key={i}
                className="flex items-center justify-between border-b pb-2"
              >
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">
                    {r.studyDate} ({dayName})
                  </span>
                  <span className="text-gray-500">
                    {r.levelName}({r.partOfSpeech})
                  </span>
                </div>
                <span className="text-gray-600">
                  단어 {r.wordCount}개 ({formatTime(r.studyTime)})
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}