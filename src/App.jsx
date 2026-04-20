import "./App.css";
import Home from "./pages/homePage/Home";
import { Route, Routes } from "react-router-dom";
import TutorDashboard from "./pages/tutorPages/TutorDashboard";
import LearnerProfilePage from "./pages/tutorPages/LearnerProfilePage";
import TutorDashboardLayout from "./components/layouts/TutorDashboardLayout";
import LearnersPage from "./pages/tutorPages/LearnersPage";
import HomeworkPage from "./pages/tutorPages/HomeworkPage";
import TestsPage from "./pages/tutorPages/TestsPage";
import TutorSchedulePage from "./pages/tutorPages/TutorSchedulePage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route element={<TutorDashboardLayout />}>
        <Route path="/tutor-dashboard" element={<TutorDashboard />} />
        <Route path="/diagnostic" element={<div>Diagnostic Page</div>} />

        <Route path="/learners/:id" element={<LearnerProfilePage />} />
        <Route path="/learners" element={<LearnersPage />} />
        <Route path="/homework" element={<HomeworkPage />} />
        <Route path="/tests" element={<TestsPage />} />
        <Route path="/tutor-schedule" element={<TutorSchedulePage />} />
      </Route>
    </Routes>
  );
}

export default App;
