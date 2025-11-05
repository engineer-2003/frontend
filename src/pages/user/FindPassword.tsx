// src/pages/user/FindPassword.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function FindPassword() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const findPassword = async () => {
    if (!username.trim() || !email.trim()) {
      alert("아이디와 이메일을 모두 입력해주세요.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/users/find-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email }),
      });
      
      if (response.ok) {
        alert("비밀번호 재설정 링크가 이메일로 전송되었습니다. 이메일을 확인해주세요.");
        navigate("/user/login");
      } else {
        const errorText = await response.text();
        alert("비밀번호 찾기 실패: " + errorText);
      }
    } catch (error) {
      console.error("서버 통신 오류:", error);
      alert("서버 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-sakura-lighter to-sakura-light overflow-hidden">
      {/* 배경 장식 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="animate-float-slow absolute top-20 right-20 text-sakura text-4xl opacity-20">✿</div>
        <div className="animate-float-medium absolute bottom-32 left-20 text-sakura text-5xl opacity-15">✿</div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="relative z-10 w-full max-w-md px-6 animate-fade-in-up">
        {/* 헤더 */}
        <div className="text-center mb-10">
          <div className="text-sakura text-6xl mb-4 animate-bounce-gentle">✿</div>
          <h2 className="text-3xl font-bold text-branch mb-2">비밀번호 찾기</h2>
          <p className="text-sm text-gray-600">가입 시 등록한 정보를 입력해주세요</p>
        </div>

        {/* 비밀번호 찾기 카드 */}
        <div className="bg-white rounded-3xl shadow-xl p-8 backdrop-blur-sm bg-opacity-95">
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

          {/* 이메일 입력 */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              이메일
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="가입 시 입력한 이메일"
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-sakura-dark focus:bg-white transition-all"
            />
          </div>

          {/* 안내 메시지 */}
          <div className="mb-6 p-4 bg-sakura-lighter rounded-xl border border-sakura-light">
            <div className="flex items-start space-x-2">
              <svg className="w-5 h-5 text-sakura-dark flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-gray-700 leading-relaxed">
                입력하신 이메일로 비밀번호 재설정 링크를 전송해드립니다. 
                이메일을 확인하시고 링크를 통해 새 비밀번호를 설정해주세요.
              </p>
            </div>
          </div>

          {/* 비밀번호 찾기 버튼 */}
          <button
            className="w-full py-4 bg-gradient-to-r from-sakura to-sakura-dark text-white font-bold text-lg rounded-xl hover:shadow-xl transform hover:-translate-y-1 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            onClick={findPassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                처리 중...
              </span>
            ) : (
              '비밀번호 찾기'
            )}
          </button>

          {/* 로그인 페이지로 돌아가기 */}
          <button
            className="w-full py-3 mt-4 text-sakura-dark text-sm font-semibold hover:text-sakura-darker transition-colors"
            onClick={() => navigate('/user/login')}
          >
            로그인 페이지로 돌아가기
          </button>
        </div>

        {/* 추가 도움말 */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-600">
            이메일이 도착하지 않나요?{' '}
            <span className="text-sakura-dark font-semibold">스팸 메일함</span>을 확인해주세요
          </p>
        </div>
      </div>
    </div>
  );
}