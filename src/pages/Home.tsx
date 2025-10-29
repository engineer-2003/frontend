import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-sakura-lighter to-sakura-light">
      {/* 제목 */}
      <h1 className="text-2xl font-bold text-branch mb-6">하루의 일본어</h1>

      {/* 로고 */}
      <div className="text-sakura text-7xl mb-10">✿</div>

      {/* 버튼 그룹 */}
      <div className="flex flex-col space-y-4 w-48">
        {/* 로그인 버튼 */}
        <button
          onClick={() => navigate("/user/login")}
          className="w-full py-2 rounded-lg bg-sakura-dark text-white font-medium hover:bg-sakura-darker transition"
        >
          로그인
        </button>

        {/* 회원가입 버튼 */}
        <button
          onClick={() => navigate("/user/signup")}
          className="w-full py-2 rounded-lg border border-sakura-dark text-sakura-dark font-medium hover:bg-sakura-darker hover:text-white transition"
        >
          회원 가입
        </button>
      </div>
    </div>
  );
}