// src/pages/MainSelect.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SelectPage from "../components/SelectPage";

const MainSelect: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/login");
    } else {
      setIsAuthorized(true);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
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
  ];

  if (!isAuthorized) {
    return null; // 인증되지 않은 경우 아무것도 렌더링하지 않음
  }

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