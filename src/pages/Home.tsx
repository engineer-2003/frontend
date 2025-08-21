import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-100 to-green-50">
      {/* 제목 */}
      <h1 className="text-2xl font-bold text-green-600 mb-6">하루의 일본어</h1>

      {/* 로고 */}
      <div className="text-green-500 text-7xl mb-10">✿</div>

      {/* 버튼 그룹 */}
      <div className="flex flex-col space-y-4 w-48">
        {/* 로그인 버튼 */}
        <button
          onClick={() => navigate("/login")}
          className="w-full py-2 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 transition"
        >
          로그인
        </button>

        {/* 회원가입 버튼 */}
        <button
          onClick={() => navigate("/signup")}
          className="w-full py-2 rounded-lg border border-green-500 text-green-600 font-medium hover:bg-green-50 transition"
        >
          회원 가입
        </button>
      </div>
    </div>
  );
}
