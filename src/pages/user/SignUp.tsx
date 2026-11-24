// src/pages/user/SignUp.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const BASE_API_URL =
    import.meta.env.VITE_BACKEND_API_URL || "http://localhost:8080";

  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다!");
      return;
    }

    try {
      const response = await fetch(
        `${BASE_API_URL}/api/users/signup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password, email }),
        }
      );

      if (response.ok) {
        alert("회원가입 성공!");
        navigate("/user/login");
      } else {
        const error = await response.text();
        alert("회원가입 실패: " + error);
      }
    } catch (err) {
      alert("서버 연결 실패: " + err);
    }
  };

  const inputClassName =
    "w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:bg-gray-100 transition-colors";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white">
        <div className="relative flex items-center justify-center px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="absolute left-4 text-gray-700 hover:text-gray-900 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <h1 className="text-xl font-bold text-gray-900">
            회원가입
          </h1>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="px-4 py-8 max-w-md mx-auto">
        {/* 상단 장식 */}
        <div className="text-center mb-8 animate-fade-in-05s">
          <div className="text-sakura text-6xl mb-3 animate-bounce-gentle">
            ✿
          </div>

          <h2 className="text-2xl font-bold text-branch mb-2">
            하루의 일본어
          </h2>

          <p className="text-sm text-gray-600">
            새로운 계정을 만들어보세요
          </p>
        </div>

        {/* 회원가입 카드 */}
        <div className="bg-white rounded-3xl p-6 space-y-5 animate-slide-up">
          {/* 아이디 입력 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              아이디
            </label>

            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="사용할 아이디를 입력하세요"
              className={inputClassName}
            />
          </div>

          {/* 이메일 입력 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              이메일
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className={inputClassName}
            />
          </div>

          {/* 비밀번호 입력 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              비밀번호
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6자 이상 입력하세요"
              className={inputClassName}
            />
          </div>

          {/* 비밀번호 확인 입력 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              비밀번호 확인
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="비밀번호를 다시 입력하세요"
              className={inputClassName}
            />

            {password &&
              confirmPassword &&
              password !== confirmPassword && (
                <p className="text-xs text-red-500 mt-2">
                  비밀번호가 일치하지 않습니다
                </p>
              )}

            {password &&
              confirmPassword &&
              password === confirmPassword && (
                <p className="text-xs text-green-500 mt-2">
                  비밀번호가 일치합니다
                </p>
              )}
          </div>

          {/* 회원가입 버튼 */}
          <button
            onClick={handleSignup}
            className="w-full py-4 bg-sakura-dark text-white font-bold text-lg rounded-xl hover:bg-sakura-darker active:opacity-90 transition-colors mt-6"
          >
            회원가입
          </button>

          {/* 로그인 링크 */}
          <div className="pt-4 text-center">
            <span className="text-sm text-gray-600">
              이미 계정이 있으신가요?{" "}
            </span>

            <button
              className="text-sm text-sakura-dark font-bold hover:text-sakura-darker transition-colors"
              onClick={() => navigate("/user/login")}
            >
              로그인
            </button>
          </div>
        </div>

        {/* 하단 안내 */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            회원가입 시{" "}
            <span className="text-sakura-dark font-semibold">
              이용약관
            </span>{" "}
            및{" "}
            <span className="text-sakura-dark font-semibold">
              개인정보 처리방침
            </span>
            에 동의하게 됩니다
          </p>
        </div>
      </div>
    </div>
  );
}
