import { useState } from "react";
import BottomSheetModal from "./BottomSheetModal";
import { Upload, X } from "lucide-react";

const FileUploadModal = ({ isOpen, onClose, title }) => {
  const [file, setFile] = useState(null);

  const handleSubmit = () => {
    console.log("Uploaded file:", file);
    onClose();
  };

  return (
    <BottomSheetModal isOpen={isOpen} onClose={onClose}>
      {/* Drag Handle */}
      <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>

        <button onClick={onClose} className="cursor-pointer">
          <X size={18} />
        </button>
      </div>

      {/* File Upload Area */}
      <div className="space-y-4">
        <label className="block">
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:bg-gray-50 transition">
            <Upload className="mx-auto mb-2 text-gray-400" size={20} />

            <p className="text-sm text-gray-600">
              {file ? file.name : "Tap to upload PDF"}
            </p>

            <input
              type="file"
              hidden
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>
        </label>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg cursor-pointer transition hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={!file}
            className={`px-4 py-2 rounded-lg text-white w-full sm:w-auto cursor-pointer transition
              ${
                file
                  ? "bg-(--color-primary) hover:opacity-90"
                  : "bg-gray-300 cursor-not-allowed"
              }
            `}
          >
            Upload
          </button>
        </div>
      </div>
    </BottomSheetModal>
  );
};

export default FileUploadModal;
