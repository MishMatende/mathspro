// src/components/adminModals/DeleteSubtopicModal.jsx

import { AlertTriangle } from "lucide-react";

export default function DeleteSubtopicModal({ subtopic, onClose, onConfirm }) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl w-[90Vw] md:w-[20Vw] max-w-md overflow-hidden"
      >
        <div className="p-6">
          <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mb-4">
            <AlertTriangle size={28} className="text-red-500" />
          </div>

          <h2 className="text-2xl font-bold mb-2">Delete Subtopic</h2>

          <p className="text-gray-600">Are you sure you want to delete:</p>

          <div className="mt-4 p-4 rounded-2xl bg-gray-50 border">
            <p className="font-medium">{subtopic.title}</p>
          </div>

          <p className="text-red-500 text-sm mt-4">
            This action cannot be undone.
          </p>
        </div>

        <div className="border-t p-4 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-3 border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50">
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-5 py-3 rounded-2xl bg-red-500 text-white"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
