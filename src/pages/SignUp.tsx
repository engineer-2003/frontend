import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState(""); // 이메일 상태 추가

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다!");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/users/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // 요청 본문에 이메일 정보 추가
        body: JSON.stringify({ username, password, email }),
      });

      if (response.ok) {
        alert("회원가입 성공!");
        navigate("/login");
      } else {
        const error = await response.text();
        alert("회원가입 실패: " + error);
      }
    } catch (err) {
      alert("서버 연결 실패: " + err);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-white">
      <div className="w-full bg-sakura py-10 flex flex-col items-center text-white rounded-b-2xl">
        <div className="text-3xl mb-3">✿</div>
        <h2 className="text-xl font-bold text-branch">회원 가입 페이지</h2>
      </div>

      <div className="w-80 mt-10 space-y-6">
        <div>
          <label className="block text-sm mb-2">아이디</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border-b border-branch focus:outline-none py-2 text-branch"
          />
        </div>

        <div>
          <label className="block text-sm mb-2">이메일</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border-b border-branch focus:outline-none py-2 text-branch"
          />
        </div>

        <div>
          <label className="block text-sm mb-2">비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border-b border-branch focus:outline-none py-2 text-branch"
          />
        </div>

        <div>
          <label className="block text-sm mb-2">비밀번호 확인</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border-b border-branch focus:outline-none py-2 text-branch"
          />
        </div>

        <button
          onClick={handleSignup}
          className="w-full py-3 bg-sakura-dark text-white rounded-md hover:bg-sakura-darker transition"
        >
          회원 가입
        </button>
      </div>
    </div>
  );
}