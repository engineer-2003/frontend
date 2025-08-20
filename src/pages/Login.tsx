import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-green-50">
      {/* 상단 아이콘 + 타이틀 */}
      <div className="mb-10 flex flex-col items-center">
        <div className="text-green-500 text-5xl mb-3">✿</div>
        <h2 className="text-2xl font-bold text-green-600">로그인</h2>
      </div>

      {/* 입력창 */}
      <div className="w-80 bg-white rounded-2xl shadow p-8">
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            아이디
          </label>
          <input
            type="text"
            placeholder="아이디"
            className="w-full border-b border-green-400 focus:outline-none py-2 text-green-600"
          />
        </div>

        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            비밀번호
          </label>
          <input
            type="password"
            placeholder="비밀번호"
            className="w-full border-b border-green-400 focus:outline-none py-2 text-green-600"
          />
        </div>

        {/* 로그인 버튼 */}
        <button
          className="w-full py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
          onClick={() => navigate("/mainSelect")}
        >
          로그인
        </button>
      </div>
    </div>
  );
}
