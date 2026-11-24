// src/pages/Home.tsx
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";

export default function Home() {
  const BASE_API_URL =
    import.meta.env.VITE_BACKEND_API_URL || "http://localhost:8080";

  const navigate = useNavigate();

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfo = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          }
        );

        const { email } = userInfo.data;

        const response = await fetch(
          `${BASE_API_URL}/api/users/login/google`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
          }
        );

        if (response.ok) {
          const token = await response.text();
          localStorage.setItem("token", token);

          alert("구글 계정으로 로그인 성공!");
          navigate("/select/main");
        } else {
          alert("구글 로그인에 실패했습니다.");
        }
      } catch (error) {
        console.error("Google 로그인 오류:", error);
        alert("서버 오류가 발생했습니다.");
      }
    },

    onError: (error) => {
      console.error("Google 로그인 실패:", error);
      alert("구글 로그인에 실패했습니다.");
    },
  });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#fff9fb]">
      <div className="relative z-10 flex flex-col items-center">
        <h1 className="mb-2 text-3xl font-bold text-branch">
          하루의 일본어
        </h1>

        <div className="mb-12 mt-6 text-8xl text-sakura">
          ✿
        </div>

        <div className="flex w-64 flex-col space-y-4">
          <button
            onClick={() => navigate("/user/login")}
            className="w-full rounded-2xl bg-sakura-dark py-4 text-lg font-semibold text-white transition-colors duration-200 hover:bg-sakura-darker active:opacity-90"
          >
            로그인
          </button>

          <button
            onClick={() => handleGoogleLogin()}
            className="flex w-full items-center justify-center rounded-2xl border-2 border-gray-200 bg-white py-4 text-lg font-semibold text-gray-700 transition-colors duration-200 hover:bg-gray-50 active:opacity-90"
          >
            <svg
              className="mr-3 h-5 w-5"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google 로그인
          </button>
        </div>

        <p className="mt-5 text-sm text-gray-600">
          계정이 없으신가요?{" "}
          <button
            onClick={() => navigate("/user/signup")}
            className="font-semibold text-sakura-dark underline underline-offset-4 transition-colors hover:text-sakura-darker"
          >
            회원가입
          </button>
        </p>

        <p className="mt-8 text-sm text-branch opacity-70">
          매일의 일본어, 하루의 일본어
        </p>
      </div>
    </div>
  );
}
