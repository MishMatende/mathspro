// src/components/adminModals/DeleteTopicModal.jsx

import { AlertTriangle } from "lucide-react";

export default function DeleteTopicModal({ topic, onClose, onConfirm }) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl w-[90Vw] md:w-[20Vw] max-w-md"
      >
        <div className="p-6">
          <AlertTriangle size={42} className="text-red-500 mb-4" />

          <h2 className="text-2xl font-bold mb-2">Delete Topic</h2>

          <p>
            Delete <b>{topic.title}</b>?
          </p>

          <p className="text-red-500 text-sm mt-3">
            All subtopics inside it will be deleted.
          </p>
        </div>

        <div className="border-t p-4 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-3 border rounded-2xl">
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
