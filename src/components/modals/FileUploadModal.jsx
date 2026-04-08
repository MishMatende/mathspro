import { useState } from "react";
import { motion } from "framer-motion";

const FileUploadModal = ({ isOpen, onClose, title }) => {
  const [file, setFile] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = () => {
    console.log("Uploaded file:", file);
    onClose();
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
        <h2 className="text-lg font-semibold mb-4">{title}</h2>

        {/* File Input */}
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="w-full rounded-lg px-3 py-2 cursor-pointer"
        />

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
            Upload
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FileUploadModal;
