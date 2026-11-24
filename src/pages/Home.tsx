// src/pages/Home.tsx
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#fff9fb]">
      {/* 메인 컨테이너 */}
      <div className="relative z-10 flex flex-col items-center">
        {/* 제목 */}
        <h1 className="mb-2 text-3xl font-bold text-branch">
          하루의 일본어
        </h1>

        {/* 로고 */}
        <div className="mb-12 mt-6 text-8xl text-sakura">
          ✿
        </div>

        {/* 버튼 그룹 */}
        <div className="flex w-64 flex-col space-y-4">
          {/* 로그인 버튼 */}
          <button
            onClick={() => navigate("/user/login")}
            className="w-full rounded-2xl bg-sakura-dark py-4 text-lg font-semibold text-white transition-colors duration-200 hover:bg-sakura-darker active:opacity-90"
          >
            로그인
          </button>

          {/* 회원가입 버튼 */}
          <button
            onClick={() => navigate("/user/signup")}
            className="w-full rounded-2xl border-2 border-sakura-dark bg-white py-4 text-lg font-semibold text-sakura-dark transition-colors duration-200 hover:bg-sakura/10 active:opacity-90"
          >
            회원 가입
          </button>

          {/* 튜토리얼 버튼 */}
          <button
            onClick={() => navigate("/tutorial")}
            className="w-full rounded-2xl border border-[#EBCBD3] bg-white py-3.5 text-base font-semibold text-[#A85D70] transition-colors duration-200 hover:bg-[#FFF0F3] active:opacity-90"
          >
            튜토리얼 보기
          </button>
        </div>

        {/* 하단 텍스트 */}
        <p className="mt-8 text-sm text-branch opacity-70">
          매일의 일본어, 하루의 일본어
        </p>
      </div>
    </div>
  );
}
