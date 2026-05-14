// src/components/adminModals/EditLessonModal.jsx

import { useEffect, useState } from "react";

import { supabase } from "../../lib/supabase";

import toast from "react-hot-toast";

export default function EditLessonModal({ lesson, onClose, onUpdated }) {
  const [learners, setLearners] = useState([]);
  const [tutors, setTutors] = useState([]);

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    objective: "",
    notes: "",

    learner_id: "",
    tutor_id: "",

    lesson_date: "",
    start_time: "",
    end_time: "",

    status: "scheduled",

    struggles: "",
    next_action: "",
  });

  // 🔥 Prefill lesson
  useEffect(() => {
    if (lesson) {
      setForm({
        title: lesson.title || "",
        objective: lesson.objective || "",
        notes: lesson.notes || "",

        learner_id: lesson.learner_id || "",
        tutor_id: lesson.tutor_id || "",

        lesson_date: lesson.lesson_date || "",
        start_time: lesson.start_time || "",
        end_time: lesson.end_time || "",

        status: lesson.status || "scheduled",

        struggles: lesson.struggles || "",
        next_action: lesson.next_action || "",
      });
    }
  }, [lesson]);

  // 🔥 Fetch learners + tutors
  useEffect(() => {
    if (lesson) {
      fetchData();
    }
  }, [lesson]);

  const fetchData = async () => {
    const [learnersRes, tutorsRes] = await Promise.all([
      supabase.from("learners").select("*").order("name"),

      supabase.from("tutors").select("*").order("name"),
    ]);

    if (!learnersRes.error) {
      setLearners(learnersRes.data);
    }

    if (!tutorsRes.error) {
      setTutors(tutorsRes.data);
    }
  };

  // 🔥 Handle change
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // 🔥 Update lesson
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    const { error } = await supabase
      .from("lessons")
      .update({
        title: form.title,
        objective: form.objective,
        notes: form.notes,

        learner_id: form.learner_id,
        tutor_id: form.tutor_id,

        lesson_date: form.lesson_date,
        start_time: form.start_time,
        end_time: form.end_time,

        status: form.status,

        struggles: form.struggles,
        next_action: form.next_action,
      })
      .eq("id", lesson.id);

    setLoading(false);

    if (error) {
      console.log(error);

      toast.error("Failed to update lesson");

      return;
    }

    toast.success("Lesson updated");

    onUpdated();

    onClose();
  };

  if (!lesson) return null;

  return (
    <div
      className="
        fixed inset-0 z-50
        bg-black/40
        backdrop-blur-sm
        flex items-end sm:items-center justify-center
      "
    >
      <div
        className="
          w-full sm:w-175
          max-h-[95vh]
          overflow-y-auto
          bg-white
          rounded-t-3xl sm:rounded-3xl
          p-5 sm:p-6
        "
      >
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">Edit Lesson</h2>

            <p className="text-sm text-gray-400 mt-1">Update lesson details</p>
          </div>

          <button onClick={onClose} className="text-sm text-gray-500">
            Close
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* TITLE */}
          <div>
            <label className="text-sm font-medium">Lesson Title</label>

            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="
                mt-2 w-full
                border border-gray-200
                rounded-2xl
                px-4 py-3
                text-sm
              "
            />
          </div>

          {/* OBJECTIVE */}
          <div>
            <label className="text-sm font-medium">Objective</label>

            <textarea
              name="objective"
              value={form.objective}
              onChange={handleChange}
              rows={3}
              className="
                mt-2 w-full
                border border-gray-200
                rounded-2xl
                px-4 py-3
                text-sm
              "
            />
          </div>

          {/* NOTES */}
          <div>
            <label className="text-sm font-medium">Notes</label>

            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              className="
                mt-2 w-full
                border border-gray-200
                rounded-2xl
                px-4 py-3
                text-sm
              "
            />
          </div>

          {/* GRID */}
          <div className="grid sm:grid-cols-2 gap-4">
            {/* LEARNER */}
            <div>
              <label className="text-sm font-medium">Learner</label>

              <select
                name="learner_id"
                value={form.learner_id}
                onChange={handleChange}
                required
                className="
                  mt-2 w-full
                  border border-gray-200
                  rounded-2xl
                  px-4 py-3
                  text-sm
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

            {/* TUTOR */}
            <div>
              <label className="text-sm font-medium">Tutor</label>

              <select
                name="tutor_id"
                value={form.tutor_id}
                onChange={handleChange}
                required
                className="
                  mt-2 w-full
                  border border-gray-200
                  rounded-2xl
                  px-4 py-3
                  text-sm
                "
              >
                <option value="">Select tutor</option>

                {tutors.map((tutor) => (
                  <option key={tutor.id} value={tutor.id}>
                    {tutor.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* DATE + TIME */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Date</label>

              <input
                type="date"
                name="lesson_date"
                value={form.lesson_date}
                onChange={handleChange}
                required
                className="
                  mt-2 w-full
                  border border-gray-200
                  rounded-2xl
                  px-4 py-3
                  text-sm
                "
              />
            </div>

            <div>
              <label className="text-sm font-medium">Start Time</label>

              <input
                type="time"
                name="start_time"
                value={form.start_time}
                onChange={handleChange}
                required
                className="
                  mt-2 w-full
                  border border-gray-200
                  rounded-2xl
                  px-4 py-3
                  text-sm
                "
              />
            </div>

            <div>
              <label className="text-sm font-medium">End Time</label>

              <input
                type="time"
                name="end_time"
                value={form.end_time}
                onChange={handleChange}
                required
                className="
                  mt-2 w-full
                  border border-gray-200
                  rounded-2xl
                  px-4 py-3
                  text-sm
                "
              />
            </div>
          </div>

          {/* STATUS */}
          <div>
            <label className="text-sm font-medium">Status</label>

            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="
                mt-2 w-full
                border border-gray-200
                rounded-2xl
                px-4 py-3
                text-sm
              "
            >
              <option value="scheduled">Scheduled</option>

              <option value="completed">Completed</option>

              <option value="cancelled">Cancelled</option>

              <option value="needs_attention">Needs Attention</option>
            </select>
          </div>

          {/* STRUGGLES */}
          <div>
            <label className="text-sm font-medium">Struggles</label>

            <textarea
              name="struggles"
              value={form.struggles}
              onChange={handleChange}
              rows={3}
              className="
                mt-2 w-full
                border border-gray-200
                rounded-2xl
                px-4 py-3
                text-sm
              "
            />
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="
                px-4 py-2.5
                rounded-2xl
                border border-gray-200
                text-sm
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="
                px-5 py-2.5
                rounded-2xl
                bg-orange-500
                text-white
                text-sm
                font-medium
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
