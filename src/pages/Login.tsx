import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
        // JWT 토큰을 직접 문자열로 받음
        const token = await response.text();
        
        // 로컬 스토리지에 토큰만 저장
        localStorage.setItem("token", token);
        
        alert("로그인 성공!");
        navigate("/mainSelect");
      } else {
        alert("아이디 또는 비밀번호가 잘못되었습니다.");
      }
    } catch (error) {
      console.error(error);
      alert("서버 오류가 발생했습니다.");
    }
  };

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
        
        {/* 비밀번호 찾기 버튼 */}
        <button
          className="w-full py-2 mt-4 text-branch text-sm hover:underline"
          onClick={() => navigate('/findPassword')}
        >
          비밀번호 찾기
        </button>
      </div>
    </div>
  );
}