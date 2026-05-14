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
    // COMMON
    name: "",
    email: "",

    // STUDENT
    curriculum: "",
    level: "",
    phone: "",
    parentEmail1: "",
    parentEmail2: "",

    // TUTOR
    tscNumber: "",
    phone1: "",
    phone2: "",
    teachingAreas: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // 🔥 AUTO LEVEL GENERATION
  const levels = useMemo(() => {
    if (formData.curriculum === "CBC") {
      return Array.from({ length: 11 }, (_, i) => `Grade ${i + 1}`);
    }

    if (formData.curriculum === "Cambridge" || formData.curriculum === "IB") {
      return Array.from({ length: 11 }, (_, i) => `Year ${i + 1}`);
    }

    return [];
  }, [formData.curriculum]);

  // 🔥 VALIDATION
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
      if (!formData.curriculum || !formData.level || !formData.phone) {
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
      console.log("CALLING EDGE FUNCTION");

      const response = await Promise.race([
        supabase.functions.invoke("create-user", {
          body: {
            ...formData,
            role,
          },
        }),

        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Request timeout")), 10000),
        ),
      ]);

      console.log("EDGE RESPONSE:", response);

      toast.dismiss(loadingToast);

      const { data, error } = response;

      if (error) {
        console.log(error);
        toast.error(error.message);
        return;
      }

      toast.success("User created 🎉");

      onClose();
    } catch (err) {
      console.log("FRONTEND ERROR:", err);

      toast.dismiss(loadingToast);

      toast.error(String(err));
    }
  };

  useEffect(() => {
    setRole(initialRole);
  }, [initialRole, isOpen]);

  return (
    <BottomSheetModal isOpen={isOpen} onClose={onClose}>
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-gray-800">Create {role}</h2>
        <p className="text-sm text-gray-400">Add a new {role} to the system</p>
      </div>

      {/* COMMON */}
      <div className="space-y-3">
        {/* COMMON */}
        <input
          name="name"
          required
          placeholder="Full Name*"
          onChange={handleChange}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition"
        />

        <input
          name="email"
          required
          placeholder={role === "student*" ? "Student Email*" : "Tutor Email*"}
          onChange={handleChange}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition"
        />

        {/* 🎓 STUDENT */}
        {role === "student" && (
          <>
            <select
              name="curriculum"
              required
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400"
            >
              <option value="">Select Curriculum*</option>
              <option value="CBC">CBC</option>
              <option value="Cambridge">Cambridge</option>
              <option value="IB">IB</option>
            </select>

            {levels.length > 0 && (
              <select
                name="level"
                required
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400"
              >
                <option value="">Select Level*</option>

                {levels.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            )}

            <input
              name="phone"
              required
              placeholder="Student Phone*"
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition"
            />

            <input
              name="parentEmail1"
              placeholder="Parent Email 1"
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition"
            />

            <input
              name="parentEmail2"
              placeholder="Parent Email 2"
              onChange={handleChange}
              className="w-full bg-gray-50 border mb-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition"
            />
          </>
        )}

        {/* 👨‍🏫 TUTOR */}
        {role === "tutor" && (
          <>
            <input
              name="tscNumber"
              placeholder="TSC Number"
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                name="phone1"
                required
                placeholder="Phone 1*"
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition"
              />

              <input
                name="phone2"
                placeholder="Phone 2"
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition"
              />
            </div>

            <textarea
              name="teachingAreas"
              required
              placeholder="Teaching Areas*"
              rows={4}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition"
            />
          </>
        )}
      </div>

      {/* ACTION */}
      <button
        onClick={handleSubmit}
        className="
  w-full py-2.5 rounded-xl text-sm font-medium
  bg-linear-to-r from-orange-500 to-orange-600
  text-white
  shadow-md hover:shadow-lg
  hover:scale-[1.01] active:scale-[0.98]
  transition-all
"
      >
        Create {role}
      </button>
    </BottomSheetModal>
  );
}
