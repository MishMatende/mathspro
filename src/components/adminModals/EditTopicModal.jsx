// src/components/adminModals/EditTopicModal.jsx

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
        .update({ title, sort_order: Number(sortOrder) })
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
    <Modal onClose={onClose} size="md" labelledBy="edit-topic-title">
      <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
        <ModalHeader
          id="edit-topic-title"
          title="Edit topic"
          subtitle="Rename the topic or change where it appears."
          onClose={onClose}
        />
        <ModalBody className="space-y-4">
          <div>
            <label htmlFor="topic-title" className={fieldLabel}>
              Topic name
            </label>
            <input
              id="topic-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Fractions"
              required
              autoFocus
              className={fieldInput}
            />
          </div>
          <div>
            <label htmlFor="topic-order" className={fieldLabel}>
              Position
            </label>
            <input
              id="topic-order"
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
