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

  // Google 로그인 핸들러
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // 1. Google로부터 사용자 정보 가져오기
        const userInfo = await axios.get(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
        );

        const { email } = userInfo.data;

        // 2. 백엔드 서버에 이메일 전송하여 로그인/회원가입 처리
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
    <div className="flex flex-col items-center justify-center h-screen bg-sakura-lighter">
      <div className="mb-10 flex flex-col items-center">
        <div className="text-sakura text-5xl mb-3">✿</div>
        <h2 className="text-2xl font-bold text-branch">로그인</h2>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow p-8">
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            아이디
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="아이디"
            className="w-full border-b border-branch focus:outline-none py-2 text-branch"
          />
        </div>

        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            비밀번호
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            className="w-full border-b border-branch focus:outline-none py-2 text-branch"
          />
        </div>

        <button
          className="w-full py-2 bg-sakura-dark text-white rounded-md hover:bg-sakura-darker transition"
          onClick={handleLogin}
        >
          로그인
        </button>
        
        {/* 구분선 */}
        <div className="my-6 flex items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-4 text-sm text-gray-500">또는</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* Google 로그인 버튼 */}
        <button
          className="w-full py-2 flex items-center justify-center bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
          onClick={() => handleGoogleLogin()}
        >
          {/* 구글 로고 SVG 아이콘 */}
          <svg className="w-4 h-4 mr-2" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-76.4 76.4c-24.1-23.4-57.2-37.9-96.5-37.9-78.2 0-141.8 63.6-141.8 141.8s63.6 141.8 141.8 141.8c86.4 0 122.9-66.2 127.8-102.1H248V261.8h239.2z"></path></svg>
          Google 계정으로 로그인
        </button>

        {/* 비밀번호 찾기 버튼 */}
        <button
          className="w-full py-2 mt-4 text-branch text-sm hover:underline"
          onClick={() => navigate('/user/findPassword')}
        >
          비밀번호 찾기
        </button>
      </div>
    </div>
  );
}