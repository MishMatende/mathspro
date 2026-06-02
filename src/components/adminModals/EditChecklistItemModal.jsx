// src/components/adminModals/EditChecklistItemModal.jsx

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";

export default function EditChecklistItemModal({ item, onClose, onUpdated }) {
  const [grade, setGrade] = useState(item.grade);
  const [unit, setUnit] = useState(item.unit);
  const [skill, setSkill] = useState(item.skill);
  const [sortOrder, setSortOrder] = useState(item.sort_order);

  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);

      const { error } = await supabase
        .from("checklist_templates")
        .update({
          grade,
          unit,
          skill,
          sort_order: Number(sortOrder),
          updated_at: new Date(),
        })
        .eq("id", item.id);

      if (error) throw error;

      toast.success("Checklist updated");

      onUpdated();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update skill");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-white rounded-3xl p-6"
      >
        <h2 className="text-2xl font-bold mb-6">Edit Checklist Skill</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            required
            className="w-full border rounded-2xl p-3"
          />

          <input
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            required
            className="w-full border rounded-2xl p-3"
          />

          <textarea
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            rows={4}
            required
            className="w-full border rounded-2xl p-3"
          />

          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="w-full border rounded-2xl p-3"
          />

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-2xl border"
            >
              Cancel
            </button>

            <button
              disabled={loading}
              className="px-5 py-3 rounded-2xl bg-orange-500 text-white"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
