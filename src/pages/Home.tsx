import { useNavigate } from "react-router-dom";
import "../App.css";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="app-container">
      {/* 제목 */}
      <h1 className="title">하루의 일본어</h1>

      {/* 로고 (기존 경로 유지) */}
      <img src="/assets/clover.png" alt="logo" className="logo" />

      {/* 버튼 영역 */}
      <div className="button-group">
        <button className="login-btn" onClick={() => navigate("/login")}>
          로그인
        </button>
        <button className="signup-btn" onClick={() => navigate("/signup")}>
          회원 가입
        </button>
      </div>
    </div>
  );
}
