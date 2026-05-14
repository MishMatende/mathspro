import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { checkLessonCollision } from "../../lib/checkLessonCollision";

export default function CreateLessonModal({ open, onClose, onCreated }) {
  const [learners, setLearners] = useState([]);

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    learner_id: "",
    tutor_id: "",
    title: "",
    objective: "",
    notes: "",
    lesson_date: "",
    start_time: "",
    end_time: "",
    is_recurring: false,
    recurring_rule: "weekly",
    recurring_until: "",
  });

  // 🔥 Fetch learners
  const fetchLearners = async () => {
    const { data, error } = await supabase
      .from("learners")
      .select(
        `
        id,
        name,
        tutor_id,
        tutors (
          id,
          name
        )
      `,
      )
      .order("name");

    if (error) {
      toast.error("Failed to fetch learners");

      return;
    }

    setLearners(data || []);
  };

  useEffect(() => {
    if (open) {
      fetchLearners();
    }
  }, [open]);

  // 🔥 Selected learner
  const selectedLearner = useMemo(() => {
    return learners.find((learner) => learner.id === formData.learner_id);
  }, [learners, formData.learner_id]);

  // 🔥 Auto-fill tutor
  useEffect(() => {
    if (selectedLearner?.tutor_id) {
      setFormData((prev) => ({
        ...prev,

        tutor_id: selectedLearner.tutor_id,
      }));
    }
  }, [selectedLearner]);

  // 🔥 Input handler
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,

      [e.target.name]: e.target.value,
    }));
  };

  // 🔥 Create lesson(s)
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const lessonsToInsert = [];

      const startDate = new Date(formData.lesson_date);

      // 🔥 NON-RECURRING
      if (!formData.is_recurring) {
        // 🔥 Collision check
        const collision = await checkLessonCollision({
          learner_id: formData.learner_id,

          tutor_id: formData.tutor_id,

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

          tutor_id: formData.tutor_id,

          title: formData.title,

          objective: formData.objective,

          notes: formData.notes,

          lesson_date: formData.lesson_date,

          start_time: formData.start_time,

          end_time: formData.end_time,

          status: "scheduled",

          is_recurring: false,

          recurring_rule: null,

          calendar_uid: uuidv4(),
        });
      }

      // 🔥 RECURRING
      else {
        const untilDate = new Date(formData.recurring_until);

        const interval = formData.recurring_rule === "biweekly" ? 14 : 7;

        for (
          let current = new Date(startDate);
          current <= untilDate;
          current.setDate(current.getDate() + interval)
        ) {
          const currentDate = current.toISOString().split("T")[0];

          // 🔥 Collision check
          const collision = await checkLessonCollision({
            learner_id: formData.learner_id,

            tutor_id: formData.tutor_id,

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

            tutor_id: formData.tutor_id,

            title: formData.title,

            objective: formData.objective,

            notes: formData.notes,

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

      // 🔥 INSERT
      const { data, error } = await supabase
        .from("lessons")
        .insert(lessonsToInsert)
        .select();

      setLoading(false);

      if (error) {
        console.log(error);

        toast.error("Failed to create lesson");

        return;
      }

      toast.success(
        `${data.length} lesson${data.length > 1 ? "s" : ""} scheduled`,
      );

      onCreated?.(data);

      onClose();

      // 🔥 Reset
      setFormData({
        learner_id: "",

        tutor_id: "",

        title: "",

        objective: "",

        notes: "",

        lesson_date: "",

        start_time: "",

        end_time: "",

        is_recurring: false,

        recurring_rule: "weekly",

        recurring_until: "",
      });
    } catch (err) {
      console.log(err);

      setLoading(false);

      toast.error("Something went wrong");
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
          w-full sm:w-150
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
              Create a new lesson for a learner
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

          {/* TUTOR */}
          <div>
            <label className="text-sm font-medium mb-1 block">
              Assigned Tutor
            </label>

            <input
              type="text"
              disabled
              value={selectedLearner?.tutors?.name || ""}
              className="
                w-full
                border border-gray-200
                rounded-2xl
                px-4 py-3
                bg-gray-50
              "
            />
          </div>

          {/* TITLE */}
          <div>
            <label className="text-sm font-medium mb-1 block">
              Lesson Title
            </label>

            <input
              type="text"
              name="title"
              placeholder="Algebra Revision"
              value={formData.title}
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

          {/* OBJECTIVE */}
          <div>
            <label className="text-sm font-medium mb-1 block">Objective</label>

            <textarea
              name="objective"
              placeholder="Understand quadratic equations..."
              value={formData.objective}
              onChange={handleChange}
              rows={3}
              className="
                w-full
                border border-gray-200
                rounded-2xl
                px-4 py-3
              "
            />
          </div>

          {/* DATE + TIME */}
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
                  setFormData({
                    ...formData,
                    is_recurring: e.target.checked,
                  })
                }
              />

              <span className="text-sm font-medium">Recurring lesson</span>
            </label>

            {formData.is_recurring && (
              <div className="grid sm:grid-cols-2 gap-4">
                {/* RULE */}
                <div>
                  <label className="text-sm font-medium">Repeat</label>

                  <select
                    value={formData.recurring_rule}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        recurring_rule: e.target.value,
                      })
                    }
                    className="
            mt-2 w-full
            border border-gray-200
            rounded-2xl
            px-4 py-3
            text-sm
          "
                  >
                    <option value="weekly">Weekly</option>

                    <option value="biweekly">Every 2 weeks</option>
                  </select>
                </div>

                {/* UNTIL */}
                <div>
                  <label className="text-sm font-medium">Repeat Until</label>

                  <input
                    type="date"
                    value={formData.recurring_until}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        recurring_until: e.target.value,
                      })
                    }
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
            )}
          </div>

          {/* NOTES */}
          <div>
            <label className="text-sm font-medium mb-1 block">Notes</label>

            <textarea
              name="notes"
              placeholder="Bring worksheets..."
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="
                w-full
                border border-gray-200
                rounded-2xl
                px-4 py-3
              "
            />
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
                transition
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
