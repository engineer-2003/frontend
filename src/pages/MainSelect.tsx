import React from "react";
import { useNavigate } from "react-router-dom";
import SelectPage from "../components/SelectPage";

const MainSelect: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    alert("로그아웃 되었습니다.");
    navigate("/");
  };

  return (
    <SelectPage
      headerTitle="나의 학습"
      headerExtra={
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
        >
          로그아웃
        </button>
      }
      items={[
        {
          id: "level",
          title: "급수별 학습",
          onClick: () => navigate("/levelSelect"),
        },
        {
          id: "pattern",
          title: "문형별 학습",
          onClick: () => navigate("/study"),
        },
        {
          id: "history",
          title: "학습 기록 확인",
          onClick: () => navigate("/history"),
        },
      ]}
    />
  );
};

export default MainSelect;
