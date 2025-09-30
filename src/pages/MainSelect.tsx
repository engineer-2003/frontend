// src/pages/MainSelect.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import SelectPage from "../components/SelectPage";

const MainSelect: React.FC = () => {
  const navigate = useNavigate();
  
  // 로그인 상태 확인 로직을 삭제했습니다.
  // 이 페이지는 이제 라우팅 설정에 따라 토큰이 있을 때만 접근 가능합니다.

  const handleLogout = () => {
    localStorage.removeItem("token"); // 로그아웃 시 토큰 삭제
    alert("로그아웃되었습니다.");
    navigate("/login");
  };

  const items = [
    {
      id: "level",
      title: "급수별 학습",
      description: `전체 단어 수: 7150개\n진도율: 30%`,
      onClick: () => navigate("/levelSelect"),
    },
    {
      id: "pattern",
      title: "문형별 학습",
      description: `전체 문형 수: 250개\n진도율: 10%`,
      onClick: () => {
        navigate("/study", { state: { level: "N3", partId: "동사" } });
      },
    },
    {
      id: "history",
      title: "학습 기록 확인",
      description: `7일 연속 학습 중`,
      onClick: () => navigate("/history"),
    },
    {
      id: "chatbot",
      title: "챗봇과 대화하기",
      description: `궁금한 점을 바로 물어보세요!`,
      onClick: () => navigate("/chatbot"),
    },
  ];

  return (
    <SelectPage
      headerTitle="나의 학습"
      headerExtra={
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm text-white bg-sakura-dark rounded-lg hover:bg-sakura-darker transition"
        >
          로그아웃
        </button>
      }
      showBackButton={false}
      items={items}
    />
  );
};

export default MainSelect;