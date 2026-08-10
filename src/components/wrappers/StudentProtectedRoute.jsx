import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function StudentProtectedRoute() {
  const { user, role, loading } = useAuth();

  // Still checking session
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Only students can access student tools
  if (role !== "student") {
    return <Navigate to="/" replace />;
  }

  // Allowed
  return <Outlet />;
}
