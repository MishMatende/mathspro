// src/components/tutorModals/CreateTutorLessonModal.jsx

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { checkLessonCollision } from "../../lib/checkLessonCollision";

export default function CreateTutorLessonModal({ open, onClose, onCreated }) {
  const [learners, setLearners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tutorId, setTutorId] = useState(null);

  const [formData, setFormData] = useState({
    learner_id: "",
    lesson_date: "",
    start_time: "",
    end_time: "",
    is_recurring: false,
    recurring_rule: "weekly",
    recurring_until: "",
  });

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

      setTutorId(tutorData.id);

      const { data, error } = await supabase
        .from("learners")
        .select("id, name, tutor_id")
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

  const selectedLearner = useMemo(() => {
    return learners.find((learner) => learner.id === formData.learner_id);
  }, [learners, formData.learner_id]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const resetForm = () => {
    setFormData({
      learner_id: "",
      lesson_date: "",
      start_time: "",
      end_time: "",
      is_recurring: false,
      recurring_rule: "weekly",
      recurring_until: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedLearner) {
      toast.error("Please select a learner");
      return;
    }

    setLoading(true);

    try {
      const lessonsToInsert = [];

      const startDate = new Date(formData.lesson_date);

      if (!formData.is_recurring) {
        const collision = await checkLessonCollision({
          learner_id: formData.learner_id,
          tutor_id: tutorId,
          lesson_date: formData.lesson_date,
          start_time: formData.start_time,
          end_time: formData.end_time,
        });

        if (collision.collision) {
          toast.error("Schedule conflict detected for tutor or learner");

          setLoading(false);
          return;
        }

        lessonsToInsert.push({
          learner_id: formData.learner_id,
          tutor_id: tutorId,
          lesson_date: formData.lesson_date,
          start_time: formData.start_time,
          end_time: formData.end_time,
          status: "scheduled",
          is_recurring: false,
          recurring_rule: null,
          calendar_uid: uuidv4(),
        });
      } else {
        const untilDate = new Date(formData.recurring_until);

        const interval = formData.recurring_rule === "biweekly" ? 14 : 7;

        for (
          let current = new Date(startDate);
          current <= untilDate;
          current.setDate(current.getDate() + interval)
        ) {
          const currentDate = current.toISOString().split("T")[0];

          const collision = await checkLessonCollision({
            learner_id: formData.learner_id,
            tutor_id: tutorId,
            lesson_date: currentDate,
            start_time: formData.start_time,
            end_time: formData.end_time,
          });

          if (collision.collision) {
            toast.error(`Schedule conflict detected on ${currentDate}`);

            setLoading(false);
            return;
          }

          lessonsToInsert.push({
            learner_id: formData.learner_id,
            tutor_id: tutorId,
            lesson_date: currentDate,
            start_time: formData.start_time,
            end_time: formData.end_time,
            status: "scheduled",
            is_recurring: true,
            recurring_rule: formData.recurring_rule,
            calendar_uid: uuidv4(),
          });
        }
      }

      const { data, error } = await supabase
        .from("lessons")
        .insert(lessonsToInsert)
        .select();

      if (error) throw error;

      toast.success(
        `${data.length} lesson${data.length > 1 ? "s" : ""} scheduled`,
      );

      onCreated?.(data);

      resetForm();

      onClose();
    } catch (error) {
      console.log(error);
      toast.error("Failed to schedule lesson");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

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
            <h2 className="text-xl font-semibold">Schedule Lesson</h2>

            <p className="text-sm text-gray-400 mt-1">
              Create a lesson for one of your learners
            </p>
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
          {/* LEARNER */}
          <div>
            <label className="text-sm font-medium mb-1 block">Learner</label>

            <select
              name="learner_id"
              value={formData.learner_id}
              onChange={handleChange}
              required
              className="
                w-full
                border border-gray-200
                rounded-2xl
                px-4 py-3
                bg-white
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

          {/* DATE/TIME */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Date</label>

              <input
                type="date"
                name="lesson_date"
                value={formData.lesson_date}
                onChange={handleChange}
                required
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
                required
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
                required
                className="
                  w-full
                  border border-gray-200
                  rounded-2xl
                  px-4 py-3
                "
              />
            </div>
          </div>

          {/* RECURRING */}
          <div className="space-y-4">
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
                      mt-2 w-full
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
                      mt-2 w-full
                      border border-gray-200
                      rounded-2xl
                      px-4 py-3
                    "
                  />
                </div>
              </div>
            )}
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="
                px-5 py-3
                rounded-2xl
                border border-gray-200
                text-sm font-medium
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
                text-sm font-medium
                hover:bg-orange-600
              "
            >
              {loading ? "Scheduling..." : "Schedule Lesson"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
