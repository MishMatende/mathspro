import { useState } from "react";
import BottomSheetModal from "./BottomSheetModal";
import { X, Upload } from "lucide-react";

const UploadHomeworkModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    title: "",
    category: "Algebra",
    file: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "file") {
      setFormData({ ...formData, file: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = () => {
    console.log("Homework Upload:", formData);
    onClose();
  };

  const isDisabled = !formData.title || !formData.file;

  return (
    <BottomSheetModal isOpen={isOpen} onClose={onClose}>
      {/* Drag Handle */}
      <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-lg">Upload Homework</h2>

        <button onClick={onClose} className="cursor-pointer">
          <X size={18} />
        </button>
      </div>

      {/* Form */}
      <div className="space-y-4">
        {/* Title */}
        <input
          type="text"
          name="title"
          placeholder="Homework title"
          value={formData.title}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-(--color-primary)/30"
        />

        {/* Category */}
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2 text-sm cursor-pointer"
        >
          <option>Algebra</option>
          <option>Geometry</option>
          <option>Fractions</option>
        </select>

        {/* File Upload */}
        <label className="block">
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-5 text-center cursor-pointer hover:bg-gray-50 transition">
            <Upload className="mx-auto mb-2 text-gray-400" size={20} />

            <p className="text-sm text-gray-600">
              {formData.file ? formData.file.name : "Tap to upload PDF"}
            </p>

            <input type="file" name="file" hidden onChange={handleChange} />
          </div>
        </label>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={isDisabled}
          className={`w-full py-2 rounded-lg text-white cursor-pointer transition
            ${
              isDisabled
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-(--color-primary) hover:opacity-90"
            }
          `}
        >
          Upload Homework
        </button>
      </div>
    </BottomSheetModal>
  );
};

export default UploadHomeworkModal;
