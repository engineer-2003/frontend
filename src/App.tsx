
// src/App.tsx
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Tutorial from "./pages/Tutorial";

// User Pages
import Login from "./pages/user/Login";
import Signup from "./pages/user/SignUp";
import FindPassword from "./pages/user/FindPassword";
import ResetPassword from "./pages/user/ResetPassword";

// Learning Pages
import Select from "./pages/learning/Select";
import Study from "./pages/learning/Study";
import History from "./pages/learning/History";
import Chatbot from "./pages/learning/Chatbot";

export default function App() {
  return (
    <Routes>
      {/* Home */}
      <Route path="/" element={<Home />} />

      {/* Tutorial */}
      <Route path="/tutorial" element={<Tutorial />} />

      {/* User Routes */}
      <Route path="/user/login" element={<Login />} />
      <Route path="/user/signup" element={<Signup />} />
      <Route path="/user/findPassword" element={<FindPassword />} />
      <Route path="/user/reset-password" element={<ResetPassword />} />

      {/* Select Routes */}
      <Route path="/select/main" element={<Select />} />
      <Route path="/select/level" element={<Select />} />
      <Route path="/select/part" element={<Select />} />

      {/* Chatbot */}
      <Route path="/learning/chatbot" element={<Chatbot />} />

      {/* Study */}
      <Route path="/learning/study" element={<Study />} />

      {/* History */}
      <Route path="/learning/history" element={<History />} />
    </Routes>
  );
}
