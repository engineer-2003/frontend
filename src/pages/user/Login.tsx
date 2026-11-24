// src/pages/user/Login.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const BASE_API_URL =
    import.meta.env.VITE_BACKEND_API_URL || "http://localhost:8080";

  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const response = await fetch(`${BASE_API_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const token = await response.text();

        localStorage.setItem("token", token);

        alert("로그인 성공!");
        navigate("/select/main");
      } else {
        alert("아이디 또는 비밀번호가 잘못되었습니다.");
      }
    } catch (error) {
      console.error(error);
      alert("서버 오류가 발생했습니다.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#FFF7F8] overflow-hidden py-12">
      {/* 배경 장식 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="animate-float-slow absolute top-20 left-10 text-sakura text-4xl opacity-20">
          ✿
        </div>

        <div className="animate-float-medium absolute bottom-32 right-20 text-sakura text-5xl opacity-15">
          ✿
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="relative z-10 w-full max-w-md px-6 animate-fade-in-up">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <div className="text-sakura text-6xl mb-6 animate-bounce-gentle">
            ✿
          </div>

          <h2 className="text-3xl font-bold text-branch mb-3">
            로그인
          </h2>

          <p className="text-sm text-gray-600">
            하루의 일본어에 오신 것을 환영합니다
          </p>
        </div>

        {/* 로그인 카드 */}
        <div className="bg-white rounded-3xl p-8 mb-8">
          {/* 아이디 입력 */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              아이디
            </label>

            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="아이디를 입력하세요"
              className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-sakura/40 focus:bg-white transition-all"
            />
          </div>

          {/* 비밀번호 입력 */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              비밀번호
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-sakura/40 focus:bg-white transition-all"
            />
          </div>

          {/* 로그인 버튼 */}
          <button
            className="w-full py-4 bg-sakura text-white font-bold text-lg rounded-xl hover:opacity-90 active:opacity-80 transition-all duration-200"
            onClick={handleLogin}
          >
            로그인
          </button>

          {/* 비밀번호 찾기 */}
          <button
            className="w-full py-3 mt-4 text-sakura-dark text-sm font-semibold hover:text-sakura-darker transition-colors"
            onClick={() => navigate("/user/findPassword")}
          >
            비밀번호를 잊으셨나요?
          </button>

          {/* 회원가입 링크 */}
          <div className="mt-6 pt-6 text-center">
            <span className="text-sm text-gray-600">
              아직 계정이 없으신가요?{" "}
            </span>

            <button
              className="text-sm text-sakura-dark font-bold hover:text-sakura-darker transition-colors"
              onClick={() => navigate("/user/signup")}
            >
              회원가입
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
