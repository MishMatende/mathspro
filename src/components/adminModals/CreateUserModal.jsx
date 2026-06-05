import { useState, useMemo, useEffect } from "react";
import toast from "react-hot-toast";
import BottomSheetModal from "../tutorModals/BottomSheetModal";
import { supabase } from "../../lib/supabase";

export default function CreateUserModal({
  isOpen,
  onClose,
  initialRole = "student",
}) {
  const [role, setRole] = useState(initialRole);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    curriculum: "",
    level: "",
    phone: "",
    parentEmail1: "",
    parentEmail2: "",
    tscNumber: "",
    phone1: "",
    phone2: "",
    teachingAreas: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "curriculum" ? { level: "" } : {}),
    }));
  };

  const levels = useMemo(() => {
    switch (formData.curriculum) {
      case "CBE":
        return [
          "Grade 4",
          "Grade 5",
          "Grade 6",
          "Grade 7",
          "Grade 8",
          "Grade 9",
          "Grade 10",
          "Grade 11",
          "Grade 12",
        ];
      case "IGCSE Cambridge":
      case "IGCSE Edexcel":
        return [
          "Year 4",
          "Year 5",
          "Year 6",
          "Year 7",
          "Year 8",
          "Year 9",
          "Year 10",
          "Year 11",
        ];
      case "IB":
        return [
          "MYP 1",
          "MYP 2",
          "MYP 3",
          "MYP 4",
          "MYP 5",
          "DP Year 1",
          "DP Year 2",
        ];
      case "Singapore Maths":
        return [
          "Primary 4",
          "Primary 5",
          "Primary 6",
          "Secondary 1",
          "Secondary 2",
          "Secondary 3",
          "Secondary 4",
          "JC 1",
          "JC 2",
        ];
      default:
        return [];
    }
  }, [formData.curriculum]);

  const validate = () => {
    if (!formData.name || !formData.email) {
      toast.error("Please fill all required fields");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("Invalid email address");
      return false;
    }
    if (role === "student") {
      if (
        !formData.curriculum ||
        !formData.level ||
        !formData.phone ||
        !formData.parentEmail1
      ) {
        toast.error("Please fill all student fields");
        return false;
      }
    }
    if (role === "tutor") {
      if (!formData.phone1 || !formData.teachingAreas) {
        toast.error("Please fill all tutor fields");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const loadingToast = toast.loading("Creating user...");
    try {
      const response = await Promise.race([
        supabase.functions.invoke("create-user", {
          body: { ...formData, role },
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Request timeout")), 10000),
        ),
      ]);
      toast.dismiss(loadingToast);
      const { data, error } = response;
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("User created 🎉");
      onClose();
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(String(err));
    }
  };

  useEffect(() => {
    setRole(initialRole);
  }, [initialRole, isOpen]);

  // Shared input classes
  const inputCls =
    "w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition";

  const selectCls =
    "w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition";

  return (
    <BottomSheetModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-xs">
      <div className="mx-auto w-full max-w-[340px] flex flex-col gap-4">
        {/* HEADER */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center shrink-0">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-800 capitalize leading-tight">
              Create {role}
            </h2>
            <p className="text-xs text-gray-400">
              Add a new {role} to the system
            </p>
          </div>
        </div>

        {/* ROLE TOGGLE */}
        <div className="flex gap-1.5 bg-gray-100 p-1 rounded-xl">
          {["student", "tutor"].map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`
                flex-1 py-1.5 rounded-lg text-xs font-medium capitalize transition-all
                ${
                  role === r
                    ? "bg-orange-500 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }
              `}
            >
              {r}
            </button>
          ))}
        </div>

        {/* FIELDS */}
        <div className="flex flex-col gap-2.5">
          {/* Name */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
            </span>
            <input
              name="name"
              placeholder="Full name*"
              onChange={handleChange}
              className={inputCls}
            />
          </div>

          {/* Email */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                />
              </svg>
            </span>
            <input
              name="email"
              placeholder={
                role === "student" ? "Student email*" : "Tutor email*"
              }
              onChange={handleChange}
              className={inputCls}
            />
          </div>

          {/* STUDENT FIELDS */}
          {role === "student" && (
            <>
              {/* Curriculum + Level side by side */}
              <div className="grid grid-cols-2 gap-2">
                <select
                  name="curriculum"
                  value={formData.curriculum}
                  onChange={handleChange}
                  className={selectCls}
                >
                  <option value="">Curriculum*</option>
                  <option>CBE</option>
                  <option>IGCSE Cambridge</option>
                  <option>IGCSE Edexcel</option>
                  <option>IB</option>
                  <option>Singapore Maths</option>
                </select>

                <select
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  disabled={levels.length === 0}
                  className={`${selectCls} disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  <option value="">Level*</option>
                  {levels.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </div>

              {/* Phone */}
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                    />
                  </svg>
                </span>
                <input
                  name="phone"
                  placeholder="Student phone* e.g. 254712345678"
                  onChange={handleChange}
                  className={inputCls}
                />
              </div>

              {/* Parent email 1 */}
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                    />
                  </svg>
                </span>
                <input
                  name="parentEmail1"
                  placeholder="Parent email 1*"
                  onChange={handleChange}
                  className={inputCls}
                />
              </div>

              {/* Parent email 2 */}
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                    />
                  </svg>
                </span>
                <input
                  name="parentEmail2"
                  placeholder="Parent email 2"
                  onChange={handleChange}
                  className={inputCls}
                />
              </div>
            </>
          )}

          {/* TUTOR FIELDS */}
          {role === "tutor" && (
            <>
              {/* TSC Number */}
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z"
                    />
                  </svg>
                </span>
                <input
                  name="tscNumber"
                  placeholder="TSC number"
                  onChange={handleChange}
                  className={inputCls}
                />
              </div>

              {/* Phones side by side */}
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                      />
                    </svg>
                  </span>
                  <input
                    name="phone1"
                    placeholder="Phone 1*"
                    onChange={handleChange}
                    className={inputCls}
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                      />
                    </svg>
                  </span>
                  <input
                    name="phone2"
                    placeholder="Phone 2"
                    onChange={handleChange}
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Teaching areas */}
              <textarea
                name="teachingAreas"
                placeholder="Teaching areas*"
                rows={3}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition"
              />
            </>
          )}
        </div>

        {/* SUBMIT */}
        <button
          onClick={handleSubmit}
          className="w-full py-2.5 rounded-xl text-sm font-medium bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white transition-all"
        >
          Create {role}
        </button>
      </div>
    </BottomSheetModal>
  );
}
