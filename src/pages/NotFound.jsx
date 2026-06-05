import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(-1);
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="text-center">
        <h1 className="text-7xl font-bold text-orange-500">404</h1>

        <h2 className="mt-4 text-2xl font-semibold text-slate-800">
          Page Not Found
        </h2>

        <p className="mt-2 text-slate-500">Taking you back...</p>

        <button
          onClick={() => navigate(-1)}
          className="
            mt-6
            px-5 py-3
            rounded-xl
            bg-orange-500
            text-white
            hover:bg-orange-600
            transition
          "
        >
          Go Back
        </button>
      </div>
    </div>
  );
}
