// src/components/adminModals/DeleteChecklistModal.jsx

import { AlertTriangle } from "lucide-react";
import Modal, { ModalBody, ModalFooter, btnDanger, btnSecondary } from "../ui/Modal";

export default function DeleteChecklistModal({ level, onClose, onConfirm }) {
  return (
    <Modal onClose={onClose} size="sm" labelledBy="delete-checklist-title">
      <ModalBody className="pt-4 sm:pt-7">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100">
          <AlertTriangle size={24} className="text-red-500" />
        </div>
        <h2 id="delete-checklist-title" className="text-xl font-bold text-slate-900 sm:text-2xl">
          Delete checklist
        </h2>
        <p className="mt-2 text-slate-600">Are you sure you want to delete:</p>
        <div className="mt-3 break-words rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium text-slate-900">
          {level.name}
        </div>
        <p className="mt-3 text-sm text-red-600">
          All topics and subtopics will be removed.
        </p>
      </ModalBody>
      <ModalFooter>
        <button type="button" onClick={onClose} className={btnSecondary}>
          Cancel
        </button>
        <button type="button" onClick={onConfirm} className={btnDanger}>
          Delete checklist
        </button>
      </ModalFooter>
    </Modal>
  );
}
