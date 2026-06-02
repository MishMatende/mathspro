// src/components/adminModals/CreateChecklistItemModal.jsx

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";

export default function CreateChecklistItemModal({ onClose, onCreated }) {
  const [grade, setGrade] = useState("");
  const [unit, setUnit] = useState("");
  const [skill, setSkill] = useState("");
  const [sortOrder, setSortOrder] = useState(0);

  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);

      const { error } = await supabase.from("checklist_templates").insert({
        grade,
        unit,
        skill,
        sort_order: Number(sortOrder),
      });

      if (error) throw error;

      toast.success("Checklist skill created");

      onCreated();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create skill");
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
        <h2 className="text-2xl font-bold mb-6">Create Checklist Skill</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            placeholder="Grade"
            required
            className="w-full border rounded-2xl p-3"
          />

          <input
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="Unit"
            required
            className="w-full border rounded-2xl p-3"
          />

          <textarea
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            placeholder="Skill"
            required
            rows={4}
            className="w-full border rounded-2xl p-3"
          />
          <label>Sort Order</label>
          <input
            type="number"
            value={sortOrder}
            placeholder="Sort Order"
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
              {loading ? "Creating..." : "Create Skill"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
