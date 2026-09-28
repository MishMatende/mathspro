import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function StudentProtectedRoute() {
  const { user, role, loading, profileError, retryProfile } = useAuth();

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

  if (profileError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white">
        <p role="alert" className="text-sm text-gray-500">{profileError}</p>
        <button type="button" onClick={retryProfile} className="rounded-xl bg-orange-500 px-4 py-2 text-white">
          Try again
        </button>
      </div>
    );
  }

  // Only students can access student tools
  if (role !== "student") {
    return <Navigate to="/" replace />;
  }

  // Allowed
  return <Outlet />;
}
