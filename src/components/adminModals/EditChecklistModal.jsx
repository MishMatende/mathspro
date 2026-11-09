// src/components/adminModals/EditChecklistModal.jsx

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

export default function EditChecklistModal({ level, onClose, onUpdated }) {
  const [name, setName] = useState(level.name);
  const [sortOrder, setSortOrder] = useState(level.sort_order ?? 0);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);

      const { error } = await supabase
        .from("checklist_levels")
        .update({ name, sort_order: Number(sortOrder) })
        .eq("id", level.id);

      if (error) throw error;

      toast.success("Checklist updated");
      onUpdated();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update checklist");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal onClose={onClose} size="md" labelledBy="edit-checklist-title">
      <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
        <ModalHeader
          id="edit-checklist-title"
          title="Edit checklist"
          subtitle="Rename the checklist or change where it appears."
          onClose={onClose}
        />
        <ModalBody className="space-y-4">
          <div>
            <label htmlFor="checklist-name" className={fieldLabel}>
              Checklist name
            </label>
            <input
              id="checklist-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Grade 5"
              required
              autoFocus
              className={fieldInput}
            />
          </div>
          <div>
            <label htmlFor="checklist-order" className={fieldLabel}>
              Position
            </label>
            <input
              id="checklist-order"
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
