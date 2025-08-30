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
  items: SelectItem[];
}

const SelectPage: React.FC<SelectPageProps> = ({ headerTitle, headerExtra, items }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      {/* Header */}
      <div className="w-full bg-green-500 rounded-b-3xl py-8 text-center text-white relative">
        <h1 className="text-2xl font-bold">{headerTitle}</h1>
        {headerExtra && <div className="absolute right-6 top-1/2 -translate-y-1/2">{headerExtra}</div>}
      </div>

      {/* Content */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md mt-6 p-6">
        {items.map((item) => (
          <div key={item.id} className="mb-6">
            <h2 className="text-lg font-semibold">{item.title}</h2>
            {item.description && (
              <p className="text-gray-600 text-sm mb-2">{item.description}</p>
            )}
            <button
              onClick={item.onClick}
              className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition"
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
