// src/components/adminModals/CreateTestModal.jsx

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";

export default function CreateTestModal({ onClose, onCreated }) {
  const [loading, setLoading] = useState(false);
  const [learners, setLearners] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    instructions: "",
    learner_id: "",
    due_date: "",
  });

  useEffect(() => {
    loadLearners();
  }, []);

  const loadLearners = async () => {
    try {
      const { data, error } = await supabase
        .from("learners")
        .select(
          `
          id,
          name,
          tutor_id
        `,
        )
        .order("name");

      if (error) throw error;

      setLearners(data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load learners");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      if (!formData.title || !formData.learner_id || !formData.due_date) {
        toast.error("Please fill all required fields");
        return;
      }

      setLoading(true);

      const selectedLearner = learners.find(
        (learner) => learner.id === formData.learner_id,
      );

      if (!selectedLearner) {
        toast.error("Please select a learner");
        return;
      }

      const { error } = await supabase.from("tests").insert({
        title: formData.title,
        instructions: formData.instructions,
        learner_id: selectedLearner.id,
        tutor_id: selectedLearner.tutor_id,
        due_date: formData.due_date,
        status: "pending",
      });

      if (error) throw error;

      toast.success("Test created successfully");

      onCreated?.();
      onClose?.();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to create test");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* BACKDROP */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* MODAL */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-lg bg-white rounded-2xl shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* HEADER */}
          <div className="px-6 py-5 border-b">
            <h2 className="text-xl font-semibold">Create Test</h2>
            <p className="text-sm text-gray-500 mt-1">
              Assign a new test to a learner.
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleCreate} className="p-6 space-y-5">
            {/* TITLE */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Test Title *
              </label>

              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Algebra Test 3"
              />
            </div>

            {/* LEARNER */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Learner *
              </label>

              <select
                value={formData.learner_id}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    learner_id: e.target.value,
                  }))
                }
                className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select learner</option>

                {learners.map((learner) => (
                  <option key={learner.id} value={learner.id}>
                    {learner.name}
                  </option>
                ))}
              </select>
            </div>

            {/* DUE DATE */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Due Date *
              </label>

              <input
                type="date"
                value={formData.due_date}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    due_date: e.target.value,
                  }))
                }
                className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* INSTRUCTIONS */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Instructions
              </label>

              <textarea
                rows={5}
                value={formData.instructions}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    instructions: e.target.value,
                  }))
                }
                className="w-full border rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter instructions for the learner..."
              />
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 rounded-xl border hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Test"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
