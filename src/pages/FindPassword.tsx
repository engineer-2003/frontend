// src/pages/FindPassword.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function FindPassword() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const findPassword = async () => {
    try {
      // 백엔드 API로 아이디와 이메일을 전송합니다.
      const response = await fetch("http://localhost:8080/api/users/find-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email }),
      });
      
      if (response.ok) {
        alert("비밀번호 재설정 링크가 이메일로 전송되었습니다. 이메일을 확인해주세요.");
        navigate("/login");
      } else {
        const errorText = await response.text();
        alert("비밀번호 찾기 실패: " + errorText);
      }
    } catch (error) {
      console.error("서버 통신 오류:", error);
      alert("서버 오류가 발생했습니다.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-sakura-lighter">
      <div className="mb-10 flex flex-col items-center">
        <div className="text-sakura text-5xl mb-3">✿</div>
        <h2 className="text-2xl font-bold text-branch">비밀번호 찾기</h2>
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
            이메일
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="가입 시 입력한 이메일"
            className="w-full border-b border-branch focus:outline-none py-2 text-branch"
          />
        </div>

        <button
          className="w-full py-2 bg-sakura-dark text-white rounded-md hover:bg-sakura-darker transition"
          onClick={findPassword}
        >
          비밀번호 찾기
        </button>

        {/* 로그인 페이지로 돌아가기 버튼 */}
        <button
          className="w-full py-2 mt-4 text-branch text-sm hover:underline"
          onClick={() => navigate('/login')}
        >
          로그인 페이지로 돌아가기
        </button>
      </div>
    </div>
  );
}