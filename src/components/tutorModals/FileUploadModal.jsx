import { useState } from "react";
import BottomSheetModal from "./BottomSheetModal";
import { Upload, X, FileText } from "lucide-react";

const FileUploadModal = ({ isOpen, onClose, title }) => {
  const [file, setFile] = useState(null);

  const handleSubmit = () => {
    console.log("Uploaded file:", file);
    onClose();
  };

  return (
    <BottomSheetModal isOpen={isOpen} onClose={onClose}>
      {/* Drag Handle */}
      <div className="w-10 h-1.5 bg-gray-300/70 rounded-full mx-auto mb-5" />

      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <p className="text-xs text-gray-500">Upload a PDF file to continue</p>
        </div>
      </div>

      {/* Upload Area */}
      <div className="space-y-5">
        <label className="block cursor-pointer">
          <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-(--color-primary) hover:bg-gray-50 transition group">
            {file ? (
              <div className="flex flex-col items-center gap-2">
                <div className="p-3 rounded-full bg-(--color-primary)/10">
                  <FileText size={20} className="text-(--color-primary)" />
                </div>

                <p className="text-sm font-medium text-gray-800 truncate max-w-50">
                  {file.name}
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

                <p className="text-sm font-medium text-gray-700">
                  Tap to upload PDF
                </p>

                <p className="text-xs text-gray-400 mt-1">Max size 10MB</p>
              </>
            )}

            <input
              type="file"
              accept="application/pdf"
              hidden
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>
        </label>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-200 text-sm hover:bg-gray-50 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={!file}
            className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-sm font-medium transition-all
              ${
                file
                  ? "bg-(--color-primary) text-white hover:shadow-lg hover:scale-[1.01] active:scale-[0.98]"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }
            `}
          >
            Upload File
          </button>
        </div>
      </div>
    </BottomSheetModal>
  );
};

export default FileUploadModal;
