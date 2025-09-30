import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/SignUp";
import MainSelect from "./pages/MainSelect";
import LevelSelect from "./pages/LevelSelect";
import PartSelect from "./pages/PartSelect";
import SentenceStudy from "./pages/SentenceStudy";
import ConjugationStudy from "./pages/ConjugationStudy";
import History from "./pages/History";
import FindPassword from './pages/FindPassword';
import ResetPassword from './pages/ResetPassword'; 
import Chatbot from "./pages/Chatbot";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/mainSelect" element={<MainSelect />} />
      <Route path="/levelSelect" element={<LevelSelect />} />
      <Route path="/partSelect" element={<PartSelect />} />
      <Route path="/study/sentence" element={<SentenceStudy />} />
      <Route path="/study/conjugation" element={<ConjugationStudy />} />
      <Route path="/history" element={<History />} />
      <Route path="/findPassword" element={<FindPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/chatbot" element={<Chatbot />} />
    </Routes>
  );
}