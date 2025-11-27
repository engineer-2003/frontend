// src/pages/user/SignUp.tsx
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// 디바운스 유틸리티 함수 (lodash의 debounce를 사용해도 좋지만, 여기서는 간단하게 직접 구현)
const debounce = (func: Function, delay: number) => {
  let timeoutId: number;
  return function(this: any, ...args: any) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

export default function Signup() {
  const BASE_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8080';
  const navigate = useNavigate();
  
  // 입력 필드 상태
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  
  // 중복 검사 상태
  const [isUsernameDuplicate, setIsUsernameDuplicate] = useState(false);
  const [isEmailDuplicate, setIsEmailDuplicate] = useState(false);
  
  // 로딩 상태 (API 요청 중)
  const [isUsernameChecking, setIsUsernameChecking] = useState(false);
  const [isEmailChecking, setIsEmailChecking] = useState(false);


  // 아이디 중복 확인 API 호출 함수
  const checkUsernameDuplication = async (inputUsername: string) => {
    if (!inputUsername.trim() || inputUsername.length < 3) {
      setIsUsernameDuplicate(false);
      setIsUsernameChecking(false);
      return;
    }
    
    setIsUsernameChecking(true);
    try {
      const response = await fetch(`${BASE_API_URL}/api/users/check-username?username=${inputUsername}`);
      const exists = await response.json();
      setIsUsernameDuplicate(exists);
    } catch (err) {
      console.error("아이디 중복 검사 실패:", err);
      setIsUsernameDuplicate(false); // 서버 오류 시 중복 아님으로 처리 (또는 에러 메시지 표시)
    } finally {
      setIsUsernameChecking(false);
    }
  };

  // 이메일 중복 확인 API 호출 함수
  const checkEmailDuplication = async (inputEmail: string) => {
    // 간단한 이메일 형식 검사
    if (!inputEmail.trim() || !inputEmail.includes('@')) {
      setIsEmailDuplicate(false);
      setIsEmailChecking(false);
      return;
    }
    
    setIsEmailChecking(true);
    try {
      const response = await fetch(`${BASE_API_URL}/api/users/check-email?email=${inputEmail}`);
      const exists = await response.json();
      setIsEmailDuplicate(exists);
    } catch (err) {
      console.error("이메일 중복 검사 실패:", err);
      setIsEmailDuplicate(false);
    } finally {
      setIsEmailChecking(false);
    }
  };

  // 디바운스 적용된 중복 검사 함수 생성
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedCheckUsername = useCallback(debounce(checkUsernameDuplication, 500), [BASE_API_URL]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedCheckEmail = useCallback(debounce(checkEmailDuplication, 500), [BASE_API_URL]);


  // 아이디 변경 핸들러
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUsername = e.target.value;
    setUsername(newUsername);
    if (newUsername.trim()) {
      debouncedCheckUsername(newUsername);
    } else {
      setIsUsernameDuplicate(false);
    }
  };

  // 이메일 변경 핸들러
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    if (newEmail.trim()) {
      debouncedCheckEmail(newEmail);
    } else {
      setIsEmailDuplicate(false);
    }
  };

  const handleSignup = async () => {
    // 프론트엔드 유효성 검사
    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다!");
      return;
    }
    
    // 중복 및 로딩 상태 확인
    if (isUsernameDuplicate || isEmailDuplicate || isUsernameChecking || isEmailChecking) {
        alert("아이디 또는 이메일 중복 검사를 완료하거나 중복 문제를 해결해 주세요.");
        return;
    }

    // 최소 길이 등 추가 검사 (UserRegistrationDto.java와 맞추는 것이 좋음)
    if (username.length < 3 || password.length < 6 || !email.includes('@')) {
        alert("입력 정보를 확인해 주세요 (아이디 3자 이상, 비밀번호 6자 이상, 유효한 이메일).");
        return;
    }

    try {
      const response = await fetch(`${BASE_API_URL}/api/users/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, email }),
      });

      if (response.ok) {
        alert("회원가입 성공!");
        navigate("/user/login");
      } else {
        const error = await response.text();
        // 백엔드에서 넘어온 '이미 존재하는 아이디입니다.' 등의 메시지 처리
        alert("회원가입 실패: " + error); 
      }
    } catch (err) {
      alert("서버 연결 실패: " + err);
    }
  };
  
  const isFormValid = username.trim() && password && confirmPassword && email.includes('@') && 
                      password === confirmPassword && 
                      !isUsernameDuplicate && !isEmailDuplicate && 
                      !isUsernameChecking && !isEmailChecking;


  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="relative flex items-center justify-center px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="absolute left-4 text-gray-700 hover:text-gray-900 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-900">회원가입</h1>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="px-4 py-8 max-w-md mx-auto">
        {/* 상단 장식 */}
        <div className="text-center mb-8 animate-fade-in-05s">
          <div className="text-sakura text-6xl mb-3 animate-bounce-gentle">✿</div>
          <h2 className="text-2xl font-bold text-branch mb-2">하루의 일본어</h2>
          <p className="text-sm text-gray-600">새로운 계정을 만들어보세요</p>
        </div>

        {/* 회원가입 카드 */}
        <div className="bg-white rounded-3xl shadow-lg p-6 space-y-5 animate-slide-up">
          {/* 아이디 입력 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              아이디 (3자 이상)
            </label>
            <input
              type="text"
              value={username}
              onChange={handleUsernameChange} // 수정된 핸들러 사용
              placeholder="사용할 아이디를 입력하세요"
              className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none focus:border-sakura-dark focus:bg-white transition-all 
                ${isUsernameDuplicate ? 'border-red-500' : 'border-gray-200'} `}
            />
            {isUsernameChecking && (
                <p className="text-xs text-blue-500 mt-2">아이디 중복 확인 중...</p>
            )}
            {!isUsernameChecking && username.trim().length >= 3 && isUsernameDuplicate && (
              <p className="text-xs text-red-500 mt-2">이미 존재하는 아이디입니다</p>
            )}
            {!isUsernameChecking && username.trim().length >= 3 && !isUsernameDuplicate && (
              <p className="text-xs text-green-500 mt-2">사용 가능한 아이디입니다</p>
            )}
            {!isUsernameChecking && username.trim().length > 0 && username.trim().length < 3 && (
              <p className="text-xs text-red-500 mt-2">아이디는 최소 3자 이상이어야 합니다</p>
            )}
          </div>

          {/* 이메일 입력 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              이메일
            </label>
            <input
              type="email"
              value={email}
              onChange={handleEmailChange} // 수정된 핸들러 사용
              placeholder="example@email.com"
              className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none focus:border-sakura-dark focus:bg-white transition-all 
                ${isEmailDuplicate ? 'border-red-500' : 'border-gray-200'} `}
            />
            {isEmailChecking && (
                <p className="text-xs text-blue-500 mt-2">이메일 중복 확인 중...</p>
            )}
            {!isEmailChecking && email.includes('@') && isEmailDuplicate && (
              <p className="text-xs text-red-500 mt-2">이미 존재하는 이메일입니다</p>
            )}
            {!isEmailChecking && email.includes('@') && !isEmailDuplicate && email.trim().length > 0 && (
              <p className="text-xs text-green-500 mt-2">사용 가능한 이메일입니다</p>
            )}
            {!isEmailChecking && email.trim().length > 0 && !email.includes('@') && (
              <p className="text-xs text-red-500 mt-2">유효한 이메일 주소를 입력해주세요</p>
            )}
          </div>

          {/* 비밀번호 입력 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              비밀번호 (6자 이상)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6자 이상 입력하세요"
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-sakura-dark focus:bg-white transition-all"
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
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-sakura-dark focus:bg-white transition-all"
            />
            {password && confirmPassword && password !== confirmPassword && (
              <p className="text-xs text-red-500 mt-2">비밀번호가 일치하지 않습니다</p>
            )}
            {password && confirmPassword && password === confirmPassword && (
              <p className="text-xs text-green-500 mt-2">비밀번호가 일치합니다</p>
            )}
          </div>

          {/* 회원가입 버튼 */}
          <button
            onClick={handleSignup}
            disabled={!isFormValid} // 유효성 검사 실패 시 버튼 비활성화
            className={`w-full py-4 font-bold text-lg rounded-xl transform hover:-translate-y-1 active:translate-y-0 transition-all duration-200 mt-6
              ${isFormValid 
                ? 'bg-gradient-to-r from-sakura to-sakura-dark text-white hover:shadow-xl'
                : 'bg-gray-400 text-gray-700 cursor-not-allowed'
              }
            `}
          >
            회원가입
          </button>

          {/* 로그인 링크 */}
          <div className="pt-4 text-center border-t border-gray-200">
            <span className="text-sm text-gray-600">이미 계정이 있으신가요? </span>
            <button
              className="text-sm text-sakura-dark font-bold hover:text-sakura-darker transition-colors"
              onClick={() => navigate('/user/login')}
            >
              로그인
            </button>
          </div>
        </div>

        {/* 하단 안내 */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            회원가입 시 <span className="text-sakura-dark font-semibold">이용약관</span> 및{' '}
            <span className="text-sakura-dark font-semibold">개인정보 처리방침</span>에 동의하게 됩니다
          </p>
        </div>
      </div>
    </div>
  );
}