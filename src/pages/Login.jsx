import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState("role");
  const [role, setRole] = useState(null);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setStep("form");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Login Data:", { ...formData, role });

      setTimeout(() => {
        setLoading(false);
        if (role === "tutor") {
          navigate("/tutor-dashboard");
        } else {
          navigate("/student-dashboard");
        }
      }, 1000);
    } catch (error) {
      setLoading(false);
      alert("Login failed");
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');

        .login-page {
          min-height: 100vh;
          display: flex;
          font-family: 'Sora', sans-serif;
        }

        .login-card {
          display: flex;
          width: 100%;
          min-height: 100vh;
        }

        /* left side - the form */
        .login-left {
          width: 45%;
          background: #fff;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 60px 64px;
          position: relative;
          overflow: hidden;
        }

        .login-left::before {
          content: '';
          position: absolute;
          top: -60px;
          left: -60px;
          width: 160px;
          height: 160px;
          border-radius: 50%;
          border: 2px solid rgba(255, 100, 0, 0.08);
          pointer-events: none;
        }

        .login-form-inner {
          width: 100%;
          max-width: 340px;
        }

        /* step slide-in animation */
        .step-enter {
          animation: stepIn 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        @keyframes stepIn {
          from {
            opacity: 0;
            transform: translateX(24px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* role selection screen */
        .role-heading {
          font-size: 1.85rem;
          font-weight: 700;
          color: #0a0a0a;
          margin-bottom: 8px;
          letter-spacing: -0.03em;
          text-align: center;
        }

        .role-sub {
          font-size: 0.82rem;
          color: #aaa;
          margin-bottom: 40px;
          text-align: center;
        }

        .role-cards {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-bottom: 32px;
        }

        .role-card {
          display: flex;
          align-items: center;
          gap: 18px;
          padding: 20px 22px;
          border: 1.5px solid #ececec;
          border-radius: 16px;
          cursor: pointer;
          background: #fafafa;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s, transform 0.15s;
          text-align: left;
        }

        .role-card:hover {
          border-color: #FF6400;
          background: #fff;
          box-shadow: 0 4px 20px rgba(255, 100, 0, 0.1);
          transform: translateY(-1px);
        }

        .role-icon {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          background: rgba(255, 100, 0, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.6rem;
          flex-shrink: 0;
          transition: background 0.2s;
        }

        .role-card:hover .role-icon {
          background: rgba(255, 100, 0, 0.14);
        }

        .role-card-title {
          font-size: 0.95rem;
          font-weight: 600;
          color: #0a0a0a;
          margin-bottom: 3px;
        }

        .role-card-desc {
          font-size: 0.75rem;
          color: #aaa;
          line-height: 1.5;
        }

        .role-arrow {
          margin-left: auto;
          color: #ddd;
          font-size: 1.1rem;
          transition: color 0.2s, transform 0.2s;
        }

        .role-card:hover .role-arrow {
          color: #FF6400;
          transform: translateX(3px);
        }

        /* login form */
        .back-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.78rem;
          color: #aaa;
          cursor: pointer;
          margin-bottom: 32px;
          width: fit-content;
          background: none;
          border: none;
          font-family: 'Sora', sans-serif;
          padding: 0;
          transition: color 0.15s;
        }

        .back-btn:hover {
          color: #FF6400;
        }

        .role-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 100, 0, 0.08);
          color: #FF6400;
          border-radius: 50px;
          padding: 5px 12px;
          font-size: 0.72rem;
          font-weight: 600;
          margin-bottom: 16px;
          letter-spacing: 0.02em;
        }

        .login-left h1 {
          font-size: 1.85rem;
          font-weight: 700;
          color: #0a0a0a;
          margin-bottom: 8px;
          letter-spacing: -0.03em;
          text-align: center;
        }

        .login-left p.subtitle {
          font-size: 0.82rem;
          color: #aaa;
          margin-bottom: 36px;
          text-align: center;
        }

        .login-input {
          width: 100%;
          border: 1.5px solid #ececec;
          border-radius: 12px;
          padding: 14px 18px;
          font-size: 0.85rem;
          font-family: 'Sora', sans-serif;
          color: #0a0a0a;
          background: #fafafa;
          outline: none;
          margin-bottom: 12px;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }

        .login-input:focus {
          border-color: #FF6400;
          box-shadow: 0 0 0 3px rgba(255, 100, 0, 0.08);
          background: #fff;
        }

        .login-input::placeholder {
          color: #ccc;
        }

        .forgot-link {
          text-align: right;
          font-size: 0.75rem;
          color: #FF6400;
          cursor: pointer;
          margin-bottom: 24px;
          margin-top: 2px;
        }

        .btn-login {
          width: 100%;
          background: #FF6400;
          color: #fff;
          border: none;
          border-radius: 50px;
          padding: 15px;
          font-size: 0.88rem;
          font-weight: 600;
          font-family: 'Sora', sans-serif;
          cursor: pointer;
          letter-spacing: 0.02em;
          box-shadow: 0 6px 24px rgba(255, 100, 0, 0.28);
          margin-bottom: 24px;
          transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
        }

        .btn-login:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 10px 30px rgba(255, 100, 0, 0.38);
        }

        .btn-login:active:not(:disabled) {
          transform: translateY(0);
        }

        .btn-login:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .login-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }

        .login-divider hr {
          flex: 1;
          border: none;
          border-top: 1px solid #f0f0f0;
        }

        .login-divider span {
          font-size: 0.72rem;
          color: #ccc;
        }

        .btn-google-login {
          width: 100%;
          background: #fff;
          border: 1.5px solid #ececec;
          border-radius: 50px;
          padding: 13px;
          font-size: 0.83rem;
          font-family: 'Sora', sans-serif;
          color: #555;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 28px;
          transition: background 0.15s, border-color 0.2s;
        }

        .btn-google-login:hover {
          background: #fafafa;
          border-color: #e0e0e0;
        }

        .signup-redirect {
          text-align: center;
          font-size: 0.78rem;
          color: #aaa;
        }

        .signup-redirect span {
          color: #FF6400;
          cursor: pointer;
          font-weight: 600;
        }

        /* right side - orange panel */
        .login-right {
          width: 55%;
          background: #FF6400;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .login-right::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.12) 0%, transparent 50%),
            radial-gradient(circle at 20% 80%, rgba(0, 0, 0, 0.15) 0%, transparent 50%);
          pointer-events: none;
        }

        .grid-bg {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        .math-symbols {
          position: absolute;
          inset: 0;
          pointer-events: none;
          font-family: 'Space Mono', monospace;
          color: rgba(255, 255, 255, 0.15);
          font-weight: 700;
        }

        .sym { position: absolute; user-select: none; }
        .sym-1 { top: 10%; left: 8%; font-size: 2.8rem; }
        .sym-2 { top: 20%; right: 10%; font-size: 1.4rem; }
        .sym-3 { bottom: 18%; left: 12%; font-size: 1.8rem; }
        .sym-4 { bottom: 10%; right: 14%; font-size: 2.2rem; }
        .sym-5 { top: 45%; left: 5%; font-size: 1.2rem; }
        .sym-6 { top: 65%; right: 8%; font-size: 1.6rem; }

        .dashed-arc {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 320px;
          height: 320px;
          border-radius: 50%;
          border: 1.5px dashed rgba(255, 255, 255, 0.25);
        }

        .plane {
          position: absolute;
          top: 22%;
          right: 18%;
          font-size: 1.6rem;
          animation: drift 4s ease-in-out infinite;
        }

        @keyframes drift {
          0%, 100% { transform: translate(0, 0) rotate(-15deg); }
          50% { transform: translate(6px, -8px) rotate(-20deg); }
        }

        .illustration {
          position: relative;
          z-index: 2;
          text-align: center;
        }

        .books {
          position: relative;
          width: 140px;
          height: 120px;
          margin: 0 auto 16px;
        }

        .book {
          position: absolute;
          border-radius: 4px 8px 8px 4px;
          box-shadow: 3px 6px 16px rgba(0, 0, 0, 0.25);
        }

        .book-1 { width: 130px; height: 28px; background: #fff; bottom: 0; left: 0; }
        .book-2 { width: 118px; height: 26px; background: #0a0a0a; bottom: 28px; left: 6px; }
        .book-3 { width: 124px; height: 26px; background: #ffb347; bottom: 54px; left: 3px; }
        .book-4 { width: 110px; height: 24px; background: #fff; bottom: 80px; left: 8px; }

        .person {
          position: absolute;
          right: -10px;
          bottom: 90px;
          font-size: 3.2rem;
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        .tagline {
          color: rgba(255, 255, 255, 0.9);
          font-size: 1.15rem;
          font-weight: 600;
          letter-spacing: -0.01em;
          line-height: 1.4;
        }

        .tagline strong {
          color: #fff;
          font-weight: 700;
        }

        .tagline-sub {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.78rem;
          margin-top: 6px;
        }

        @media (max-width: 640px) {
          .login-card { flex-direction: column; }
          .login-left, .login-right { width: 100%; }
          .login-right { min-height: 220px; }
        }
      `}</style>

      <div className="login-page">
        <div className="login-card">

          {/* left side */}
          <div className="login-left">
            <div className="login-form-inner">

              {/* step 1 - pick a role */}
              {step === "role" && (
                <div className="step-enter">
                  <p className="role-heading">Welcome Back</p>
                  <p className="role-sub">How are you logging in today?</p>

                  <div className="role-cards">
                    <div className="role-card" onClick={() => handleRoleSelect("student")}>
                      <div className="role-icon">🎓</div>
                      <div>
                        <div className="role-card-title">I'm a Student</div>
                        <div className="role-card-desc">Access lessons, homework and track your progress</div>
                      </div>
                      <span className="role-arrow">→</span>
                    </div>

                    <div className="role-card" onClick={() => handleRoleSelect("tutor")}>
                      <div className="role-icon">📐</div>
                      <div>
                        <div className="role-card-title">I'm a Tutor</div>
                        <div className="role-card-desc">Manage learners, set homework and view reports</div>
                      </div>
                      <span className="role-arrow">→</span>
                    </div>
                  </div>

                  <p className="signup-redirect">
                    Don't have an account?{" "}
                    <span onClick={() => navigate("/signup")}>Sign Up</span>
                  </p>
                </div>
              )}

              {/* step 2 - login form */}
              {step === "form" && (
                <div className="step-enter">
                  <button className="back-btn" onClick={() => setStep("role")}>
                    ← Back
                  </button>

                  <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
                    <span className="role-badge">
                      {role === "student" ? "🎓 Student Login" : "📐 Tutor Login"}
                    </span>
                  </div>

                  <h1>Login</h1>
                  <p className="subtitle">Continue your math journey 🧮</p>

                  <form onSubmit={handleSubmit}>
                    <input
                      className="login-input"
                      type="email"
                      name="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                    <input
                      className="login-input"
                      type="password"
                      name="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />

                    <div className="forgot-link" onClick={() => navigate("/forgot-password")}>
                      Forgot Password?
                    </div>

                    <button className="btn-login" type="submit" disabled={loading}>
                      {loading ? "Logging in..." : "Login"}
                    </button>
                  </form>

                  <div className="login-divider">
                    <hr />
                    <span>or continue with</span>
                    <hr />
                  </div>

                  <button className="btn-google-login" type="button">
                    <span>G</span> Sign in with Google
                  </button>

                  <p className="signup-redirect">
                    Don't have an account?{" "}
                    <span onClick={() => navigate("/signup")}>Sign Up</span>
                  </p>
                </div>
              )}

            </div>
          </div>

          {/* right side - illustration */}
          <div className="login-right">
            <div className="grid-bg" />
            <div className="dashed-arc" />

            <div className="math-symbols">
              <span className="sym sym-1">∑</span>
              <span className="sym sym-2">π</span>
              <span className="sym sym-3">∫</span>
              <span className="sym sym-4">√</span>
              <span className="sym sym-5">×</span>
              <span className="sym sym-6">∞</span>
            </div>

            <div className="plane">✈</div>

            <div className="illustration">
              <div className="books">
                <div className="book book-1" />
                <div className="book book-2" />
                <div className="book book-3" />
                <div className="book book-4" />
                <div className="person">🧑‍🎓</div>
              </div>
              <div className="tagline">
                Master <strong>Math</strong><br />One Step at a Time
              </div>
              <div className="tagline-sub">
                Smart lessons · Instant feedback · Real progress
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default Login;