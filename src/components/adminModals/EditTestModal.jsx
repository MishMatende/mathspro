// src/components/adminModals/EditTestModal.jsx

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

export default function EditTestModal({ test, onClose, onUpdated }) {
  const [loading, setLoading] = useState(false);
  const [learners, setLearners] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    instructions: "",
    learner_id: "",
    due_date: "",
  });

  useEffect(() => {
    if (test) {
      setFormData({
        title: test.title || "",
        instructions: test.instructions || "",
        learner_id: test.learner_id || "",
        due_date: test.due_date || "",
      });
    }

    loadLearners();
  }, [test]);

  const loadLearners = async () => {
    const { data, error } = await supabase
      .from("learners")
      .select("id,name,tutor_id")
      .order("name");

    if (error) {
      toast.error("Failed to load learners");
      return;
    }

    setLearners(data || []);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.learner_id || !formData.due_date) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);

      const learner = learners.find((l) => l.id === formData.learner_id);

      const { error } = await supabase
        .from("tests")
        .update({
          title: formData.title,
          instructions: formData.instructions,
          learner_id: learner.id,
          tutor_id: learner.tutor_id,
          due_date: formData.due_date,
        })
        .eq("id", test.id);

      if (error) throw error;

      toast.success("Test updated successfully");

      onUpdated?.();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to update test");
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
          onClick={(e) => e.stopPropagation()}
          className="
            max-w-3xl
            bg-white
            rounded-3xl
            shadow-2xl
            overflow-hidden
            max-h-[90vh]
            flex
            flex-col
          "
        >
          {/* HEADER */}
          <div className="px-6 py-5 border-b border-slate-100">
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
                    Edit Test
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    Update test details
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
                  transition
                "
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* BODY */}
          <form
            onSubmit={handleUpdate}
            className="
              flex-1
              overflow-y-auto
              p-6
              space-y-5
            "
          >
            {/* TITLE */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Test Title
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
                  h-12
                  rounded-2xl
                  border border-slate-200
                  px-4
                  bg-slate-50
                  focus:bg-white
                  focus:outline-none
                  focus:ring-2
                  focus:ring-orange-200
                "
              />
            </div>

            {/* LEARNER + DATE */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <GraduationCap size={15} />
                  Learner
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
                    h-12
                    rounded-2xl
                    border border-slate-200
                    px-4
                    bg-slate-50
                    focus:bg-white
                    focus:outline-none
                    focus:ring-2
                    focus:ring-orange-200
                  "
                >
                  {learners.map((learner) => (
                    <option key={learner.id} value={learner.id}>
                      {learner.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <CalendarDays size={15} />
                  Due Date
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
                    h-12
                    rounded-2xl
                    border border-slate-200
                    px-4
                    bg-slate-50
                    focus:bg-white
                    focus:outline-none
                    focus:ring-2
                    focus:ring-orange-200
                  "
                />
              </div>
            </div>

            {/* INSTRUCTIONS */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <ClipboardList size={15} />
                Instructions
              </label>

              <textarea
                rows={8}
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
                  px-4 py-3
                  bg-slate-50
                  resize-none
                  focus:bg-white
                  focus:outline-none
                  focus:ring-2
                  focus:ring-orange-200
                "
              />
            </div>

            {/* FOOTER */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
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
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
