import "./App.css";
import Home from "./pages/homePage/Home";
import { Route, Routes } from "react-router-dom";
import TutorDashboard from "./pages/tutorPages/TutorDashboard";
import LearnerProfilePage from "./pages/tutorPages/LearnerProfilePage";
import TutorDashboardLayout from "./components/layouts/TutorDashboardLayout";
import LearnersPage from "./pages/tutorPages/LearnersPage";
import HomeworkPage from "./pages/tutorPages/HomeworkPage";
import TutorSchedulePage from "./pages/tutorPages/TutorSchedulePage";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import AdminDashboard from "./pages/adminPages/AdminDashboard";
import AdminDashboardLayout from "./components/layouts/AdminDashboardLayout";
import AdminLearnerspage from "./pages/adminPages/AdminLearnerspage";
import AdminTutorsPage from "./pages/adminPages/AdminTutorsPage";
import AdminLogin from "./pages/adminPages/AdminLogin";
import AdminProtectedRoute from "./components/wrappers/AdminProtectedRoute";
import DiagnosticsPage from "./pages/DiagnosticsPage";
import TutorProtectedRoute from "./components/wrappers/TutorProtectedRoute";
import AdminLessonsPage from "./pages/adminPages/AdminLessonsPage";
import LearnerSchedule from "./pages/studentPages/LearnerSchedule";
import StudentDashboardLayout from "./components/layouts/StudentDashboardLayout";
import UpdatePassword from "./pages/UpdatePassword";
import StudentDashboard from "./pages/studentPages/StudentDashboard";
import StudentHomeworkPage from "./pages/studentPages/StudentHomeworkPage";
import ReachOutPage from "./pages/ReachOutPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import StudentTestPage from "./pages/studentPages/StudentTestPage";
import AdminTestsPage from "./pages/adminPages/AdminTestsPage";
import StudentFilesPage from "./pages/studentPages/StudentFilesPage";
import NotFound from "./pages/NotFound";
import AdminChecklistPage from "./pages/adminPages/AdminChecklistPage";

function App() {
  return (
    <Routes>
      {/* No layout */}
      <Route path="/" element={<Home />} />
      <Route path="/reach-out" element={<ReachOutPage />} />
      <Route path="/how-it-works" element={<HowItWorksPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/update-password" element={<UpdatePassword />} />
      <Route path="/admin-login" element={<AdminLogin />} />

      <Route path="/diagnostic" element={<DiagnosticsPage />} />

      {/* Tutor Dashboard layout — navbar + sidenav */}
      <Route element={<TutorProtectedRoute />}>
        <Route element={<TutorDashboardLayout />}>
          <Route path="/tutor-dashboard" element={<TutorDashboard />} />
          <Route path="/learners/:id" element={<LearnerProfilePage />} />
          <Route path="/learners" element={<LearnersPage />} />
          <Route path="/homework" element={<HomeworkPage />} />
          {/* <Route path="/tests" element={<TestsPage />} /> */}
          <Route path="/tutor-schedule" element={<TutorSchedulePage />} />
        </Route>
      </Route>

      <Route element={<StudentDashboardLayout />}>
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/student-schedule" element={<LearnerSchedule />} />
        <Route path="/student-homework" element={<StudentHomeworkPage />} />
        <Route path="/student-test" element={<StudentTestPage />} />
        <Route path="/student-files" element={<StudentFilesPage />} />
      </Route>

      {/* Admin Dashboard layout — navbar + sidenav */}
      <Route element={<AdminProtectedRoute />}>
        <Route element={<AdminDashboardLayout />}>
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/admin-learners" element={<AdminLearnerspage />} />
          <Route path="/admin-tutors" element={<AdminTutorsPage />} />
          <Route path="/admin-lessons" element={<AdminLessonsPage />} />
          <Route path="/admin-tests" element={<AdminTestsPage />} />
          <Route path="/admin-checklist" element={<AdminChecklistPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
