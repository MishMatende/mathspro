// src/components/adminModals/EditTopicModal.jsx

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";

export default function EditTopicModal({ topic, onClose, onUpdated }) {
  const [title, setTitle] = useState(topic.title);
  const [sortOrder, setSortOrder] = useState(topic.sort_order ?? 0);

  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);

      const { error } = await supabase
        .from("checklist_topics")
        .update({
          title,
          sort_order: Number(sortOrder),
        })
        .eq("id", topic.id);

      if (error) throw error;

      toast.success("Topic updated");

      onUpdated();
    } catch (error) {
      console.error(error);

      toast.error("Failed to update topic");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      onClick={onClose}
      className="
        fixed inset-0 z-[70]
        bg-black/40 backdrop-blur-sm
        flex items-center justify-center
        p-4
      "
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="
          w-[90Vw]
          md:w-[15Vw]
          max-w-5xl
          bg-white
          rounded-[28px]
          overflow-hidden
          shadow-2xl
        "
      >
        <form onSubmit={handleSubmit}>
          {/* Header */}

          <div className="px-6 pt-6 pb-4 border-b">
            <h2 className="text-3xl font-bold text-gray-900">Edit Topic</h2>

            <p className="text-gray-500 mt-1">
              Update topic details and sort order.
            </p>
          </div>

          {/* Body */}

          <div className="p-6 space-y-4">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Fractions"
              required
              className="
                w-full
                h-14
                px-4
                rounded-2xl
                border
                border-gray-300
                bg-white
                outline-none
                focus:ring-2
                focus:ring-orange-500/20
                focus:border-orange-500
              "
            />

            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              placeholder="Sort Order"
              className="
                w-full
                h-14
                px-4
                rounded-2xl
                border
                border-gray-300
                bg-white
                outline-none
                focus:ring-2
                focus:ring-orange-500/20
                focus:border-orange-500
              "
            />
          </div>

          {/* Footer */}

          <div className="px-6 py-4 border-t flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="
                px-5 py-3
                rounded-2xl
                border
                border-gray-300
                hover:bg-gray-50
                transition
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="
                px-5 py-3
                rounded-2xl
                bg-orange-500
                text-white
                hover:bg-orange-600
                transition
                disabled:opacity-50
              "
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
