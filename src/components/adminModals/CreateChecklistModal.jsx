// src/components/adminModals/CreateChecklistModal.jsx

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

export default function CreateChecklistModal({ onClose, onCreated }) {
  const [name, setName] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);

      const { error } = await supabase.from("checklist_levels").insert({
        name,
        sort_order: Number(sortOrder),
      });

      if (error) throw error;

      toast.success("Checklist created");
      onCreated();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create checklist");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal onClose={onClose} size="md" labelledBy="create-checklist-title">
      <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
        <ModalHeader
          id="create-checklist-title"
          title="Create checklist"
          subtitle="Add a new checklist level, e.g. a grade or year group."
          onClose={onClose}
        />
        <ModalBody className="space-y-4">
          <div>
            <label htmlFor="new-checklist-name" className={fieldLabel}>
              Checklist name
            </label>
            <input
              id="new-checklist-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Grade 5"
              required
              autoFocus
              className={fieldInput}
            />
          </div>
          <div>
            <label htmlFor="new-checklist-order" className={fieldLabel}>
              Position
            </label>
            <input
              id="new-checklist-order"
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
            {loading ? "Creating…" : "Create checklist"}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
