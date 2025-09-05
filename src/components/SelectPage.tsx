import React from "react";

type SelectItem = {
  id: string;
  title: string;
  description?: string;
  onClick: () => void;
};

interface SelectPageProps {
  headerTitle: string;
  headerExtra?: React.ReactNode; // (예: 로그아웃 버튼, 아이콘 등)
  headerLayout?: 'row' | 'col';
  items: SelectItem[];
}

const SelectPage: React.FC<SelectPageProps> = ({
  headerTitle,
  headerExtra,
  headerLayout = 'col',
  items,
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      {/* Header */}
      <div className="w-full bg-sakura-light rounded-b-3xl py-6 flex flex-col items-center relative">
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
        {items.map((item) => (
          <div key={item.id} className="mb-6">
            <h2 className="text-lg font-semibold">{item.title}</h2>
            {item.description && (
              <p className="whitespace-pre-line text-gray-600 text-sm">{item.description}</p>
            )}
            <button
              onClick={item.onClick}
              className="px-4 py-2 mt-2 bg-sakura-dark text-white rounded-lg text-sm hover:bg-sakura-darker transition"
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
