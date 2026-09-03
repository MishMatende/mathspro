import "./App.css";
import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import TutorDashboardLayout from "./components/layouts/TutorDashboardLayout";
import AdminDashboardLayout from "./components/layouts/AdminDashboardLayout";
import AdminProtectedRoute from "./components/wrappers/AdminProtectedRoute";
import StudentProtectedRoute from "./components/wrappers/StudentProtectedRoute";
import TutorProtectedRoute from "./components/wrappers/TutorProtectedRoute";
import StudentDashboardLayout from "./components/layouts/StudentDashboardLayout";

const Home = lazy(() => import("./pages/homePage/Home"));
const Login = lazy(() => import("./pages/Login"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const UpdatePassword = lazy(() => import("./pages/UpdatePassword"));
const ReachOutPage = lazy(() => import("./pages/ReachOutPage"));
const HowItWorksPage = lazy(() => import("./pages/HowItWorksPage"));
const DiagnosticsPage = lazy(() => import("./pages/DiagnosticsPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminLogin = lazy(() => import("./pages/adminPages/AdminLogin"));
const TutorDashboard = lazy(() => import("./pages/tutorPages/TutorDashboard"));
const LearnerProfilePage = lazy(() => import("./pages/tutorPages/LearnerProfilePage"));
const LearnersPage = lazy(() => import("./pages/tutorPages/LearnersPage"));
const HomeworkPage = lazy(() => import("./pages/tutorPages/HomeworkPage"));
const TutorSchedulePage = lazy(() => import("./pages/tutorPages/TutorSchedulePage"));
const TutorResourcesPage = lazy(() => import("./pages/tutorPages/TutorResourcesPage"));
const TutorResourceViewerPage = lazy(() => import("./pages/tutorPages/TutorResourceViewerPage"));
const StudentDashboard = lazy(() => import("./pages/studentPages/StudentDashboard"));
const LearnerSchedule = lazy(() => import("./pages/studentPages/LearnerSchedule"));
const StudentHomeworkPage = lazy(() => import("./pages/studentPages/StudentHomeworkPage"));
const StudentTestPage = lazy(() => import("./pages/studentPages/StudentTestPage"));
const StudentFilesPage = lazy(() => import("./pages/studentPages/StudentFilesPage"));
const AdminDashboard = lazy(() => import("./pages/adminPages/AdminDashboard"));
const AdminLearnerspage = lazy(() => import("./pages/adminPages/AdminLearnerspage"));
const AdminTutorsPage = lazy(() => import("./pages/adminPages/AdminTutorsPage"));
const AdminLessonsPage = lazy(() => import("./pages/adminPages/AdminLessonsPage"));
const AdminTestsPage = lazy(() => import("./pages/adminPages/AdminTestsPage"));
const AdminChecklistPage = lazy(() => import("./pages/adminPages/AdminChecklistPage"));
const AdminTopicLibraryPage = lazy(() => import("./pages/adminPages/AdminTopicLibraryPage"));
const AdminResourcesPage = lazy(() => import("./pages/adminPages/AdminResourcesPage"));

function RouteFallback() {
  return (
    <div
      className="flex min-h-screen items-center justify-center"
      role="status"
      aria-label="Loading page"
    >
      <div className="logo-loader-stage">
        <img
          src="/logo.svg"
          alt=""
          className="logo-loader h-14 w-36 object-contain"
        />
      </div>
    </div>
  );
}

function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
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
          <Route path="/tutor-resources" element={<TutorResourcesPage />} />
          <Route path="/tutor-resources/:id" element={<TutorResourceViewerPage />} />
        </Route>
      </Route>

      <Route element={<StudentProtectedRoute />}>
        <Route element={<StudentDashboardLayout />}>
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/student-schedule" element={<LearnerSchedule />} />
          <Route path="/student-homework" element={<StudentHomeworkPage />} />
          <Route path="/student-test" element={<StudentTestPage />} />
          <Route path="/student-files" element={<StudentFilesPage />} />
        </Route>
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
          <Route path="/admin-topic-library" element={<AdminTopicLibraryPage />} />
          <Route path="/admin-resources" element={<AdminResourcesPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
    </Suspense>
  );
}

export default App;
