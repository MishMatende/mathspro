// src/components/adminModals/CreateTestModal.jsx

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";
import {
  FileText,
  CalendarDays,
  GraduationCap,
  ClipboardList,
  X,
} from "lucide-react";

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
      <div
        className="
    fixed inset-0
    bg-black/40
    backdrop-blur-sm
    z-40
  "
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="
max-w-2xl
bg-white
rounded-3xl
shadow-2xl
overflow-hidden
"
          onClick={(e) => e.stopPropagation()}
        >
          {/* HEADER */}
          <div className="px-6 pt-6 pb-5 border-b border-slate-100">
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <div
                  className="
          h-12 w-12
          rounded-2xl
          bg-orange-100
          text-orange-600
          flex items-center justify-center
        "
                >
                  <FileText size={22} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Create Test
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    Assign a new test to a learner
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="
        h-10 w-10
        rounded-xl
        hover:bg-slate-100
        flex items-center justify-center
      "
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* FORM */}
          <form onSubmit={handleCreate} className="space-y-5">
            <div className="p-6 space-y-5">
              {/* TITLE */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <FileText size={15} />
                  Test Title <span className="text-red-600">*</span>
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
                  className="
w-full
rounded-2xl
border border-slate-200
bg-slate-50
px-4 py-3
text-sm
transition
focus:outline-none
focus:ring-4
focus:ring-orange-100
focus:border-orange-300
focus:bg-white
"
                  placeholder="e.g. Algebra Test 3"
                />
              </div>

              {/* LEARNER */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <GraduationCap size={15} />
                    Learner <span className="text-red-600">*</span>
                  </label>

                  <select
                    value={formData.learner_id}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        learner_id: e.target.value,
                      }))
                    }
                    className="
w-full
rounded-2xl
border border-slate-200
bg-slate-50
px-4 py-3
text-sm
transition
focus:outline-none
focus:ring-4
focus:ring-orange-100
focus:border-orange-300
focus:bg-white
"
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
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <CalendarDays size={15} />
                    Due Date <span className="text-red-600">*</span>
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
                    className="
w-full
rounded-2xl
border border-slate-200
bg-slate-50
px-4 py-3
text-sm
transition
focus:outline-none
focus:ring-4
focus:ring-orange-100
focus:border-orange-300
focus:bg-white
"
                  />
                </div>
              </div>

              {/* INSTRUCTIONS */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <ClipboardList size={15} />
                  Instructions <span className="text-red-600">*</span>
                </label>

                <textarea
                  rows={6}
                  value={formData.instructions}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      instructions: e.target.value,
                    }))
                  }
                  className="
w-full
rounded-2xl
border border-slate-200
bg-slate-50
px-4 py-3
text-sm
transition
focus:outline-none
focus:ring-4
focus:ring-orange-100
focus:border-orange-300
focus:bg-white
"
                  placeholder="Enter instructions for the learner..."
                />
              </div>

              {/* ACTIONS */}
              <div
                className="
    flex justify-end gap-3
    border-t border-slate-100
    px-6 py-4
    bg-white
    rounded-b-3xl
  "
              >
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="
      px-5 py-3
      rounded-2xl
      border border-slate-200
      hover:bg-slate-50
      transition
    "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="
      px-6 py-3
      rounded-2xl
      bg-orange-500
      text-white
      font-medium
      hover:bg-orange-600
      disabled:opacity-50
      transition
    "
                >
                  {loading ? "Creating..." : "Create Test"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
