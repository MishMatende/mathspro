import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/forgot.css";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState("email"); // "email" | "sent"
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log("Reset requested for:", email);
      setTimeout(() => {
        setLoading(false);
        setStep("sent");
      }, 1000);
    } catch {
      setLoading(false);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <>
     
      <div className="fp-page">

        {/* LEFT: Form */}
        <div className="fp-left">
          <div className="fp-inner">

            {/* STEP 1: Enter email */}
            {step === "email" && (
              <div className="step-enter">
                <button className="back-btn" onClick={() => navigate("/login")}>
                  ← Back to Login
                </button>

                <div className="fp-icon-ring">🔑</div>

                <h1 className="fp-heading">Forgot Password?</h1>
                <p className="fp-sub">
                  No worries — enter your email and we'll send you a reset link right away.
                </p>

                <form onSubmit={handleSubmit}>
                  <input
                    className="fp-input"
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <button className="fp-btn" type="submit" disabled={loading}>
                    {loading ? "Sending..." : "Send Reset Link"}
                  </button>
                </form>

                <p className="fp-footer">
                  Remembered it?{" "}
                  <span onClick={() => navigate("/login")}>Back to Login</span>
                </p>
              </div>
            )}

            {/* STEP 2: Email sent confirmation */}
            {step === "sent" && (
              <div className="step-enter">
                <div className="fp-success-ring">📬</div>

                <h1 className="fp-heading">Check your email</h1>
                <p className="fp-sub">
                  We sent a reset link to <span>{email}</span>. It expires in 15 minutes.
                </p>

                <ul className="fp-check-list">
                  <li>Check your inbox for the reset email</li>
                  <li>Click the link inside to reset your password</li>
                  <li>Check spam if you don't see it</li>
                </ul>

                <button className="fp-btn" onClick={() => navigate("/login")}>
                  Back to Login
                </button>

                <p className="resend-row">
                  Didn't receive it?{" "}
                  <span onClick={() => { setStep("email"); setEmail(""); }}>
                    Try again
                  </span>
                </p>
              </div>
            )}

          </div>
        </div>

        {/* RIGHT: Illustration */}
        <div className="fp-right">
          <div className="fp-grid" />
          <div className="fp-arc" />
          <div className="fp-math">
            <span className="fp-sym fp-s1">∑</span>
            <span className="fp-sym fp-s2">π</span>
            <span className="fp-sym fp-s3">∫</span>
            <span className="fp-sym fp-s4">√</span>
            <span className="fp-sym fp-s5">×</span>
            <span className="fp-sym fp-s6">∞</span>
          </div>
          <div className="fp-illus">
            <span className="fp-envelope">✉️</span>
            <div className="fp-illus-heading">Password reset<br />is just one click away</div>
            <div className="fp-illus-sub">We'll send a secure link straight<br />to your inbox</div>
          </div>
        </div>

      </div>
    </>
  );
};

export default ForgotPassword;