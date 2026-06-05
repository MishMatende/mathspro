import { useState, useEffect } from "react";
import BottomSheetModal from "../tutorModals/BottomSheetModal";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";

export default function EditLearnerModal({ learner, onClose, onUpdated }) {
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    curriculum: "",
    level: "",
    phone: "",
    parent_email_1: "",
    parent_email_2: "",
  });

  useEffect(() => {
    if (!learner) return;

    setFormData({
      name: learner.name || "",
      curriculum: learner.curriculum || "",
      level: learner.level || "",
      phone: learner.phone || "",
      parent_email_1: learner.parent_email_1 || "",
      parent_email_2: learner.parent_email_2 || "",
    });
  }, [learner]);

  if (!learner) return null;

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
        .from("learners")
        .update({
          name: formData.name,
          curriculum: formData.curriculum,
          level: formData.level,
          phone: formData.phone,
          parent_email_1: formData.parent_email_1,
          parent_email_2: formData.parent_email_2,
        })
        .eq("id", learner.id);

      if (error) throw error;

      toast.success("Learner updated");

      onUpdated?.({
        ...learner,
        ...formData,
      });

      onClose?.();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update learner");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition";

  return (
    <BottomSheetModal isOpen={!!learner} onClose={onClose}>
      <div className="pb-safe">
        {/* HEADER */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900">Edit Learner</h2>

          <p className="text-sm text-slate-500 mt-1">
            Update learner information.
          </p>
        </div>

        {/* FORM */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">
              Learner Name
            </label>

            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={inputClass}
              placeholder="Learner name"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">
              Curriculum
            </label>

            <select
              name="curriculum"
              value={formData.curriculum}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select Curriculum</option>
              <option value="Cambridge">Cambridge</option>
              <option value="CBC">CBC</option>
              <option value="IB">IB</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">
              Level
            </label>

            <input
              name="level"
              value={formData.level}
              onChange={handleChange}
              className={inputClass}
              placeholder="e.g. Year 8"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">
              Phone Number
            </label>

            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={inputClass}
              placeholder="+254..."
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">
              Parent Email 1
            </label>

            <input
              type="email"
              name="parent_email_1"
              value={formData.parent_email_1}
              onChange={handleChange}
              className={inputClass}
              placeholder="parent@email.com"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">
              Parent Email 2
            </label>

            <input
              type="email"
              name="parent_email_2"
              value={formData.parent_email_2}
              onChange={handleChange}
              className={inputClass}
              placeholder="optional@email.com"
            />
          </div>
        </div>

        {/* BUTTONS */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl border border-slate-200 font-medium hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-medium disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </BottomSheetModal>
  );
}
