// src/pages/ResetPassword.tsx

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token, setToken] = useState("");

  useEffect(() => {
    // URL에서 토큰 값을 읽어와 상태에 저장
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      alert("유효하지 않은 접근입니다.");
      navigate("/login");
    }
  }, [searchParams, navigate]);

  const handleResetPassword = async () => {
    if (password.length < 6) {
      alert("비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }
    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/users/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      
      if (response.ok) {
        alert("비밀번호가 성공적으로 재설정되었습니다.");
        navigate("/login");
      } else {
        const errorText = await response.text();
        alert("비밀번호 재설정 실패: " + errorText);
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
        <h2 className="text-2xl font-bold text-branch">비밀번호 재설정</h2>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow p-8">
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            새 비밀번호
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border-b border-branch focus:outline-none py-2 text-branch"
          />
        </div>

        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            비밀번호 확인
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border-b border-branch focus:outline-none py-2 text-branch"
          />
        </div>

        <button
          className="w-full py-2 bg-sakura-dark text-white rounded-md hover:bg-sakura-darker transition"
          onClick={handleResetPassword}
        >
          비밀번호 재설정
        </button>
      </div>
    </div>
  );
}