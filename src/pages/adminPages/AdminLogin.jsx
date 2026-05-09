import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import {
  ArrowLeft,
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  BarChart3,
} from "lucide-react";

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    const res = await login({
      email: formData.email,
      password: formData.password,
      expectedRole: "admin",
    });

    setLoading(false);

    if (!res.success) {
      toast.error(res.error);
      return;
    }

    toast.success("Welcome Admin 👋");

    navigate("/admin-dashboard");
  };

  return (
    <div className="min-h-screen bg-[#f7f7f8] flex overflow-hidden">
      {/* LEFT */}
      <div className="w-full lg:w-[46%] flex items-center justify-center px-6 py-10 sm:px-10 lg:px-14 relative">
        {/* soft bg */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-30 -left-30 w-6560px] rounded-full border border-orange-100" />
          <div className="absolute -bottom-45 -right-45 w-[320px] h-80 rounded-full bg-orange-50 blur-3xl opacity-70" />
        </div>

        <div className="relative z-10 max-w-125">
          {/* top */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-xs sm:text-sm text-gray-400 hover:text-gray-700 transition-colors mb-8"
          >
            <ArrowLeft size={14} />
            Back to Home
          </button>

          {/* logo */}
          <div className="mb-8">
            <h1 className="text-[28px] sm:text-[30px] font-black tracking-[-0.04em] text-[#ff6a2b]">
              MathsPro
            </h1>
          </div>

          {/* card */}
          <div className="bg-white border border-gray-100 rounded-4xl p-6 sm:p-8 shadow-[0_10px_50px_rgba(0,0,0,0.04)]">
            {/* badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 text-[#ff6a2b] text-[11px] sm:text-xs font-semibold border border-orange-100 mb-5">
              <ShieldCheck size={13} />
              Secure Admin Access
            </div>

            {/* heading */}
            <div className="mb-7">
              <h2 className="text-[26px] sm:text-[30px] leading-[1.05] tracking-[-0.05em] font-black text-[#111827]">
                Welcome back
              </h2>

              <p className="text-[14px] text-gray-500 leading-relaxed mt-3 max-w-sm">
                Sign in to manage learners, tutors, diagnostics and platform
                analytics.
              </p>
            </div>

            {/* form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* email */}
              <div>
                <label className="text-[12px] font-medium text-gray-600 block mb-2">
                  Admin Email
                </label>

                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="
                      w-full h-13 rounded-2xl
                      border border-gray-200
                      bg-[#fafafa]
                      pl-11 pr-4
                      text-[14px]
                      placeholder:text-gray-400
                      focus:outline-none
                      focus:ring-4
                      focus:ring-orange-100
                      focus:border-[#ff6a2b]
                      focus:bg-white
                      transition-all
                    "
                  />
                </div>
              </div>

              {/* password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[12px] font-medium text-gray-600">
                    Password
                  </label>

                  <button
                    type="button"
                    className="text-[12px] font-medium text-[#ff6a2b] hover:text-[#eb5c1d] transition"
                  >
                    Forgot Password?
                  </button>
                </div>

                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="
                      w-full h-13 rounded-2xl
                      border border-gray-200
                      bg-[#fafafa]
                      pl-11 pr-11
                      text-[14px]
                      placeholder:text-gray-400
                      focus:outline-none
                      focus:ring-4
                      focus:ring-orange-100
                      focus:border-[#ff6a2b]
                      focus:bg-white
                      transition-all
                    "
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {/* button */}
              <button
                type="submit"
                disabled={loading}
                className="
                  w-full h-13 rounded-2xl
                  bg-[#ff6a2b]
                  hover:bg-[#f25d1d]
                  text-white
                  font-semibold
                  text-[14px]
                  shadow-[0_10px_25px_rgba(255,106,43,0.25)]
                  transition-all
                  active:scale-[0.99]
                  disabled:opacity-70
                  mt-2
                "
              >
                {loading ? "Logging in..." : "Login to Admin Center"}
              </button>
            </form>

            {/* footer */}
            <div className="mt-6 pt-5 border-t border-gray-100">
              <p className="text-[12px] text-center text-gray-400 leading-relaxed">
                Protected administrative portal with secure authentication.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="hidden lg:flex lg:w-[54%] relative bg-[#111827] overflow-hidden items-center justify-center">
        {/* gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,106,43,0.28),transparent_35%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,106,43,0.16),transparent_30%)]" />

        {/* grid */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.14) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.14) 1px, transparent 1px)
            `,
            backgroundSize: "44px 44px",
          }}
        />

        {/* floating blur */}
        <div className="absolute top-24 right-24 w-72 h-72 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="absolute bottom-20 left-16 w-80 h-80 rounded-full bg-orange-500/10 blur-3xl" />

        {/* content */}
        <div className="relative z-10 max-w-xl px-12">
          {/* icon */}
          <div className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-2xl mb-8">
            <BarChart3 size={34} className="text-white" />
          </div>

          <div className="space-y-5">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-orange-300 font-semibold mb-4">
                MathsPro Admin
              </p>

              <h2 className="text-[42px] leading-[0.98] tracking-[-0.06em] font-black text-white max-w-lg">
                Smarter tools for better learning.
              </h2>
            </div>

            <p className="text-[15px] leading-relaxed text-gray-400 max-w-lg">
              Monitor learner performance, manage tutors, track diagnostics and
              oversee the complete MathsPro learning experience from one modern
              dashboard.
            </p>
          </div>

          {/* stats */}
          <div className="flex items-center gap-10 mt-12">
            <div>
              <p className="text-[32px] font-black text-white tracking-[-0.04em]">
                1K+
              </p>
              <p className="text-xs text-gray-400 mt-1">Students</p>
            </div>

            <div>
              <p className="text-[32px] font-black text-white tracking-[-0.04em]">
                500+
              </p>
              <p className="text-xs text-gray-400 mt-1">Lessons</p>
            </div>

            <div>
              <p className="text-[32px] font-black text-white tracking-[-0.04em]">
                98%
              </p>
              <p className="text-xs text-gray-400 mt-1">Success Rate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
