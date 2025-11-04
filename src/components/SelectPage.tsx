// src/components/SelectPage.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

type SelectItem = {
  id: string;
  title: string;
  description?: string;
  onClick: () => void;
  buttonClassName?: string;
  customContent?: React.ReactNode;
  hideDefaultButton?: boolean;
};

interface SelectPageProps {
  headerTitle: string;
  headerExtra?: React.ReactNode;
  headerLeft?: React.ReactNode;
  headerLayout?: 'row' | 'col';
  items: SelectItem[];
  showBackButton?: boolean;
}

const SelectPage: React.FC<SelectPageProps> = ({
  headerTitle,
  headerExtra,
  headerLeft,
  headerLayout = 'col',
  items,
  showBackButton = true,
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
      {/* Header - 카카오톡 스타일 */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="relative flex items-center justify-center px-4 py-4">
          {/* 좌측 영역 - 뒤로가기 또는 커스텀 버튼 */}
          <div className="absolute left-4">
            {showBackButton ? (
              <button
                onClick={() => navigate(-1)}
                className="text-gray-700 hover:text-gray-900 transition-colors"
                aria-label="뒤로가기"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            ) : headerLeft ? (
              headerLeft
            ) : null}
          </div>

          {/* 제목 */}
          <h1 className="text-xl font-bold text-gray-900">{headerTitle}</h1>

          {/* headerExtra */}
          {headerExtra && (
            <div className="absolute right-4">
              {typeof headerExtra === 'string' ? (
                <span className="text-2xl">{headerExtra}</span>
              ) : (
                headerExtra
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6">
        <div className="max-w-md mx-auto space-y-4">
          {items.map((item, index) => (
            <div 
              key={item.id}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden animate-slide-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold text-gray-900">{item.title}</h2>
                  {!item.customContent && !item.hideDefaultButton && (
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
                
                {item.description && (
                  <p className="text-sm text-gray-600 leading-relaxed mb-4 whitespace-pre-line">
                    {item.description}
                  </p>
                )}
                
                {/* 커스텀 콘텐츠 또는 기본 버튼 */}
                {item.customContent ? (
                  <div className="mt-3">{item.customContent}</div>
                ) : (
                  !item.hideDefaultButton && (
                    <button
                      onClick={item.onClick}
                      className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 transform active:scale-98 ${
                        item.buttonClassName || 
                        "bg-gradient-to-r from-sakura to-sakura-dark text-white hover:shadow-md"
                      }`}
                    >
                      선택하기
                    </button>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CSS 애니메이션 */}
      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-in-up {
          animation: slideInUp 0.4s ease-out both;
        }

        .active\\:scale-98:active {
          transform: scale(0.98);
        }
      `}</style>
    </div>
  );
};

export default SelectPage;