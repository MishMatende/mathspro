import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const DiagnosticForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    age: "",
    guardianPhone: "",
    address: "",
    grade: "",
    curriculum: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Diagnostic Form Data:", formData);

      setTimeout(() => {
        setLoading(false);
        navigate("/diagnostic/test");
      }, 1000);
    } catch (error) {
      setLoading(false);
      alert("Something went wrong. Please try again.");
    }
  };

  const kenyanCurriculums = [
    { value: "cbc", label: "CBC — Competency Based Curriculum" },
    { value: "igcse", label: "IGCSE — Cambridge International" },
    { value: "ib", label: "IB — International Baccalaureate" },
    { value: "american", label: "American Curriculum" },
    { value: "british", label: "British National Curriculum" },
    { value: "kenya-national", label: "Kenya National Curriculum (8-4-4)" },
  ];

  const grades = [
    "Grade 1", "Grade 2", "Grade 3", "Grade 4",
    "Grade 5", "Grade 6", "Grade 7", "Grade 8",
    "Grade 9", "Form 1", "Form 2", "Form 3", "Form 4",
    "Year 7", "Year 8", "Year 9", "Year 10", "Year 11", "Year 12",
    "Other",
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap');

        .diag-page {
          min-height: 100vh;
          display: flex;
          font-family: 'Sora', sans-serif;
        }

        /* left panel - form */
        .diag-left {
          width: 55%;
          background: #fff;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 60px 64px;
          position: relative;
          overflow: hidden;
        }

        .diag-left::before {
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

        .diag-left::after {
          content: '';
          position: absolute;
          bottom: -50px;
          right: -50px;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          border: 2px solid rgba(255, 100, 0, 0.06);
          pointer-events: none;
        }

        .diag-form-inner {
          width: 100%;
          max-width: 480px;
        }

        /* step badge */
        .diag-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 100, 0, 0.08);
          color: #FF6400;
          border-radius: 50px;
          padding: 5px 14px;
          font-size: 0.72rem;
          font-weight: 600;
          margin-bottom: 20px;
          letter-spacing: 0.02em;
        }

        .diag-heading {
          font-size: 1.75rem;
          font-weight: 700;
          color: #0a0a0a;
          letter-spacing: -0.03em;
          margin-bottom: 6px;
        }

        .diag-sub {
          font-size: 0.82rem;
          color: #aaa;
          margin-bottom: 32px;
          line-height: 1.6;
        }

        /* input styles */
        .diag-input {
          width: 100%;
          border: 1.5px solid #ececec;
          border-radius: 12px;
          padding: 13px 16px;
          font-size: 0.85rem;
          font-family: 'Sora', sans-serif;
          color: #0a0a0a;
          background: #fafafa;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          appearance: none;
          width: 100%;
        }

        .diag-input:focus {
          border-color: #FF6400;
          box-shadow: 0 0 0 3px rgba(255, 100, 0, 0.08);
          background: #fff;
        }

        .diag-input::placeholder { color: #ccc; }
        .diag-input.placeholder-color { color: #ccc; }

        .input-wrap { margin-bottom: 12px; }

        .input-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 500;
          color: #888;
          margin-bottom: 5px;
        }

        /* two column row */
        .row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        /* submit button */
        .diag-btn {
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
          margin-top: 8px;
        }

        .diag-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 10px 30px rgba(255, 100, 0, 0.38);
        }

        .diag-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* right panel */
        .diag-right {
          width: 45%;
          background: #FF6400;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          padding: 60px 48px;
        }

        .diag-right::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.12) 0%, transparent 50%),
            radial-gradient(circle at 20% 80%, rgba(0, 0, 0, 0.1) 0%, transparent 50%);
          pointer-events: none;
        }

        .diag-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        /* math symbols */
        .diag-math {
          position: absolute;
          inset: 0;
          pointer-events: none;
          font-family: 'Space Mono', monospace;
          color: rgba(255, 255, 255, 0.12);
          font-weight: 700;
        }

        .d-sym { position: absolute; user-select: none; }
        .d-s1 { top: 8%; left: 10%; font-size: 2.8rem; }
        .d-s2 { top: 20%; right: 8%; font-size: 1.4rem; }
        .d-s3 { bottom: 20%; left: 10%; font-size: 1.8rem; }
        .d-s4 { bottom: 10%; right: 12%; font-size: 2.2rem; }
        .d-s5 { top: 48%; left: 6%; font-size: 1.2rem; }
        .d-s6 { top: 65%; right: 8%; font-size: 1.6rem; }

        /* right panel content */
        .diag-right-content {
          position: relative;
          z-index: 2;
          text-align: center;
        }

        .diag-right-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.15);
          border: 1.5px solid rgba(255, 255, 255, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.2rem;
          margin: 0 auto 28px;
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        .diag-right-heading {
          color: #fff;
          font-size: 1.3rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1.4;
          margin-bottom: 12px;
        }

        .diag-right-sub {
          color: rgba(255, 255, 255, 0.65);
          font-size: 0.8rem;
          line-height: 1.7;
          margin-bottom: 36px;
        }

        /* info checklist */
        .diag-checklist {
          display: flex;
          flex-direction: column;
          gap: 12px;
          text-align: left;
        }

        .diag-check-item {
          display: flex;
          align-items: center;
          gap: 12px;
          color: rgba(255, 255, 255, 0.85);
          font-size: 0.8rem;
        }

        .check-dot {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 0.7rem;
        }

        /* responsive */
        @media (max-width: 768px) {
          .diag-page {
            flex-direction: column;
          }

          .diag-left {
            width: 100%;
            padding: 48px 24px;
          }

          .diag-right {
            width: 100%;
            padding: 48px 24px;
            min-height: 320px;
          }

          .row-2 {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .diag-heading { font-size: 1.4rem; }
          .diag-left { padding: 36px 20px; }
        }
      `}</style>

      <div className="diag-page">

        {/* left - form */}
        <div className="diag-left">
          <div className="diag-form-inner">

            <div className="diag-badge">📋 Step 1 of 2</div>

            <h1 className="diag-heading">Student Details</h1>
            <p className="diag-sub">
              Fill in the details below before starting your diagnostic test.
              This helps us personalise your experience.
            </p>

            <form onSubmit={handleSubmit}>

              {/* name row */}
              <div className="row-2">
                <div className="input-wrap">
                  <label className="input-label">First Name</label>
                  <input
                    className="diag-input"
                    type="text"
                    name="firstName"
                    placeholder="e.g. Amara"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="input-wrap">
                  <label className="input-label">Last Name</label>
                  <input
                    className="diag-input"
                    type="text"
                    name="lastName"
                    placeholder="e.g. Odhiambo"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* phone + age */}
              <div className="row-2">
                <div className="input-wrap">
                  <label className="input-label">Phone Number</label>
                  <input
                    className="diag-input"
                    type="tel"
                    name="phone"
                    placeholder="+254 700 000 000"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="input-wrap">
                  <label className="input-label">Age</label>
                  <input
                    className="diag-input"
                    type="number"
                    name="age"
                    placeholder="e.g. 14"
                    min="4"
                    max="25"
                    value={formData.age}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* guardian phone */}
              <div className="input-wrap">
                <label className="input-label">Parent / Guardian Phone Number</label>
                <input
                  className="diag-input"
                  type="tel"
                  name="guardianPhone"
                  placeholder="+254 700 000 000"
                  value={formData.guardianPhone}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* address */}
              <div className="input-wrap">
                <label className="input-label">Home Address</label>
                <input
                  className="diag-input"
                  type="text"
                  name="address"
                  placeholder="e.g. Westlands, Nairobi"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* grade + curriculum */}
              <div className="row-2">
                <div className="input-wrap">
                  <label className="input-label">Grade / Year</label>
                  <select
                    className={`diag-input ${!formData.grade ? "placeholder-color" : ""}`}
                    name="grade"
                    value={formData.grade}
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled>Select grade</option>
                    {grades.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div className="input-wrap">
                  <label className="input-label">Curriculum</label>
                  <select
                    className={`diag-input ${!formData.curriculum ? "placeholder-color" : ""}`}
                    name="curriculum"
                    value={formData.curriculum}
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled>Select curriculum</option>
                    {kenyanCurriculums.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button className="diag-btn" type="submit" disabled={loading}>
{loading ? "Saving..." : "Continue to Diagnostic Test &#8594;"}              </button>

            </form>

          </div>
        </div>

        {/* right - info panel */}
        <div className="diag-right">
          <div className="diag-grid" />

          <div className="diag-math">
            <span className="d-sym d-s1">∑</span>
            <span className="d-sym d-s2">π</span>
            <span className="d-sym d-s3">∫</span>
            <span className="d-sym d-s4">√</span>
            <span className="d-sym d-s5">×</span>
            <span className="d-sym d-s6">∞</span>
          </div>

          <div className="diag-right-content">
            <div className="diag-right-icon">📝</div>

            <div className="diag-right-heading">
              What happens<br />after this?
            </div>
            <div className="diag-right-sub">
              Your details help us match you with<br />
              the right tutor and build a learning<br />
              plan just for you.
            </div>

            <div className="diag-checklist">
              <div className="diag-check-item">
                <div className="check-dot">✓</div>
                <span>Short diagnostic test — about 15 mins</span>
              </div>
              <div className="diag-check-item">
                <div className="check-dot">✓</div>
                <span>We identify your strengths and gaps</span>
              </div>
              <div className="diag-check-item">
                <div className="check-dot">✓</div>
                <span>A personalised learning plan is created</span>
              </div>
              <div className="diag-check-item">
                <div className="check-dot">✓</div>
                <span>Get matched with the right tutor</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default DiagnosticForm;