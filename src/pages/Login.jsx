import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "../styles/login.css";

import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [step, setStep] = useState("role");
  const [role, setRole] = useState(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setStep("form");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const result = await login({
        email: formData.email,
        password: formData.password,
        expectedRole: role,
      });

      if (!result.success) {
        toast.error(result.error || "Login failed");
        setLoading(false);
        return;
      }

      toast.success("Login successful");

      // 🔥 STUDENT
      if (result.role === "student") {
        navigate("/student-dashboard");
      }

      // 🔥 TUTOR + ADMIN
      else if (result.role === "tutor" || result.role === "admin") {
        navigate("/tutor-dashboard");
      }

      setLoading(false);
    } catch (error) {
      console.log(error);

      toast.error("Login failed");

      setLoading(false);
    }
  };

  return (
    <>

      <div className="login-page">
        <div className="login-card">
          {/* LEFT */}
          <div className="login-left">
            <div className="login-form-inner">
              {step === "role" && (
                <div className="step-enter">
                  <p className="role-heading">Welcome Back</p>

                  <p className="role-sub">How are you logging in today?</p>

                  <div className="role-cards">
                    <div
                      className="role-card"
                      onClick={() => handleRoleSelect("student")}
                    >
                      <div className="role-icon">🎓</div>

                      <div>
                        <div className="role-card-title">I'm a Student</div>

                        <div className="role-card-desc">
                          Access lessons, homework and track your progress
                        </div>
                      </div>

                      <span className="role-arrow">→</span>
                    </div>

                    <div
                      className="role-card"
                      onClick={() => handleRoleSelect("tutor")}
                    >
                      <div className="role-icon">📐</div>

                      <div>
                        <div className="role-card-title">I'm a Tutor</div>

                        <div className="role-card-desc">
                          Manage learners, set homework and view reports
                        </div>
                      </div>

                      <span className="role-arrow">→</span>
                    </div>
                  </div>
                </div>
              )}

              {step === "form" && (
                <div className="step-enter">
                  <button className="back-btn" onClick={() => setStep("role")}>
                    ← Back
                  </button>

                 <div className="role-badge-wrapper">
                    <span className="role-badge">
                      {role === "student"
                        ? "🎓 Student Login"
                        : "📐 Tutor Login"}
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

                    <div
                      className="forgot-link"
                      onClick={() => navigate("/forgot-password")}
                    >
                      Forgot Password?
                    </div>

                    <button
                      className="btn-login"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? "Logging in..." : "Login"}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="login-right">
            <div className="grid-bg" />

            <div className="math-symbols">
              <span className="sym sym-1">∑</span>
              <span className="sym sym-2">π</span>
              <span className="sym sym-3">∫</span>
              <span className="sym sym-4">√</span>
              <span className="sym sym-5">×</span>
              <span className="sym sym-6">∞</span>
            </div>

            <div className="illustration">
              <img src="/Thesis-pana.svg" alt="Student studying" />

              <div className="tagline">
                Master <strong>Math</strong>
                <br />
                One Step at a Time
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
