import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import "../styles/forgot.css";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState("email"); // "email" | "sent"
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { requestPasswordResetOtp, verifyPasswordResetOtp } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const result = await requestPasswordResetOtp(email);

      if (!result.success) {
        toast.error(result.error || "Failed to send reset email");

        setLoading(false);

        return;
      }

      toast.success("Verification code sent");

      setStep("sent");

      setLoading(false);
    } catch (err) {
      console.log(err);

      toast.error("Something went wrong");

      setLoading(false);
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();

    if (!/^\d{6,8}$/.test(code.trim())) {
      toast.error("Enter the verification code from your email");
      return;
    }

    setLoading(true);
    const result = await verifyPasswordResetOtp({
      email,
      token: code.trim(),
    });
    setLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    navigate("/update-password");
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
                  No worries — enter your email and we'll send you a one-time
                  verification code.
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
                    {loading ? "Sending..." : "Send Verification Code"}
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

                <h1 className="fp-heading">Enter your reset code</h1>
                <p className="fp-sub">
                  We sent a one-time code to <span>{email}</span>.
                </p>

                <form onSubmit={handleCodeSubmit}>
                  <input
                    className="fp-input"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="Enter verification code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    required
                  />
                  <button className="fp-btn" type="submit" disabled={loading}>
                    {loading ? "Verifying..." : "Verify Code"}
                  </button>
                </form>

                <p className="resend-row">
                  Didn't receive it?{" "}
                  <span
                    onClick={() => {
                      setStep("email");
                      setCode("");
                      setEmail("");
                    }}
                  >
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
            <div className="fp-illus-heading">
              Password reset
              <br />
              with a secure code
            </div>
            <div className="fp-illus-sub">
              We'll send a one-time code straight
              <br />
              to your inbox
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
