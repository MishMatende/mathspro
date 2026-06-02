// src/components/tutorModals/EditTutorLessonModal.jsx

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import { checkLessonCollision } from "../../lib/checkLessonCollision";

export default function EditTutorLessonModal({
  open,
  onClose,
  lesson,
  onUpdated,
}) {
  const [learners, setLearners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState({
    learner_id: "",
    lesson_date: "",
    start_time: "",
    end_time: "",
    is_recurring: false,
    recurring_rule: "weekly",
    recurring_until: "",
  });

  useEffect(() => {
    if (!open || !lesson) return;

    setFormData({
      learner_id: lesson.learner_id || "",
      lesson_date: lesson.lesson_date || "",
      start_time: lesson.start_time || "",
      end_time: lesson.end_time || "",
      is_recurring: lesson.is_recurring || false,
      recurring_rule: lesson.recurring_rule || "weekly",
      recurring_until: lesson.recurring_until || "",
    });
  }, [lesson, open]);

  const fetchLearners = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: tutorData, error: tutorError } = await supabase
        .from("tutors")
        .select("id")
        .eq("email", user.email)
        .single();

      if (tutorError || !tutorData) {
        toast.error("Tutor profile not found");
        return;
      }

      const { data, error } = await supabase
        .from("learners")
        .select("id, name")
        .eq("tutor_id", tutorData.id)
        .order("name");

      if (error) throw error;

      setLearners(data || []);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load learners");
    }
  };

  useEffect(() => {
    if (open) {
      fetchLearners();
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!lesson) return;

    setLoading(true);

    try {
      const collision = await checkLessonCollision({
        lessonId: lesson.id,
        learner_id: formData.learner_id,
        tutor_id: lesson.tutor_id,
        lesson_date: formData.lesson_date,
        start_time: formData.start_time,
        end_time: formData.end_time,
      });

      if (collision?.collision) {
        toast.error(
          `Conflict with another lesson from ${
            collision.lesson?.start_time || ""
          } to ${collision.lesson?.end_time || ""}`,
        );
        setLoading(false);
        return;
      }

      const { error } = await supabase
        .from("lessons")
        .update({
          learner_id: formData.learner_id,
          lesson_date: formData.lesson_date,
          start_time: formData.start_time,
          end_time: formData.end_time,
          is_recurring: formData.is_recurring,
          recurring_rule: formData.is_recurring
            ? formData.recurring_rule
            : null,
          recurring_until: formData.is_recurring
            ? formData.recurring_until || null
            : null,
        })
        .eq("id", lesson.id);

      if (error) throw error;

      toast.success("Lesson updated");

      onUpdated?.();

      onClose?.();
    } catch (error) {
      console.log(error);
      toast.error("Failed to update lesson");
    } finally {
      setLoading(false);
    }
  };

  const deleteLesson = async () => {
    try {
      const { error } = await supabase
        .from("lessons")
        .delete()
        .eq("id", lesson.id);

      if (error) throw error;

      toast.success("Lesson deleted");

      onUpdated?.();

      onClose?.();
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete lesson");
    }
  };

  if (!open || !lesson) return null;

  return (
    <div
      className="
        fixed inset-0 z-[60]
        bg-black/40
        backdrop-blur-sm
        flex items-end sm:items-center justify-center
      "
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="
          w-full sm:w-[600px]
          bg-white
          rounded-t-3xl sm:rounded-3xl
          p-5 sm:p-6
          max-h-[90vh]
          overflow-y-auto
        "
      >
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">Edit Lesson</h2>

            <p className="text-sm text-gray-400 mt-1">Update lesson details</p>
          </div>

          <button
            onClick={onClose}
            className="
              w-10 h-10
              rounded-xl
              border border-gray-200
              flex items-center justify-center
              hover:bg-gray-50
            "
          >
            <X size={18} />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Learner</label>

            <select
              name="learner_id"
              value={formData.learner_id}
              onChange={handleChange}
              className="
                w-full
                border border-gray-200
                rounded-2xl
                px-4 py-3
              "
            >
              {learners.map((learner) => (
                <option key={learner.id} value={learner.id}>
                  {learner.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Date</label>

              <input
                type="date"
                name="lesson_date"
                value={formData.lesson_date}
                onChange={handleChange}
                className="
                  w-full
                  border border-gray-200
                  rounded-2xl
                  px-4 py-3
                "
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                Start Time
              </label>

              <input
                type="time"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                className="
                  w-full
                  border border-gray-200
                  rounded-2xl
                  px-4 py-3
                "
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">End Time</label>

              <input
                type="time"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                className="
                  w-full
                  border border-gray-200
                  rounded-2xl
                  px-4 py-3
                "
              />
            </div>
          </div>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.is_recurring}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  is_recurring: e.target.checked,
                }))
              }
            />

            <span className="text-sm font-medium">Recurring lesson</span>
          </label>

          {formData.is_recurring && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Repeat</label>

                <select
                  value={formData.recurring_rule}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      recurring_rule: e.target.value,
                    }))
                  }
                  className="
                    mt-2
                    w-full
                    border border-gray-200
                    rounded-2xl
                    px-4 py-3
                  "
                >
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Every 2 weeks</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Repeat Until</label>

                <input
                  type="date"
                  value={formData.recurring_until}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      recurring_until: e.target.value,
                    }))
                  }
                  className="
                    mt-2
                    w-full
                    border border-gray-200
                    rounded-2xl
                    px-4 py-3
                  "
                />
              </div>
            </div>
          )}

          {/* FOOTER */}
          <div className="flex justify-between pt-4 gap-2">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="
                px-5 py-3
                rounded-2xl
                bg-red-50
                text-red-600
                font-medium
                hover:bg-red-100
              "
            >
              Delete Lesson
            </button>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="
                  px-5 py-3
                  rounded-2xl
                  border border-gray-200
                  font-medium
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
                  font-medium
                  hover:bg-orange-600
                "
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
      {showDeleteConfirm && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-[70]"
            onClick={() => setShowDeleteConfirm(false)}
          />

          <div className="fixed inset-0 z-[71] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-[90Vw] md:w-[40Vw] shadow-xl">
              <h3 className="text-lg font-semibold">Delete Lesson?</h3>

              <p className="text-sm text-gray-500 mt-2">
                This lesson will be permanently removed.
              </p>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="
              px-4 py-2
              rounded-xl
              border
            "
                >
                  Cancel
                </button>

                <button
                  onClick={deleteLesson}
                  className="
              px-4 py-2
              rounded-xl
              bg-red-500
              text-white
            "
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
