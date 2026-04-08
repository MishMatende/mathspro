import "./App.css";
import Home from "./pages/Home";
import { Route, Routes } from "react-router-dom";
import TutorDashboard from "./pages/TutorDashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/tutor-dashboard" element={<TutorDashboard />} />
      <Route path="/diagnostic" element={<div>Diagnostic Page</div>} />
    </Routes>
  );
}

export default App;
