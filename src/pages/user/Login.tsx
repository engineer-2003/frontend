// src/pages/user/Login.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/users/login", {
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

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfo = await axios.get(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
        );

        const { email } = userInfo.data;

        const response = await fetch("http://localhost:8080/api/users/login/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        if (response.ok) {
          const token = await response.text();
          localStorage.setItem("token", token);
          alert("구글 계정으로 로그인 성공!");
          navigate("/select/main");
        } else {
          alert("구글 로그인에 실패했습니다.");
        }
      } catch (error) {
        console.error("Google 로그인 오류:", error);
        alert("서버 오류가 발생했습니다.");
      }
    },
    onError: (error) => {
      console.error("Google 로그인 실패:", error);
      alert("구글 로그인에 실패했습니다.");
    },
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-sakura-lighter to-sakura-light overflow-hidden py-12">
      {/* 배경 장식 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="animate-float-slow absolute top-20 left-10 text-sakura text-4xl opacity-20">✿</div>
        <div className="animate-float-medium absolute bottom-32 right-20 text-sakura text-5xl opacity-15">✿</div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="relative z-10 w-full max-w-md px-6 animate-fade-in-up">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <div className="text-sakura text-6xl mb-6 animate-bounce-gentle">✿</div>
          <h2 className="text-3xl font-bold text-branch mb-3">로그인</h2>
          <p className="text-sm text-gray-600">하루의 일본어에 오신 것을 환영합니다</p>
        </div>

        {/* 로그인 카드 */}
        <div className="bg-white rounded-3xl shadow-xl p-8 backdrop-blur-sm bg-opacity-95 mb-8">
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
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-sakura-dark focus:bg-white transition-all"
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
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-sakura-dark focus:bg-white transition-all"
            />
          </div>

          {/* 로그인 버튼 */}
          <button
            className="w-full py-4 bg-gradient-to-r from-sakura to-sakura-dark text-white font-bold text-lg rounded-xl hover:shadow-xl transform hover:-translate-y-1 active:translate-y-0 transition-all duration-200"
            onClick={handleLogin}
          >
            로그인
          </button>
          
          {/* 구분선 */}
          <div className="my-6 flex items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 text-sm text-gray-500 font-medium">또는</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          {/* Google 로그인 버튼 */}
          <button
            className="w-full py-4 flex items-center justify-center bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 hover:shadow-md transition-all"
            onClick={() => handleGoogleLogin()}
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google 계정으로 로그인
          </button>

          {/* 비밀번호 찾기 */}
          <button
            className="w-full py-3 mt-4 text-sakura-dark text-sm font-semibold hover:text-sakura-darker transition-colors"
            onClick={() => navigate('/user/findPassword')}
          >
            비밀번호를 잊으셨나요?
          </button>

          {/* 회원가입 링크 */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <span className="text-sm text-gray-600">아직 계정이 없으신가요? </span>
            <button
              className="text-sm text-sakura-dark font-bold hover:text-sakura-darker transition-colors"
              onClick={() => navigate('/user/signup')}
            >
              회원가입
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}