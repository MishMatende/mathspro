import { useState } from "react";
import { motion } from "framer-motion";

const AddLessonModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    objective: "",
    achieved: "yes",
    struggles: "",
    nextAction: "",
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = () => {
    console.log("Lesson Data:", formData);
    onClose(); // close modal
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-xl w-full max-w-md p-6"
      >
        {/* Header */}
        <h2 className="text-lg font-semibold mb-4">Add Lesson</h2>

        {/* Form */}
        <div className="space-y-4">
          <input
            type="text"
            name="objective"
            placeholder="Lesson Objective"
            value={formData.objective}
            onChange={handleChange}
            className="w-full  rounded-lg px-3 py-2"
          />

          <select
            name="achieved"
            value={formData.achieved}
            onChange={handleChange}
            className="w-full  rounded-lg px-3 py-2"
          >
            <option value="yes">Achieved</option>
            <option value="no">Not Achieved</option>
          </select>

          <textarea
            name="struggles"
            placeholder="Where did the student struggle?"
            value={formData.struggles}
            onChange={handleChange}
            className="w-full  rounded-lg px-3 py-2"
          />

          <textarea
            name="nextAction"
            placeholder="Next action / recommendation"
            value={formData.nextAction}
            onChange={handleChange}
            className="w-full  rounded-lg px-3 py-2"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg cursor-pointer transition hover:scale-[1.02] active:scale-[0.98]"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="bg-(--color-primary) text-white px-4 py-2 rounded-lg cursor-pointer transition hover:scale-[1.02] active:scale-[0.98]"
          >
            Save Lesson
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AddLessonModal;
