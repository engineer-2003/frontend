import { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";

interface StudyRecord {
  studyDate: string;
  levelName: string;
  partOfSpeech: string;
  wordCount: number;
  studyTime: number; // 분 단위
}

export default function History() {
  const [records, setRecords] = useState<StudyRecord[]>([]);
  const [totalTime, setTotalTime] = useState(0);
  const [weekStats, setWeekStats] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) return;

    const { userId, token } = JSON.parse(userData);

    fetch(`http://localhost:8080/api/study-records/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`, // ✅ JWT 전송
      },
    })
      .then((res) => res.json())
      .then((data: StudyRecord[]) => {
        setRecords(data);

        // 총 학습 시간
        const total = data.reduce((sum, r) => sum + r.studyTime, 0);
        setTotalTime(total);

        // 요일별 학습 시간 집계
        const stats = [0, 0, 0, 0, 0, 0, 0];
        data.forEach((r) => {
          const day = new Date(r.studyDate).getDay();
          stats[day] += r.studyTime;
        });
        setWeekStats(stats);
      });
  }, []);

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}시간 ${m}분` : `${m}분`;
  };

  const days = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50">
      <div className="w-80 bg-white rounded-2xl shadow p-6 mt-10 mb-8">
        <h3 className="text-center text-gray-600 text-sm mb-2">총 학습 시간</h3>
        <p className="text-center text-2xl font-bold text-gray-900 mb-4">
          {formatTime(totalTime)}
        </p>

        <div className="flex items-end justify-between h-24">
          {weekStats.map((value, i) => (
            <div key={i} className="flex flex-col items-center">
              <div
                className="w-4 rounded bg-green-400"
                style={{ height: `${value * 2}px` }}
              ></div>
              <span className="text-xs mt-1">{days[i]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full bg-white rounded-t-3xl shadow p-6">
        <div className="flex flex-col items-center mb-6">
          <div className="text-green-500 text-2xl mb-2">✿</div>
          <h3 className="text-lg font-semibold text-gray-800">학습 활동</h3>
        </div>

        <ul className="space-y-4 text-sm">
          {records.map((r, i) => (
            <li key={i} className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-700">{r.studyDate}</span>
                <span className="text-gray-500">
                  {r.levelName}({r.partOfSpeech})
                </span>
              </div>
              <span className="text-gray-600">
                단어 {r.wordCount}개 ({formatTime(r.studyTime)})
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
