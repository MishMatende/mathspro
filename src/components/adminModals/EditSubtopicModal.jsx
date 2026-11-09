// src/components/adminModals/EditSubtopicModal.jsx

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";
import Modal, {
  ModalBody,
  ModalFooter,
  ModalHeader,
  btnPrimary,
  btnSecondary,
  fieldInput,
  fieldLabel,
} from "../ui/Modal";

export default function EditSubtopicModal({ subtopic, onClose, onUpdated }) {
  const [title, setTitle] = useState(subtopic.title);
  const [sortOrder, setSortOrder] = useState(subtopic.sort_order ?? 0);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);

      const { error } = await supabase
        .from("checklist_subtopics")
        .update({ title, sort_order: Number(sortOrder) })
        .eq("id", subtopic.id);

      if (error) throw error;

      toast.success("Subtopic updated");
      onUpdated();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update subtopic");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal onClose={onClose} size="md" labelledBy="edit-subtopic-title">
      <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
        <ModalHeader
          id="edit-subtopic-title"
          title="Edit subtopic"
          subtitle="Renaming keeps any progress already ticked for learners."
          onClose={onClose}
        />
        <ModalBody className="space-y-4">
          <div>
            <label htmlFor="subtopic-title" className={fieldLabel}>
              Subtopic name
            </label>
            <input
              id="subtopic-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Equivalent fractions"
              required
              autoFocus
              className={fieldInput}
            />
          </div>
          <div>
            <label htmlFor="subtopic-order" className={fieldLabel}>
              Position
            </label>
            <input
              id="subtopic-order"
              type="number"
              inputMode="numeric"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className={fieldInput}
            />
            <p className="mt-1.5 text-xs text-slate-500">
              Lower numbers appear first.
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <button type="button" onClick={onClose} className={btnSecondary}>
            Cancel
          </button>
          <button type="submit" disabled={loading} className={btnPrimary}>
            {loading ? "Saving…" : "Save changes"}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
