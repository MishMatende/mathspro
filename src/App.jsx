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
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import AdminDashboard from "./pages/adminPages/AdminDashboard";
import AdminDashboardLayout from "./components/layouts/AdminDashboardLayout";
import AdminLearnerspage from "./pages/adminPages/AdminLearnerspage";
import AdminTutorsPage from "./pages/adminPages/AdminTutorsPage";

function App() {
  return (
    <Routes>
      {/* No layout */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      {/* Tutor Dashboard layout — navbar + sidenav */}
      <Route element={<TutorDashboardLayout />}>
        <Route path="/tutor-dashboard" element={<TutorDashboard />} />
        <Route path="/diagnostic" element={<div>Diagnostic Page</div>} />
        <Route path="/learners/:id" element={<LearnerProfilePage />} />
        <Route path="/learners" element={<LearnersPage />} />
        <Route path="/homework" element={<HomeworkPage />} />
        <Route path="/tests" element={<TestsPage />} />
        <Route path="/tutor-schedule" element={<TutorSchedulePage />} />
      </Route>

      {/* Admin Dashboard layout — navbar + sidenav */}
      <Route element={<AdminDashboardLayout />}>
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin-learners" element={<AdminLearnerspage />} />
        <Route path="/admin-tutors" element={<AdminTutorsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
