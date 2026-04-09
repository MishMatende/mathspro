import { useState } from "react";
import BottomSheetModal from "./BottomSheetModal";

const AddLessonModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    objective: "",
    achieved: "yes",
    struggles: "",
    nextAction: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = () => {
    console.log("Lesson Data:", formData);
    onClose();
  };

  return (
    <BottomSheetModal isOpen={isOpen} onClose={onClose}>
      {/* Drag Handle */}
      <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />

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
          className="w-full border rounded-lg px-3 py-2 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-(--color-primary)/30"
        />

        <select
          name="achieved"
          value={formData.achieved}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2 text-sm cursor-pointer"
        >
          <option value="yes">Achieved</option>
          <option value="no">Not Achieved</option>
        </select>

        <textarea
          name="struggles"
          placeholder="Where did the student struggle?"
          value={formData.struggles}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2 text-sm cursor-pointer"
        />

        <textarea
          name="nextAction"
          placeholder="Next action / recommendation"
          value={formData.nextAction}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2 text-sm cursor-pointer"
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
        <button
          onClick={onClose}
          className="px-4 py-2 border rounded-lg cursor-pointer transition hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
        >
          Cancel
        </button>

        <button
          onClick={handleSubmit}
          className="bg-(--color-primary) text-white px-4 py-2 rounded-lg cursor-pointer transition hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
        >
          Save Lesson
        </button>
      </div>
    </BottomSheetModal>
  );
};

export default AddLessonModal;
