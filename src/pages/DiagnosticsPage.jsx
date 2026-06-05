import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/diagnostics.css";


export default function DiagnosticsPage() {
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
    "Grade 1",
    "Grade 2",
    "Grade 3",
    "Grade 4",
    "Grade 5",
    "Grade 6",
    "Grade 7",
    "Grade 8",
    "Grade 9",
    "Form 1",
    "Form 2",
    "Form 3",
    "Form 4",
    "Year 7",
    "Year 8",
    "Year 9",
    "Year 10",
    "Year 11",
    "Year 12",
    "Other",
  ];

  return (
    <>
      

      <div className="diag-page">
        <Navbar />
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
                <label className="input-label">
                  Parent / Guardian Phone Number
                </label>
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
                    <option value="" disabled>
                      Select grade
                    </option>
                    {grades.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
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
                    <option value="" disabled>
                      Select curriculum
                    </option>
                    {kenyanCurriculums.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button className="diag-btn" type="submit" disabled={loading}>
                {loading ? "Saving..." : "Continue to Diagnostic Test"}{" "}
              </button>
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
              What happens
              <br />
              after this?
            </div>
            <div className="diag-right-sub">
              Your details help us match you with
              <br />
              the right tutor and build a learning
              <br />
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
}
