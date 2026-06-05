// src/components/adminModals/CreateTopicModal.jsx

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";

export default function CreateTopicModal({ levelId, onClose, onCreated }) {
  const [title, setTitle] = useState("");
  const [sortOrder, setSortOrder] = useState(0);

  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);

      const { error } = await supabase.from("checklist_topics").insert({
        level_id: levelId,
        title,
        sort_order: Number(sortOrder),
      });

      if (error) throw error;

      toast.success("Topic created");

      onCreated();
    } catch (error) {
      console.error(error);

      toast.error("Failed to create topic");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl p-6 w-[90Vw] md:w-[20Vw] max-w-md"
      >
        <h2 className="text-2xl font-bold mb-5">Add Topic</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Fractions"
            required
            className="w-full border rounded-2xl p-3"
          />

          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            placeholder="Sort Order"
            className="w-full border rounded-2xl p-3"
          />

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 border rounded-2xl"
            >
              Cancel
            </button>

            <button
              disabled={loading}
              className="px-5 py-3 rounded-2xl bg-orange-500 text-white"
            >
              {loading ? "Creating..." : "Create Topic"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
