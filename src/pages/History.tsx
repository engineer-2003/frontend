import { CheckCircle } from "lucide-react";

export default function History() {
  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50">
      {/* 총 학습 시간 카드 */}
      <div className="w-80 bg-white rounded-2xl shadow p-6 mt-10 mb-8">
        <h3 className="text-center text-gray-600 text-sm mb-2">총 학습 시간</h3>
        <p className="text-center text-2xl font-bold text-gray-900 mb-4">
          3시간 24분
        </p>

        {/* 간단 그래프 */}
        <div className="flex items-end justify-between h-24">
          {[
            { day: "월", h: 8 },
            { day: "화", h: 10 },
            { day: "수", h: 20 },
            { day: "목", h: 12 },
            { day: "금", h: 6 },
            { day: "토", h: 3 },
            { day: "일", h: 2 },
          ].map((d, i) => (
            <div key={i} className="flex flex-col items-center">
              <div
                className={`w-4 rounded ${
                  i < 5 ? "bg-green-400" : "bg-green-200"
                }`}
                style={{ height: `${d.h * 2}px` }}
              ></div>
              <span className="text-xs mt-1">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 학습 활동 */}
      <div className="w-full bg-white rounded-t-3xl shadow p-6">
        <div className="flex flex-col items-center mb-6">
          <div className="text-green-500 text-2xl mb-2">✿</div>
          <h3 className="text-lg font-semibold text-gray-800">학습 활동</h3>
        </div>

        <ul className="space-y-4 text-sm">
          <li className="flex items-center justify-between border-b pb-2">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-gray-700">오늘</span>
              <span className="text-gray-500">N5(형용사)</span>
            </div>
            <span className="text-gray-600">단어 18개 (31분)</span>
          </li>

          <li className="flex items-center justify-between border-b pb-2">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-gray-700">어제</span>
              <span className="text-gray-500">문형</span>
            </div>
            <span className="text-gray-600">문장 18개 (1시간 15분)</span>
          </li>

          <li className="flex items-center justify-between border-b pb-2">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-gray-700">4일 전</span>
              <span className="text-gray-500">N3(동사)</span>
            </div>
            <span className="text-gray-600">단어 18개 (20분)</span>
          </li>

          <li className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-gray-700">5일 전</span>
              <span className="text-gray-500">문형</span>
            </div>
            <span className="text-gray-600">문장 18개 (45분)</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
