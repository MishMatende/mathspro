import { useState, useEffect } from "react";
import BottomSheetModal from "../tutorModals/BottomSheetModal";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";

export default function EditTutorModal({ tutor, onClose, onUpdated }) {
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone_1: "",
    phone_2: "",
    teaching_areas: "",
  });

  useEffect(() => {
    if (!tutor) return;

    setFormData({
      name: tutor.name || "",
      phone_1: tutor.phone_1 || "",
      phone_2: tutor.phone_2 || "",
      teaching_areas: tutor.teaching_areas || "",
    });
  }, [tutor]);

  if (!tutor) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const { error } = await supabase
        .from("tutors")
        .update({
          name: formData.name,
          phone_1: formData.phone_1,
          phone_2: formData.phone_2,
          teaching_areas: formData.teaching_areas,
        })
        .eq("id", tutor.id);

      if (error) throw error;

      toast.success("Tutor updated");

      onUpdated?.();

      onClose?.();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update tutor");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition";

  return (
    <BottomSheetModal isOpen={!!tutor} onClose={onClose} maxWidth="max-w-3xl">
      {/* HEADER */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Edit Tutor</h2>

        <p className="text-sm text-slate-500 mt-1">Update tutor information.</p>
      </div>

      {/* FORM */}
      <div className="space-y-4">
        <div>
          <label className="block mb-1 text-sm font-medium text-slate-700">
            Tutor Name
          </label>

          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Tutor name"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-slate-700">
            Phone Number
          </label>

          <input
            name="phone_1"
            value={formData.phone_1}
            onChange={handleChange}
            placeholder="+254..."
            className={inputClass}
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-slate-700">
            Phone Number 2
          </label>

          <input
            name="phone_2"
            value={formData.phone_2}
            onChange={handleChange}
            placeholder="+254..."
            className={inputClass}
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-slate-700">
            Teaching Areas
          </label>

          <textarea
            name="teaching_areas"
            value={formData.teaching_areas}
            onChange={handleChange}
            rows={4}
            placeholder="e.g. IGCSE Mathematics, IB Mathematics, Singapore Maths"
            className={`${inputClass} resize-none`}
          />
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={onClose}
          className="flex-1 py-3 rounded-2xl border border-slate-200 font-medium hover:bg-slate-50 transition"
        >
          Cancel
        </button>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-medium transition disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </BottomSheetModal>
  );
}
