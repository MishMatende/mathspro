import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');

        .fp-page {
          min-height: 100vh;
          display: flex;
          font-family: 'Sora', sans-serif;
        }

        /* ── LEFT PANEL ── */
        .fp-left {
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

        .fp-left::before {
          content: '';
          position: absolute;
          top: -60px; left: -60px;
          width: 160px; height: 160px;
          border-radius: 50%;
          border: 2px solid rgba(255,100,0,0.08);
          pointer-events: none;
        }

        .fp-left::after {
          content: '';
          position: absolute;
          bottom: -50px; right: -50px;
          width: 120px; height: 120px;
          border-radius: 50%;
          border: 2px solid rgba(255,100,0,0.06);
          pointer-events: none;
        }

        .fp-inner {
          width: 100%;
          max-width: 340px;
        }

        /* ── STEP ANIMATION ── */
        .step-enter {
          animation: stepIn 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        @keyframes stepIn {
          from { opacity: 0; transform: translateX(24px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        /* ── BACK BUTTON ── */
        .back-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.78rem;
          color: #aaa;
          cursor: pointer;
          margin-bottom: 36px;
          width: fit-content;
          transition: color 0.15s;
          background: none;
          border: none;
          font-family: 'Sora', sans-serif;
          padding: 0;
        }

        .back-btn:hover { color: #FF6400; }

        /* ── ICON RING ── */
        .fp-icon-ring {
          width: 64px;
          height: 64px;
          border-radius: 18px;
          background: rgba(255,100,0,0.08);
          border: 1.5px solid rgba(255,100,0,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
          margin: 0 auto 24px;
        }

        /* ── HEADINGS ── */
        .fp-heading {
          font-size: 1.85rem;
          font-weight: 700;
          color: #0a0a0a;
          margin-bottom: 8px;
          letter-spacing: -0.03em;
          text-align: center;
        }

        .fp-sub {
          font-size: 0.82rem;
          color: #aaa;
          margin-bottom: 36px;
          text-align: center;
          line-height: 1.6;
        }

        .fp-sub span {
          color: #0a0a0a;
          font-weight: 500;
        }

        /* ── INPUT ── */
        .fp-input {
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

        .fp-input:focus {
          border-color: #FF6400;
          box-shadow: 0 0 0 3px rgba(255,100,0,0.08);
          background: #fff;
        }

        .fp-input::placeholder { color: #ccc; }

        /* ── BUTTON ── */
        .fp-btn {
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
          transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
          box-shadow: 0 6px 24px rgba(255,100,0,0.28);
          margin-bottom: 20px;
        }

        .fp-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 10px 30px rgba(255,100,0,0.38);
        }

        .fp-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        /* ── SUCCESS STATE ── */
        .fp-success-ring {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: rgba(255,100,0,0.08);
          border: 1.5px solid rgba(255,100,0,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          margin: 0 auto 28px;
          animation: popIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        @keyframes popIn {
          from { opacity: 0; transform: scale(0.7); }
          to   { opacity: 1; transform: scale(1); }
        }

        .fp-check-list {
          list-style: none;
          padding: 0;
          margin: 0 0 32px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .fp-check-list li {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.8rem;
          color: #aaa;
        }

        .fp-check-list li::before {
          content: '';
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: rgba(255,100,0,0.08);
          border: 1px solid rgba(255,100,0,0.2);
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'%3E%3Cpath d='M2 6l3 3 5-5' stroke='%23FF6400' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          background-size: 10px;
          background-repeat: no-repeat;
          background-position: center;
        }

        /* ── RESEND ── */
        .resend-row {
          text-align: center;
          font-size: 0.78rem;
          color: #aaa;
          margin-bottom: 16px;
        }

        .resend-row span {
          color: #FF6400;
          cursor: pointer;
          font-weight: 600;
        }

        .resend-row span:hover { text-decoration: underline; }

        /* ── FOOTER LINK ── */
        .fp-footer {
          text-align: center;
          font-size: 0.78rem;
          color: #aaa;
        }

        .fp-footer span {
          color: #FF6400;
          cursor: pointer;
          font-weight: 600;
        }

        /* ── RIGHT PANEL ── */
        .fp-right {
          width: 55%;
          background: #FF6400;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .fp-right::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            radial-gradient(circle at 80% 20%, rgba(255,255,255,0.12) 0%, transparent 50%),
            radial-gradient(circle at 20% 80%, rgba(0,0,0,0.15) 0%, transparent 50%);
          pointer-events: none;
        }

        .fp-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        .fp-math {
          position: absolute; inset: 0;
          pointer-events: none;
          font-family: 'Space Mono', monospace;
          color: rgba(255,255,255,0.15);
          font-weight: 700;
        }

        .fp-sym { position: absolute; user-select: none; }
        .fp-s1 { top: 10%; left: 8%; font-size: 2.8rem; }
        .fp-s2 { top: 20%; right: 10%; font-size: 1.4rem; }
        .fp-s3 { bottom: 18%; left: 12%; font-size: 1.8rem; }
        .fp-s4 { bottom: 10%; right: 14%; font-size: 2.2rem; }
        .fp-s5 { top: 45%; left: 5%; font-size: 1.2rem; }
        .fp-s6 { top: 65%; right: 8%; font-size: 1.6rem; }

        .fp-arc {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 320px; height: 320px;
          border-radius: 50%;
          border: 1.5px dashed rgba(255,255,255,0.25);
        }

        .fp-illus {
          position: relative;
          z-index: 2;
          text-align: center;
        }

        .fp-envelope {
          font-size: 5rem;
          margin-bottom: 24px;
          display: block;
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .fp-illus-heading {
          color: #fff;
          font-size: 1.15rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1.4;
          margin-bottom: 8px;
        }

        .fp-illus-sub {
          color: rgba(255,255,255,0.6);
          font-size: 0.78rem;
          line-height: 1.6;
        }

        @media (max-width: 640px) {
          .fp-page { flex-direction: column; }
          .fp-left, .fp-right { width: 100%; }
          .fp-right { min-height: 220px; }
          .fp-left { padding: 48px 32px; }
        }
      `}</style>

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