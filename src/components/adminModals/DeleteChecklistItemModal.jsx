// src/components/adminModals/DeleteChecklistItemModal.jsx

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Trash2 } from "lucide-react";

export default function DeleteChecklistItemModal({ item, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    try {
      setLoading(true);

      await onConfirm();
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{
            opacity: 0,
            scale: 0.95,
            y: 20,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            scale: 0.95,
            y: 20,
          }}
          transition={{
            duration: 0.2,
          }}
          className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden"
        >
          <div className="p-6">
            <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mb-4">
              <AlertTriangle size={28} className="text-red-500" />
            </div>

            <h2 className="text-2xl font-bold mb-2">Delete Skill</h2>

            <p className="text-gray-600">
              Are you sure you want to delete this checklist skill?
            </p>

            <div className="mt-4 p-4 rounded-2xl bg-gray-50 border">
              <p className="text-sm text-gray-500 mb-1">Skill</p>

              <p className="font-medium">{item?.skill}</p>
            </div>

            <p className="text-sm text-red-500 mt-4">
              This action cannot be undone.
            </p>
          </div>

          <div className="border-t p-4 flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-5 py-3 rounded-2xl border hover:bg-gray-50 transition"
            >
              Cancel
            </button>

            <button
              onClick={handleDelete}
              disabled={loading}
              className="px-5 py-3 rounded-2xl bg-red-500 text-white hover:bg-red-600 transition flex items-center gap-2"
            >
              <Trash2 size={18} />

              {loading ? "Deleting..." : "Delete Skill"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
