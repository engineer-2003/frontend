// src/components/SelectPage.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

type SelectItem = {
  id: string;
  title: string;
  description?: string;
  onClick: () => void;
  buttonClassName?: string;
};

interface SelectPageProps {
  headerTitle: string;
  headerExtra?: React.ReactNode; // (예: 로그아웃 버튼, 아이콘 등)
  headerLayout?: 'row' | 'col';
  items: SelectItem[];
  showBackButton?: boolean; // 뒤로가기 버튼 표시 여부
}

const SelectPage: React.FC<SelectPageProps> = ({
  headerTitle,
  headerExtra,
  headerLayout = 'col',
  items,
  showBackButton = true,
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      {/* Header */}
      <div className="w-full bg-sakura-light rounded-b-3xl py-6 flex flex-col items-center relative">
        {/* 뒤로가기 버튼 */}
        {showBackButton && (
          <button
            onClick={() => navigate(-1)}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 text-sm"
          >
            〈 돌아가기
          </button>
        )}

        {/* 제목 중앙 */}
        <h1 className="text-2xl font-bold">{headerTitle}</h1>

        {/* headerExtra */}
        {headerExtra && (
          <div
            className={`${
              typeof headerExtra === 'string'
                ? 'mt-2' // 제목 아래로 자연스럽게
                : 'absolute right-4 top-1/2 transform -translate-y-1/2' // 버튼은 오른쪽 끝
            }`}
          >
            {headerExtra}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md mt-6 p-6">
        {items.map((item, index) => (
          <div key={item.id} className={`${index < items.length - 1 ? 'mb-6' : ''}`}>
            <h2 className="text-lg font-semibold">{item.title}</h2>
            {item.description && (
              <p className="whitespace-pre-line text-gray-600 text-sm mb-2">{item.description}</p>
            )}
            <button
              onClick={item.onClick}
              className={`px-4 py-2 rounded-lg text-sm transition ${
                item.buttonClassName || "bg-sakura-dark text-white hover:bg-sakura-darker"
              }`}
            >
              선택하기
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelectPage;