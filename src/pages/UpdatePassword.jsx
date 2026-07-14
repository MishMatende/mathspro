import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function UpdatePassword() {
  const navigate = useNavigate();
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Recovery event:", event);

      if (event === "PASSWORD_RECOVERY") {
        return;
      }

      if (event === "SIGNED_OUT") {
        toast.error("Password reset link has expired.");
        navigate("/forgot-password");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");

      return;
    }

    setLoading(true);

    try {
      const result = await updatePassword(password);

      setLoading(false);

      if (!result.success) {
        toast.error(result.error || "Failed to update password");

        return;
      }

      toast.success("Password updated successfully");

      setSuccess(true);

      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } catch (err) {
      console.log(err);

      setLoading(false);

      toast.error("Something went wrong");
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');

        .up-page {
          min-height: 100vh;
          display: flex;
          font-family: 'Sora', sans-serif;
          background: #fff;
        }

        /* ── LEFT PANEL ── */
        .up-left {
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

        .up-left::before {
          content: '';
          position: absolute;
          top: -60px;
          left: -60px;
          width: 160px;
          height: 160px;
          border-radius: 50%;
          border: 2px solid rgba(255,100,0,0.08);
          pointer-events: none;
        }

        .up-left::after {
          content: '';
          position: absolute;
          bottom: -50px;
          right: -50px;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          border: 2px solid rgba(255,100,0,0.06);
          pointer-events: none;
        }

        .up-inner {
          width: 100%;
          max-width: 360px;
        }

        /* ── ANIMATION ── */
        .up-enter {
          animation: slideIn 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(24px);
          }

          to {
            opacity: 1;
            transform: translateX(0);
          }
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

        .back-btn:hover {
          color: #FF6400;
        }

        /* ── ICON ── */
        .up-icon-ring {
          width: 68px;
          height: 68px;
          border-radius: 18px;
          background: rgba(255,100,0,0.08);
          border: 1.5px solid rgba(255,100,0,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.9rem;
          margin: 0 auto 24px;
        }

        /* ── TEXT ── */
        .up-heading {
          font-size: 1.9rem;
          font-weight: 700;
          color: #0a0a0a;
          margin-bottom: 10px;
          letter-spacing: -0.03em;
          text-align: center;
        }

        .up-sub {
          font-size: 0.84rem;
          color: #aaa;
          margin-bottom: 34px;
          text-align: center;
          line-height: 1.7;
        }

        /* ── PASSWORD WRAP ── */
        .up-password-wrap {
          position: relative;
          margin-bottom: 12px;
        }

        .up-input {
          width: 100%;
          border: 1.5px solid #ececec;
          border-radius: 14px;
          padding: 15px 50px 15px 18px;
          font-size: 0.86rem;
          font-family: 'Sora', sans-serif;
          color: #0a0a0a;
          background: #fafafa;
          outline: none;
          transition:
            border-color 0.2s,
            box-shadow 0.2s,
            background 0.2s;
          box-sizing: border-box;
        }

        .up-input:focus {
          border-color: #FF6400;
          box-shadow: 0 0 0 3px rgba(255,100,0,0.08);
          background: #fff;
        }

        .up-input::placeholder {
          color: #c9c9c9;
        }

        .up-toggle {
          position: absolute;
          top: 50%;
          right: 16px;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #999;
          font-size: 0.8rem;
          font-weight: 600;
          font-family: 'Sora', sans-serif;
        }

        .up-toggle:hover {
          color: #FF6400;
        }

        /* ── PASSWORD HINT ── */
        .up-hint {
          font-size: 0.72rem;
          color: #b1b1b1;
          margin-bottom: 22px;
          padding-left: 2px;
        }

        /* ── BUTTON ── */
        .up-btn {
          width: 100%;
          background: #FF6400;
          color: #fff;
          border: none;
          border-radius: 999px;
          padding: 15px;
          font-size: 0.9rem;
          font-weight: 600;
          font-family: 'Sora', sans-serif;
          cursor: pointer;
          letter-spacing: 0.02em;
          transition:
            transform 0.15s,
            box-shadow 0.15s,
            opacity 0.15s;
          box-shadow: 0 6px 24px rgba(255,100,0,0.28);
        }

        .up-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 10px 30px rgba(255,100,0,0.38);
        }

        .up-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* ── SUCCESS ── */
        .up-success-ring {
          width: 76px;
          height: 76px;
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
          from {
            opacity: 0;
            transform: scale(0.7);
          }

          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .up-check-list {
          list-style: none;
          padding: 0;
          margin: 0 0 28px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .up-check-list li {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.8rem;
          color: #aaa;
        }

        .up-check-list li::before {
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

        /* ── RIGHT PANEL ── */
        .up-right {
          width: 55%;
          background: #FF6400;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .up-right::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            radial-gradient(circle at 80% 20%, rgba(255,255,255,0.12) 0%, transparent 50%),
            radial-gradient(circle at 20% 80%, rgba(0,0,0,0.15) 0%, transparent 50%);
          pointer-events: none;
        }

        .up-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        .up-arc {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 320px;
          height: 320px;
          border-radius: 50%;
          border: 1.5px dashed rgba(255,255,255,0.25);
        }

        .up-math {
          position: absolute;
          inset: 0;
          pointer-events: none;
          font-family: 'Space Mono', monospace;
          color: rgba(255,255,255,0.15);
          font-weight: 700;
        }

        .up-sym {
          position: absolute;
          user-select: none;
        }

        .up-s1 { top: 10%; left: 8%; font-size: 2.8rem; }
        .up-s2 { top: 20%; right: 10%; font-size: 1.4rem; }
        .up-s3 { bottom: 18%; left: 12%; font-size: 1.8rem; }
        .up-s4 { bottom: 10%; right: 14%; font-size: 2.2rem; }
        .up-s5 { top: 45%; left: 5%; font-size: 1.2rem; }
        .up-s6 { top: 65%; right: 8%; font-size: 1.6rem; }

        .up-illus {
          position: relative;
          z-index: 2;
          text-align: center;
        }

        .up-lock {
          font-size: 5rem;
          margin-bottom: 24px;
          display: block;
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-10px);
          }
        }

        .up-illus-heading {
          color: #fff;
          font-size: 1.15rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1.4;
          margin-bottom: 8px;
        }

        .up-illus-sub {
          color: rgba(255,255,255,0.65);
          font-size: 0.78rem;
          line-height: 1.6;
        }

        @media (max-width: 640px) {
  .up-page {
    flex-direction: column;
    background: #f8f8f8;
  }

  /* HERO SECTION */
  .up-right {
    width: 100%;
    min-height: 180px;
    max-height: 180px;
    order: -1;
    border-bottom-left-radius: 28px;
    border-bottom-right-radius: 28px;
    overflow: hidden;
  }

  .up-grid {
    opacity: 0.4;
  }

  .up-arc {
    width: 220px;
    height: 220px;
  }

  .up-lock {
    font-size: 3.2rem;
    margin-bottom: 14px;
  }

  .up-illus-heading {
    font-size: 1.55rem;
    line-height: 1.25;
    padding: 0 20px;
  }

  .up-illus-sub {
    font-size: 0.82rem;
    line-height: 1.5;
    padding: 0 32px;
  }

  /* FORM SECTION */
  .up-left {
    width: 100%;
    padding: 0 20px 32px;
    margin-top: -26px;
    position: relative;
    z-index: 5;
    background: transparent;
  }

  .up-inner {
    width: 100%;
    max-width: 100%;
    background: #fff;
    border-radius: 28px;
    padding: 28px 22px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.06);
  }

  .back-btn {
    margin-bottom: 26px;
    font-size: 0.82rem;
  }

  .up-icon-ring {
    width: 58px;
    height: 58px;
    border-radius: 16px;
    font-size: 1.5rem;
    margin-bottom: 18px;
  }

  .up-heading {
    font-size: 2rem;
    line-height: 1.15;
    margin-bottom: 12px;
  }

  .up-sub {
    font-size: 0.9rem;
    line-height: 1.7;
    margin-bottom: 28px;
  }

  .up-input {
    height: 54px;
    font-size: 0.95rem;
    border-radius: 16px;
    padding: 0 52px 0 16px;
    background: #fafafa;
  }

  .up-toggle {
    right: 14px;
    font-size: 0.82rem;
  }

  .up-hint {
    font-size: 0.78rem;
    margin-bottom: 24px;
    line-height: 1.5;
  }

  .up-btn {
    height: 54px;
    border-radius: 18px;
    font-size: 0.95rem;
    box-shadow: 0 8px 24px rgba(255,100,0,0.24);
  }

  /* SUCCESS */
  .up-success-ring {
    width: 68px;
    height: 68px;
    font-size: 1.7rem;
    margin-bottom: 22px;
  }

  .up-check-list li {
    font-size: 0.82rem;
    line-height: 1.5;
  }

  /* REMOVE EXTRA DECORATION */
  .up-left::before,
  .up-left::after,
  .up-math {
    display: none;
  }
}
      `}</style>

      <div className="up-page">
        {/* LEFT */}
        <div className="up-left">
          <div className="up-inner">
            {!success ? (
              <div className="up-enter">
                <button className="back-btn" onClick={() => navigate("/login")}>
                  ← Back to Login
                </button>

                <div className="up-icon-ring">🔒</div>

                <h1 className="up-heading">Create New Password</h1>

                <p className="up-sub">
                  Your new password should be secure and easy for you to
                  remember.
                </p>

                <form onSubmit={handleSubmit}>
                  <div className="up-password-wrap">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="up-input"
                      required
                    />

                    <button
                      type="button"
                      className="up-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>

                  <div className="up-hint">
                    Use at least 6 characters for a stronger password.
                  </div>

                  <button disabled={loading} type="submit" className="up-btn">
                    {loading ? "Updating..." : "Update Password"}
                  </button>
                </form>
              </div>
            ) : (
              <div className="up-enter">
                <div className="up-success-ring">✅</div>

                <h1 className="up-heading">Password Updated</h1>

                <p className="up-sub">
                  Your password has been changed successfully. You can now log
                  in with your new credentials.
                </p>

                <ul className="up-check-list">
                  <li>Your account is now secure</li>
                  <li>Use your new password on your next login</li>
                  <li>Redirecting you to login shortly</li>
                </ul>

                <button className="up-btn" onClick={() => navigate("/login")}>
                  Continue to Login
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="up-right">
          <div className="up-grid" />

          <div className="up-arc" />

          <div className="up-math">
            <span className="up-sym up-s1">∑</span>
            <span className="up-sym up-s2">π</span>
            <span className="up-sym up-s3">∫</span>
            <span className="up-sym up-s4">√</span>
            <span className="up-sym up-s5">×</span>
            <span className="up-sym up-s6">∞</span>
          </div>

          <div className="up-illus">
            <span className="up-lock">🔐</span>

            <div className="up-illus-heading">
              Secure your account
              <br />
              with a fresh password
            </div>

            <div className="up-illus-sub">
              Your new password keeps your
              <br />
              account protected and safe
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
