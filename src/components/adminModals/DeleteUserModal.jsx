import { Trash2 } from "lucide-react";

export default function DeleteUserModal({
  isOpen,
  onClose,
  onConfirm,
  user,
  loading = false,
}) {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="max-w-md w-[90Vw] md:w-[30Vw] bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <Trash2 size={20} />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Delete user?
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              This will permanently remove:
            </p>

            <ul className="mt-2 text-sm text-gray-600 space-y-1">
              <li>• Account</li>
              <li>• Profile</li>
              <li>• Homework & submissions</li>
              <li>• Related user data</li>
            </ul>

            <p className="mt-3 text-sm font-medium text-gray-800">
              User: <span className="text-red-500">{user.name}</span>
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-5 py-3 rounded-2xl border border-gray-200"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-5 py-3 rounded-2xl bg-red-600 text-white hover:bg-red-700"
          >
            {loading ? "Deleting..." : "Delete User"}
          </button>
        </div>
      </div>
    </div>
  );
}
