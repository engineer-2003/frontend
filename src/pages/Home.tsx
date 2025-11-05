// src/pages/Home.tsx
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-sakura-lighter to-sakura-light overflow-hidden">
      {/* 배경 장식 - 떠다니는 벚꽃 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="animate-float-slow absolute top-20 left-10 text-sakura text-4xl opacity-30">✿</div>
        <div className="animate-float-medium absolute top-40 right-20 text-sakura text-3xl opacity-20">✿</div>
        <div className="animate-float-fast absolute bottom-32 left-1/4 text-sakura text-5xl opacity-25">✿</div>
        <div className="animate-float-slow absolute bottom-20 right-1/3 text-sakura text-4xl opacity-20">✿</div>
      </div>

      {/* 메인 컨테이너 */}
      <div className="relative z-10 flex flex-col items-center animate-fade-in-up">
        {/* 제목 */}
        <h1 className="text-3xl font-bold text-branch mb-4 animate-slide-down">
          하루의 일본어
        </h1>

        {/* 로고 */}
        <div className="text-sakura text-8xl mb-12 mt-8 animate-bounce-gentle hover:animate-spin-slow transition-transform duration-300 cursor-pointer">
          ✿
        </div>

        {/* 버튼 그룹 */}
          {/* 로그인 버튼 - 그라데이션 */}
          <button
            onClick={() => navigate("/user/login")}
            className="group relative w-full py-4 rounded-2xl bg-gradient-to-r from-sakura to-sakura-dark text-white font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:translate-y-0 transition-all duration-200 overflow-hidden"
          >
            <span className="relative z-10">로그인</span>
            <div className="absolute inset-0 bg-gradient-to-r from-sakura-dark to-sakura-darker opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
          </button>

          {/* 회원가입 버튼 - 그라데이션 테두리 효과 */}
          <button
            onClick={() => navigate("/user/signup")}
            className="group relative w-full py-4 rounded-2xl bg-white border-2 border-sakura-dark text-sakura-dark font-semibold text-lg shadow-md hover:shadow-lg hover:bg-gradient-to-r hover:from-sakura hover:to-sakura-dark hover:text-white hover:border-transparent transform hover:-translate-y-1 active:translate-y-0 transition-all duration-200"
          >
            <span className="relative z-10">회원 가입</span>
          </button>
        </div>

        {/* 하단 텍스트 */}
        <p className="mt-8 text-sm text-branch opacity-60 animate-fade-in-delayed">
          매일 조금씩, 일본어와 함께
        </p>
      </div>
    </div>
  );
}