import { useState, useEffect } from "react";
import BottomSheetModal from "../tutorModals/BottomSheetModal";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";

export default function EditTutorModal({ tutor, onClose, onUpdated }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (tutor) setFormData(tutor);
  }, [tutor]);

  if (!tutor) return null;

  const handleSave = async () => {
    const loading = toast.loading("Updating...");

    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
      })
      .eq("id", tutor.id);

    toast.dismiss(loading);

    if (error) toast.error("Update failed");
    else {
      toast.success("Tutor updated");
      onUpdated();
      onClose();
    }
  };

  return (
    <BottomSheetModal isOpen={!!tutor} onClose={onClose}>
      <h2 className="text-lg font-semibold mb-4">Edit Tutor</h2>

      <div className="space-y-3">
        <input
          value={formData.first_name || ""}
          onChange={(e) =>
            setFormData({ ...formData, first_name: e.target.value })
          }
          className="w-full border px-3 py-2 rounded-lg"
        />

        <input
          value={formData.last_name || ""}
          onChange={(e) =>
            setFormData({ ...formData, last_name: e.target.value })
          }
          className="w-full border px-3 py-2 rounded-lg"
        />

        <input
          value={formData.phone || ""}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full border px-3 py-2 rounded-lg"
        />
      </div>

      <button
        onClick={handleSave}
        className="mt-5 w-full bg-(--color-primary) text-white py-2 rounded-lg"
      >
        Save Changes
      </button>
    </BottomSheetModal>
  );
}
