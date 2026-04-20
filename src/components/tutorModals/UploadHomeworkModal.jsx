import { useState } from "react";
import BottomSheetModal from "./BottomSheetModal";
import { X, Upload, FileText } from "lucide-react";

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
      <div className="w-10 h-1.5 bg-gray-300/70 rounded-full mx-auto mb-5" />

      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="font-semibold text-xl text-gray-900">
            Upload Homework
          </h2>
          <p className="text-xs text-gray-500">
            Add a title and upload your PDF
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-5">
        {/* Title */}
        <div>
          <label className="text-xs text-gray-500 mb-1 block">
            Homework Title
          </label>
          <input
            type="text"
            name="title"
            placeholder="e.g. Algebra Worksheet 1"
            value={formData.title}
            onChange={handleChange}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary)/30 focus:bg-white transition"
          />
        </div>

        {/* Category */}
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary)/30"
          >
            <option>Algebra</option>
            <option>Geometry</option>
            <option>Fractions</option>
          </select>
        </div>

        {/* File Upload */}
        <div>
          <label className="text-xs text-gray-500 mb-2 block">
            Upload File
          </label>

          <label className="block cursor-pointer">
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-(--color-primary) hover:bg-gray-50 transition group">
              {formData.file ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 rounded-full bg-(--color-primary)/10">
                    <FileText size={20} className="text-(--color-primary)" />
                  </div>

                  <p className="text-sm font-medium text-gray-800 truncate max-w-50">
                    {formData.file.name}
                  </p>

                  <span className="text-xs text-(--color-primary)">
                    Tap to change file
                  </span>
                </div>
              ) : (
                <>
                  <div className="p-3 rounded-full bg-gray-100 inline-block mb-2 group-hover:bg-(--color-primary)/10 transition">
                    <Upload
                      size={20}
                      className="text-gray-500 group-hover:text-(--color-primary)"
                    />
                  </div>

                  <p className="text-sm text-gray-700 font-medium">
                    Tap to upload PDF
                  </p>

                  <p className="text-xs text-gray-400 mt-1">Max size 10MB</p>
                </>
              )}

              <input
                type="file"
                name="file"
                accept="application/pdf"
                hidden
                onChange={handleChange}
              />
            </div>
          </label>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={isDisabled}
          className={`w-full py-3 rounded-xl text-sm font-medium transition-all
            ${
              isDisabled
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-(--color-primary) text-white hover:shadow-lg hover:scale-[1.01] active:scale-[0.98]"
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
