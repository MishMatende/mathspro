import { useState, useEffect } from "react";
import BottomSheetModal from "../tutorModals/BottomSheetModal";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";

export default function EditLearnerModal({ learner, onClose, onUpdated }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (learner) setFormData(learner);
  }, [learner]);

  if (!learner) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    const loading = toast.loading("Updating...");

    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: formData.first_name,
        last_name: formData.last_name,
        curriculum: formData.curriculum,
        level: formData.level,
        parent_phone: formData.parent_phone,
        parent_email: formData.parent_email,
      })
      .eq("id", learner.id);

    toast.dismiss(loading);

    if (error) {
      toast.error("Update failed");
    } else {
      toast.success("Learner updated");
      onUpdated();
      onClose();
    }
  };

  return (
    <BottomSheetModal isOpen={!!learner} onClose={onClose}>
      <h2 className="text-lg font-semibold mb-4">Edit Learner</h2>

      <div className="space-y-3">
        <input
          name="first_name"
          value={formData.first_name || ""}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2"
        />

        <input
          name="last_name"
          value={formData.last_name || ""}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2"
        />

        <input
          name="curriculum"
          value={formData.curriculum || ""}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2"
        />

        <input
          name="level"
          value={formData.level || ""}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2"
        />

        <input
          name="parent_phone"
          value={formData.parent_phone || ""}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2"
        />

        <input
          name="parent_email"
          value={formData.parent_email || ""}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2"
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
