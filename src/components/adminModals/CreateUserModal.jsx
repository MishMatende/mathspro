import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import BottomSheetModal from "../tutorModals/BottomSheetModal";

const CreateUserModal = ({ isOpen, onClose }) => {
  const [role, setRole] = useState("student");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    curriculum: "",
    level: "",
    parentPhone: "",
    parentEmail: "",
    phone: "",
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
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast.error("Please fill all required fields");
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("Invalid email address");
      return false;
    }

    if (role === "student") {
      if (!formData.curriculum || !formData.level || !formData.parentPhone) {
        toast.error("Please fill all student fields");
        return false;
      }
    }

    if (role === "tutor") {
      if (!formData.phone) {
        toast.error("Tutor phone number is required");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const loadingToast = toast.loading("Creating user...");

    try {
      const res = await fetch("/api/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, role }),
      });

      const data = await res.json();

      toast.dismiss(loadingToast);

      if (data.error) {
        toast.error("Failed to create user");
      } else {
        toast.success("User created & invite sent 🎉");
        onClose();
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error("Something went wrong");
    }
  };

  return (
    <BottomSheetModal isOpen={isOpen} onClose={onClose}>
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-gray-800">Create User</h2>
        <p className="text-sm text-gray-400">
          Add a new student or tutor to the system
        </p>
      </div>

      {/* ROLE SWITCH */}
      <div className="flex gap-2 mb-5 bg-gray-100 p-1 rounded-xl w-fit">
        {["student", "tutor"].map((r) => (
          <button
            key={r}
            onClick={() => setRole(r)}
            className={`px-4 py-2 text-sm rounded-lg capitalize transition
        ${
          role === r
            ? "bg-white shadow-sm text-gray-800"
            : "text-gray-500 hover:text-gray-700"
        }
      `}
          >
            {r}
          </button>
        ))}
      </div>

      {/* COMMON */}
      <div className="space-y-3">
        <input
          name="firstName"
          placeholder="First Name"
          onChange={handleChange}
          className="
  w-full
  bg-gray-50
  border border-gray-200
  rounded-xl
  px-4 py-3
  text-sm
  focus:outline-none
  focus:ring-2 focus:ring-orange-500/20
  focus:border-orange-400
  transition
"
        />

        <input
          name="lastName"
          placeholder="Last Name"
          onChange={handleChange}
          className="
  w-full
  bg-gray-50
  border border-gray-200
  rounded-xl
  px-4 py-3
  text-sm
  focus:outline-none
  focus:ring-2 focus:ring-orange-500/20
  focus:border-orange-400
  transition
"
        />

        <input
          name="email"
          placeholder="Email"
          onChange={handleChange}
          className="
  w-full
  bg-gray-50
  border border-gray-200
  rounded-xl
  px-4 py-3
  text-sm
  focus:outline-none
  focus:ring-2 focus:ring-orange-500/20
  focus:border-orange-400
  transition
"
        />

        {/* 🎓 STUDENT */}
        {role === "student" && (
          <>
            <select
              name="curriculum"
              onChange={handleChange}
              className="
  w-full
  bg-gray-50
  border border-gray-200
  rounded-xl
  px-4 py-3
  text-sm
  focus:outline-none
  focus:ring-2 focus:ring-orange-500/20
  focus:border-orange-400
"
            >
              <option value="">Select Curriculum</option>
              <option value="CBC">CBC</option>
              <option value="Cambridge">Cambridge</option>
              <option value="IB">IB</option>
            </select>

            {/* AUTO LEVEL SELECT */}
            {levels.length > 0 && (
              <select
                name="level"
                onChange={handleChange}
                className="
  w-full
  bg-gray-50
  border border-gray-200
  rounded-xl
  px-4 py-3
  text-sm
  focus:outline-none
  focus:ring-2 focus:ring-orange-500/20
  focus:border-orange-400
"
              >
                <option value="">Select Level</option>
                {levels.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            )}

            <input
              name="parentPhone"
              placeholder="Parent Phone"
              onChange={handleChange}
              className="
  w-full
  bg-gray-50
  border border-gray-200
  rounded-xl
  px-4 py-3
  mb-2
  text-sm
  focus:outline-none
  focus:ring-2 focus:ring-orange-500/20
  focus:border-orange-400
  transition
"
            />
          </>
        )}

        {/* 👨‍🏫 TUTOR */}
        {role === "tutor" && (
          <input
            name="phone"
            placeholder="Phone Number"
            onChange={handleChange}
            className="
  w-full
  bg-gray-50
  border border-gray-200
  rounded-xl
  px-4 py-3
  mb-2
  text-sm
  focus:outline-none
  focus:ring-2 focus:ring-orange-500/20
  focus:border-orange-400
  transition
"
          />
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
        Create User
      </button>
    </BottomSheetModal>
  );
};

export default CreateUserModal;
