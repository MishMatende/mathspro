import "./App.css";
import Home from "./pages/Home";
import { Route, Routes } from "react-router-dom";
import TutorDashboard from "./pages/TutorDashboard";
import LearnerProfilePage from "./pages/LearnerProfilePage";
import TutorDashboardLayout from "./layouts/TutorDashboardLayout";
import LearnersPage from "./pages/LearnersPage";
import HomeworkPage from "./pages/HomeworkPage";
import TestsPage from "./pages/TestsPage";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";


function App() {
  return (
    <Routes>
      {/* No layout */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />


      {/* Dashboard layout — navbar + sidenav */}
      <Route element={<TutorDashboardLayout />}>
        <Route path="/tutor-dashboard" element={<TutorDashboard />} />
        <Route path="/diagnostic" element={<div>Diagnostic Page</div>} />
        <Route path="/learners/:id" element={<LearnerProfilePage />} />
        <Route path="/learners" element={<LearnersPage />} />
        <Route path="/homework" element={<HomeworkPage />} />
        <Route path="/tests" element={<TestsPage />} />
      </Route>
    </Routes>
  );
}

export default App;