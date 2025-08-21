import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center min-h-screen bg-white">
      {/* 상단 헤더 */}
      <div className="w-full bg-green-500 py-10 flex flex-col items-center text-white rounded-b-2xl">
        <div className="text-3xl mb-3">✿</div>
        <h2 className="text-xl font-bold">회원 가입 페이지</h2>
      </div>

      {/* 입력 폼 */}
      <div className="w-80 mt-10 space-y-6">
        {/* 아이디 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            아이디
          </label>
          <input
            type="text"
            placeholder="아이디"
            className="w-full border border-green-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 text-green-600"
          />
        </div>

        {/* 비밀번호 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            비밀번호
          </label>
          <input
            type="password"
            placeholder="비밀번호"
            className="w-full border border-green-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 text-green-600"
          />
        </div>

        {/* 비밀번호 확인 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            비밀번호 확인
          </label>
          <input
            type="password"
            placeholder="비밀번호 확인"
            className="w-full border border-green-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 text-green-600"
          />
        </div>

        {/* 이메일 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            이메일
          </label>
          <div className="flex space-x-2">
            <input
              type="email"
              placeholder="이메일"
              className="flex-1 border border-green-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 text-green-600"
            />
            <button className="px-4 bg-green-500 text-white rounded-md hover:bg-green-600 transition">
              확인
            </button>
          </div>
        </div>

        {/* 회원가입 버튼 */}
        <button
          className="w-full py-3 bg-green-500 text-white rounded-md font-medium hover:bg-green-600 transition"
          onClick={() => navigate("/login")}
        >
          회원 가입
        </button>
      </div>
    </div>
  );
}
