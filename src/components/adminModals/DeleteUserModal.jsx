import { Trash2 } from "lucide-react";
import Modal, { ModalBody, ModalFooter, btnDanger, btnSecondary } from "../ui/Modal";

export default function DeleteUserModal({
  isOpen,
  onClose,
  onConfirm,
  user,
  loading = false,
}) {
  if (!isOpen || !user) return null;

  const close = loading ? undefined : onClose;

  return (
    <Modal onClose={close} size="sm" labelledBy="delete-user-title">
      <ModalBody className="pt-4 sm:pt-7">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
          <Trash2 size={22} />
        </div>
        <h2 id="delete-user-title" className="text-xl font-bold text-slate-900 sm:text-2xl">
          Delete user?
        </h2>
        <div className="mt-3 break-words rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium text-slate-900">
          {user.name}
        </div>
        <p className="mt-4 text-sm text-slate-600">This will permanently remove:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
          <li>Account</li>
          <li>Profile</li>
          <li>Homework &amp; submissions</li>
          <li>Related user data</li>
        </ul>
      </ModalBody>
      <ModalFooter>
        <button type="button" onClick={onClose} disabled={loading} className={btnSecondary}>
          Cancel
        </button>
        <button type="button" onClick={onConfirm} disabled={loading} className={btnDanger}>
          {loading ? "Deleting…" : "Delete user"}
        </button>
      </ModalFooter>
    </Modal>
  );
}
