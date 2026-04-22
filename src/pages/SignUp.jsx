import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    level: "",
    password: "",
    agreed: false,
  });
  const [loading, setLoading] = useState(false);
  const [pwStrength, setPwStrength] = useState(0);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
    if (name === "password") updateStrength(value);
  };

  const updateStrength = (val) => {
    let score = 0;
    if (val.length >= 6) score++;
    if (val.length >= 10) score++;
    if (/[A-Z]/.test(val) && /[0-9]/.test(val)) score++;
    if (/[^a-zA-Z0-9]/.test(val)) score++;
    setPwStrength(score);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.agreed) {
      alert("Please accept the terms to continue.");
      return;
    }

    setLoading(true);

    try {
      console.log("Signup Data:", formData);

      setTimeout(() => {
        setLoading(false);
        navigate("/dashboard");
      }, 1000);
    } catch (error) {
      setLoading(false);
      alert("Signup failed");
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Space+Mono:wght@700&display=swap');

        .signup-page {
          min-height: 100vh;
          display: flex;
          font-family: 'Sora', sans-serif;
        }

        .signup-card {
          display: flex;
          width: 100%;
          min-height: 100vh;
        }

        /* left side - dark illustration panel */
        .signup-illus {
          width: 42%;
          background: #0a0a0a;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          padding: 40px 36px;
        }

        .signup-illus::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 30% 40%, rgba(255, 100, 0, 0.18) 0%, transparent 60%),
            radial-gradient(circle at 80% 80%, rgba(255, 100, 0, 0.08) 0%, transparent 50%);
          pointer-events: none;
        }

        .signup-grid-bg {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255, 100, 0, 0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 100, 0, 0.06) 1px, transparent 1px);
          background-size: 36px 36px;
        }

        /* floating math symbols */
        .signup-math-syms {
          position: absolute;
          inset: 0;
          pointer-events: none;
          font-family: 'Space Mono', monospace;
        }

        .signup-sym { position: absolute; user-select: none; font-weight: 700; }
        .ss1 { top: 8%; left: 10%; font-size: 2.4rem; color: rgba(255, 100, 0, 0.15); }
        .ss2 { top: 18%; right: 8%; font-size: 1.3rem; color: rgba(255, 255, 255, 0.08); }
        .ss3 { bottom: 22%; left: 8%; font-size: 1.6rem; color: rgba(255, 255, 255, 0.08); }
        .ss4 { bottom: 12%; right: 10%; font-size: 2rem; color: rgba(255, 100, 0, 0.15); }
        .ss5 { top: 50%; left: 6%; font-size: 1.1rem; color: rgba(255, 255, 255, 0.07); }
        .ss6 { top: 68%; right: 6%; font-size: 1.4rem; color: rgba(255, 100, 0, 0.15); }

        /* orbit rings */
        .signup-orbit {
          position: absolute;
          border-radius: 50%;
          border: 1px dashed rgba(255, 100, 0, 0.2);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .so1 { width: 200px; height: 200px; }
        .so2 { width: 310px; height: 310px; border-color: rgba(255, 100, 0, 0.1); }

        .orbit-dot {
          position: absolute;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #FF6400;
          top: -5px;
          left: 50%;
          transform: translateX(-50%);
          box-shadow: 0 0 10px rgba(255, 100, 0, 0.5);
        }

        .orbit-dot2 {
          position: absolute;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #fff;
          bottom: -4px;
          right: 20%;
          opacity: 0.4;
        }

        .icon-ring {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          background: rgba(255, 100, 0, 0.12);
          border: 1.5px solid rgba(255, 100, 0, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          font-size: 2.4rem;
          position: relative;
          z-index: 2;
          animation: pulse 3s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255, 100, 0, 0.2); }
          50% { box-shadow: 0 0 0 12px rgba(255, 100, 0, 0); }
        }

        .illus-heading {
          color: #fff;
          font-size: 1.2rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1.35;
          text-align: center;
          margin-bottom: 8px;
          position: relative;
          z-index: 2;
        }

        .illus-heading span { color: #FF6400; }

        .illus-sub {
          color: rgba(255, 255, 255, 0.4);
          font-size: 0.75rem;
          text-align: center;
          line-height: 1.6;
          position: relative;
          z-index: 2;
        }

        .stats-row {
          display: flex;
          gap: 10px;
          margin-top: 28px;
          position: relative;
          z-index: 2;
        }

        .stat-pill {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 50px;
          padding: 7px 14px;
          text-align: center;
        }

        .stat-pill .num {
          color: #FF6400;
          font-size: 0.9rem;
          font-weight: 700;
          display: block;
        }

        .stat-pill .lbl {
          color: rgba(255, 255, 255, 0.4);
          font-size: 0.65rem;
        }

        /* right side - the form */
        .signup-form-panel {
          width: 58%;
          background: #fff;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 60px 64px;
          position: relative;
          overflow: hidden;
        }

        .signup-form-panel::after {
          content: '';
          position: absolute;
          bottom: -50px;
          right: -50px;
          width: 140px;
          height: 140px;
          border-radius: 50%;
          border: 2px solid rgba(255, 100, 0, 0.08);
          pointer-events: none;
        }

        .signup-form-inner {
          width: 100%;
          max-width: 400px;
        }

        .signup-form-panel h1 {
          font-size: 1.85rem;
          font-weight: 700;
          color: #0a0a0a;
          letter-spacing: -0.03em;
          margin-bottom: 8px;
          text-align: center;
        }

        .signup-form-panel .form-sub {
          font-size: 0.82rem;
          color: #aaa;
          margin-bottom: 32px;
          text-align: center;
        }

        .name-row {
          display: flex;
          gap: 12px;
        }

        .name-row .su-input-wrap { flex: 1; }

        .su-input-wrap { margin-bottom: 12px; }

        .su-input {
          width: 100%;
          border: 1.5px solid #ececec;
          border-radius: 12px;
          padding: 14px 18px;
          font-size: 0.85rem;
          font-family: 'Sora', sans-serif;
          color: #0a0a0a;
          background: #fafafa;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          appearance: none;
        }

        .su-input:focus {
          border-color: #FF6400;
          box-shadow: 0 0 0 3px rgba(255, 100, 0, 0.08);
          background: #fff;
        }

        .su-input::placeholder { color: #ccc; }
        .su-input.placeholder-color { color: #ccc; }

        /* password strength bar */
        .strength-bar {
          display: flex;
          gap: 4px;
          margin-top: 7px;
        }

        .strength-seg {
          height: 3px;
          flex: 1;
          border-radius: 4px;
          background: #eee;
          transition: background 0.2s;
        }

        .strength-seg.active { background: #FF6400; }

        .terms-row {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 0.75rem;
          color: #aaa;
          margin: 16px 0 20px;
          line-height: 1.6;
        }

        .terms-row input[type="checkbox"] {
          margin-top: 2px;
          accent-color: #FF6400;
          flex-shrink: 0;
        }

        .terms-row span {
          color: #FF6400;
          cursor: pointer;
        }

        .btn-signup-main {
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
          transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
          margin-bottom: 24px;
        }

        .btn-signup-main:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 10px 30px rgba(255, 100, 0, 0.38);
        }

        .btn-signup-main:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .divider-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }

        .divider-row hr {
          flex: 1;
          border: none;
          border-top: 1px solid #f0f0f0;
        }

        .divider-row span {
          font-size: 0.72rem;
          color: #ccc;
        }

        .btn-google {
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

        .btn-google:hover {
          background: #fafafa;
          border-color: #e0e0e0;
        }

        .login-redirect {
          text-align: center;
          font-size: 0.78rem;
          color: #aaa;
        }

        .login-redirect span {
          color: #FF6400;
          cursor: pointer;
          font-weight: 600;
        }

        @media (max-width: 640px) {
          .signup-card { flex-direction: column; }
          .signup-illus, .signup-form-panel { width: 100%; }
          .signup-illus { min-height: 200px; }
          .signup-form-panel { padding: 32px 24px; }
        }
      `}</style>

      <div className="signup-page">
        <div className="signup-card">

          {/* left side - illustration */}
          <div className="signup-illus">
            <div className="signup-grid-bg" />

            <div className="signup-orbit so1">
              <div className="orbit-dot" />
            </div>
            <div className="signup-orbit so2">
              <div className="orbit-dot2" />
            </div>

            <div className="signup-math-syms">
              <span className="signup-sym ss1">∑</span>
              <span className="signup-sym ss2">π</span>
              <span className="signup-sym ss3">∫</span>
              <span className="signup-sym ss4">√</span>
              <span className="signup-sym ss5">×</span>
              <span className="signup-sym ss6">∞</span>
            </div>

            <div className="icon-ring">🧮</div>
            <div className="illus-heading">
              Start your <span>math</span><br />journey today
            </div>
            <div className="illus-sub">
              Join thousands of students<br />mastering math with guidance.
            </div>

            <div className="stats-row">
              <div className="stat-pill">
                <span className="num">1k+</span>
                <span className="lbl">Students</span>
              </div>
              <div className="stat-pill">
                <span className="num">98%</span>
                <span className="lbl">Satisfaction</span>
              </div>
              <div className="stat-pill">
                <span className="num">500+</span>
                <span className="lbl">Lessons</span>
              </div>
            </div>
          </div>

          {/* right side - form */}
          <div className="signup-form-panel">
            <div className="signup-form-inner">
              <h1>Create Account</h1>
              <p className="form-sub">It's free — no credit card required</p>

              <form onSubmit={handleSubmit}>
                <div className="name-row">
                  <div className="su-input-wrap">
                    <input
                      className="su-input"
                      type="text"
                      name="firstName"
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="su-input-wrap">
                    <input
                      className="su-input"
                      type="text"
                      name="lastName"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="su-input-wrap">
                  <input
                    className="su-input"
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="su-input-wrap">
                  <select
                    className={`su-input ${!formData.level ? "placeholder-color" : ""}`}
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled>Your Math Level</option>
                    <option value="beginner">Beginner — Basic Arithmetic</option>
                    <option value="elementary">Elementary — Fractions & Algebra</option>
                    <option value="intermediate">Intermediate — Geometry & Trig</option>
                    <option value="advanced">Advanced — Calculus & Beyond</option>
                  </select>
                </div>

                <div className="su-input-wrap">
                  <input
                    className="su-input"
                    type="password"
                    name="password"
                    placeholder="Create a Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <div className="strength-bar">
                    {[0, 1, 2, 3].map(i => (
                      <div
                        key={i}
                        className={`strength-seg ${i < pwStrength ? "active" : ""}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="terms-row">
                  <input
                    type="checkbox"
                    name="agreed"
                    checked={formData.agreed}
                    onChange={handleChange}
                  />
                  By signing up, you agree to our{" "}
                  <span onClick={() => navigate("/terms")}>Terms of Service</span>
                  {" "}and{" "}
                  <span onClick={() => navigate("/privacy")}>Privacy Policy</span>
                </div>

                <button className="btn-signup-main" type="submit" disabled={loading}>
                  {loading ? "Creating Account..." : "Create My Account"}
                </button>
              </form>

              <div className="divider-row">
                <hr />
                <span>or continue with</span>
                <hr />
              </div>

              <button className="btn-google" type="button">
                <span>G</span> Sign up with Google
              </button>

              <p className="login-redirect">
                Already have an account?{" "}
                <span onClick={() => navigate("/login")}>Log In</span>
              </p>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default Signup;