// src/pages/user/ResetPassword.tsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      alert("유효하지 않은 접근입니다.");
      navigate("/user/login");
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

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/users/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      
      if (response.ok) {
        alert("비밀번호가 성공적으로 재설정되었습니다.");
        navigate("/user/login");
      } else {
        const errorText = await response.text();
        alert("비밀번호 재설정 실패: " + errorText);
      }
    } catch (error) {
      console.error("서버 통신 오류:", error);
      alert("서버 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = () => {
    if (password.length === 0) return { text: '', color: '' };
    if (password.length < 6) return { text: '너무 짧음', color: 'text-red-500' };
    if (password.length < 8) return { text: '보통', color: 'text-yellow-500' };
    return { text: '안전함', color: 'text-green-500' };
  };

  const strength = passwordStrength();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-sakura-lighter to-sakura-light overflow-hidden">
      {/* 배경 장식 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="animate-float-slow absolute top-20 left-10 text-sakura text-4xl opacity-20">✿</div>
        <div className="animate-float-medium absolute bottom-32 right-20 text-sakura text-5xl opacity-15">✿</div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="relative z-10 w-full max-w-md px-6 animate-fade-in-up">
        {/* 헤더 */}
        <div className="text-center mb-10">
          <div className="text-sakura text-6xl mb-4 animate-bounce-gentle">✿</div>
          <h2 className="text-3xl font-bold text-branch mb-2">비밀번호 재설정</h2>
          <p className="text-sm text-gray-600">새로운 비밀번호를 설정해주세요</p>
        </div>

        {/* 비밀번호 재설정 카드 */}
        <div className="bg-white rounded-3xl shadow-xl p-8 backdrop-blur-sm bg-opacity-95">
          {/* 새 비밀번호 입력 */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              새 비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6자 이상 입력하세요"
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-sakura-dark focus:bg-white transition-all"
            />
            {password && (
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    {[1, 2, 3].map((level) => (
                      <div
                        key={level}
                        className={`w-16 h-1 rounded-full transition-all ${
                          password.length >= level * 4
                            ? password.length < 6
                              ? 'bg-red-500'
                              : password.length < 8
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                            : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className={`text-xs font-semibold ${strength.color}`}>
                    {strength.text}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 비밀번호 확인 입력 */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              비밀번호 확인
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="비밀번호를 다시 입력하세요"
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-sakura-dark focus:bg-white transition-all"
            />
            {password && confirmPassword && (
              <p className={`text-xs mt-2 ${
                password === confirmPassword ? 'text-green-500' : 'text-red-500'
              }`}>
                {password === confirmPassword ? '✓ 비밀번호가 일치합니다' : '✗ 비밀번호가 일치하지 않습니다'}
              </p>
            )}
          </div>

          {/* 안내 메시지 */}
          <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-start space-x-2">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div className="text-xs text-gray-700">
                <p className="font-semibold mb-1">안전한 비밀번호 만들기</p>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>최소 6자 이상 (8자 이상 권장)</li>
                  <li>영문, 숫자 조합 사용</li>
                  <li>특수문자 포함 권장</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 비밀번호 재설정 버튼 */}
          <button
            className="w-full py-4 bg-gradient-to-r from-sakura to-sakura-dark text-white font-bold text-lg rounded-xl hover:shadow-xl transform hover:-translate-y-1 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            onClick={handleResetPassword}
            disabled={isLoading || password.length < 6 || password !== confirmPassword}
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
              '비밀번호 재설정'
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
      </div>
    </div>
  );
}