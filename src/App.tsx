import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MainSelect from "./pages/MainSelect";
import LevelSelect from "./pages/LevelSelect";
import PartSelect from "./pages/PartSelect";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/mainSelect" element={<MainSelect />} />
      <Route path="/levelSelect" element={<LevelSelect />} />
      <Route path="/partSelect" element={<PartSelect />} />
    </Routes>
  );
}
