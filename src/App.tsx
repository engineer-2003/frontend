import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";

// User Pages (이동)
import Login from "./pages/user/Login";
import Signup from "./pages/user/SignUp";
import FindPassword from "./pages/user/FindPassword";
import ResetPassword from "./pages/user/ResetPassword"; 

// Learning Pages (통합 및 이동)
import Select from "./pages/learning/Select"; // MainSelect, LevelSelect, PartSelect 통합
import Study from "./pages/learning/Study"; // SentenceStudy, ConjugationStudy 통합
import History from "./pages/learning/History"; // 이동

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      
      {/* User Routes */}
      <Route path="/user/login" element={<Login />} />
      <Route path="/user/signup" element={<Signup />} />
      <Route path="/user/findPassword" element={<FindPassword />} />
      <Route path="/user/reset-password" element={<ResetPassword />} />

      {/* Select Routes (Main/Level/Part 통합) */}
      <Route path="/select/main" element={<Select />} />
      <Route path="/select/level" element={<Select />} />
      <Route path="/select/part" element={<Select />} />

      {/* Study Route (Sentence/Conjugation 통합) */}
      <Route path="/learning/study" element={<Study />} />

      {/* History Route */}
      <Route path="/learning/history" element={<History />} />

    </Routes>
  );
}