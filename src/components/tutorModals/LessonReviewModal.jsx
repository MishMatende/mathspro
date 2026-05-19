import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Target,
  StickyNote,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ClipboardCheck,
  X,
} from "lucide-react";

export default function LessonReviewModal({ isOpen, onClose, lesson }) {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    objective: "",
    notes: "",
    struggles: "",
    nextAction: "",
    recurring_rule: "",
    achieved: "yes",
  });

  useEffect(() => {
    if (!lesson) return;

    setFormData({
      title: lesson.title || "",
      objective: lesson.objective || "",
      notes: lesson.notes || "",
      struggles: lesson.struggles || "",
      nextAction: lesson.next_action || "",
      recurring_rule: lesson.recurring_rule || "",
      achieved: lesson.status === "needs_attention" ? "no" : "yes",
    });
  }, [lesson]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    let status = "pending";

    if (formData.achieved === "yes") {
      status = "completed";
    }

    if (formData.achieved === "no") {
      status = "needs_attention";
    }

    console.log({
      ...formData,
      status,
    });

    setTimeout(() => {
      setLoading(false);

      onClose();
    }, 600);
  };

  const isAchieved = formData.achieved === "yes";

  if (!lesson) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="
          fixed inset-0 z-50
          flex items-end sm:items-center justify-center
          bg-black/40
          backdrop-blur-sm
          p-0 sm:p-6
        "
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{
              opacity: 0,
              y: 30,
              scale: 0.97,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 20,
              scale: 0.97,
            }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 24,
            }}
            className="
            w-full sm:w-190
            max-h-[95vh]
            overflow-y-auto
            bg-white
            rounded-t-4xl sm:rounded-4xl
            shadow-[0_20px_80px_rgba(0,0,0,0.18)]
          "
          >
            {/* HEADER */}
            <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
              <div className="flex items-start justify-between gap-4">
                {/* LEFT */}
                <div>
                  <div
                    className="
                  mb-3
                  inline-flex items-center gap-2
                  rounded-full
                  bg-orange-50
                  px-3 py-1
                  text-xs
                  font-semibold
                  text-orange-600
                "
                  >
                    <Sparkles size={13} />
                    Lesson Review
                  </div>

                  <h2 className="text-2xl font-semibold text-slate-900">
                    Review Lesson
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Evaluate learner performance and define next steps.
                  </p>
                </div>

                {/* RIGHT */}
                <div className="flex items-center gap-3">
                  <div
                    className="
                  hidden sm:flex
                  h-12 w-12
                  items-center justify-center
                  rounded-2xl
                  bg-orange-500
                  text-white
                  shadow-lg shadow-orange-500/20
                "
                  >
                    <ClipboardCheck size={22} />
                  </div>

                  <button
                    onClick={onClose}
                    className="
                  flex h-10 w-10
                  items-center justify-center
                  rounded-xl
                  border border-slate-200
                  text-slate-500
                  transition-all
                  hover:bg-slate-50
                "
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5 px-5 py-5 sm:px-6 sm:py-6"
            >
              {/* TOP GRID */}
              <div className="grid gap-4 sm:grid-cols-2">
                {/* TITLE */}
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                    <BookOpen size={15} />
                    Lesson Title
                  </label>

                  <input
                    value={formData.title}
                    disabled
                    className="
                  w-full
                  rounded-2xl
                  border border-slate-200
                  bg-slate-50
                  px-4 py-3
                  text-sm
                  text-slate-700
                "
                  />
                </div>

                {/* RECURRING */}
                {formData.recurring_rule && (
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                      <RefreshCw size={15} />
                      Recurring Rule
                    </label>

                    <input
                      value={formData.recurring_rule}
                      disabled
                      className="
                    w-full
                    rounded-2xl
                    border border-slate-200
                    bg-slate-50
                    px-4 py-3
                    text-sm
                    text-slate-700
                  "
                    />
                  </div>
                )}
              </div>

              {/* OBJECTIVE */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Target size={15} />
                  Lesson Objective
                </label>

                <textarea
                  value={formData.objective}
                  disabled
                  rows={3}
                  className="
                w-full
                resize-none
                rounded-2xl
                border border-slate-200
                bg-slate-50
                px-4 py-3
                text-sm
                text-slate-700
              "
                />
              </div>

              {/* NOTES */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <StickyNote size={15} />
                  Lesson Notes
                </label>

                <textarea
                  value={formData.notes}
                  disabled
                  rows={4}
                  className="
                w-full
                resize-none
                rounded-2xl
                border border-slate-200
                bg-slate-50
                px-4 py-3
                text-sm
                text-slate-700
              "
                />
              </div>

              {/* ACHIEVED */}
              <div>
                <label className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <CheckCircle2 size={15} />
                  Was the objective achieved?
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  {/* YES */}
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        achieved: "yes",
                      })
                    }
                    className={`
                  rounded-2xl
                  border
                  p-4
                  text-left
                  transition-all

                  ${
                    isAchieved
                      ? `
                        border-green-200
                        bg-green-50
                      `
                      : `
                        border-slate-200
                        bg-white
                        hover:border-orange-200
                      `
                  }
                `}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`
                      mt-0.5
                      flex h-9 w-9
                      items-center justify-center
                      rounded-xl

                      ${
                        isAchieved
                          ? `
                            bg-green-100
                            text-green-600
                          `
                          : `
                            bg-slate-100
                            text-slate-500
                          `
                      }
                    `}
                      >
                        <CheckCircle2 size={18} />
                      </div>

                      <div>
                        <p
                          className={`font-semibold ${
                            isAchieved ? "text-green-700" : "text-slate-700"
                          }`}
                        >
                          Yes
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          Learner understood the lesson objective.
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* NO */}
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        achieved: "no",
                      })
                    }
                    className={`
                  rounded-2xl
                  border
                  p-4
                  text-left
                  transition-all

                  ${
                    !isAchieved
                      ? `
                        border-red-200
                        bg-red-50
                      `
                      : `
                        border-slate-200
                        bg-white
                        hover:border-orange-200
                      `
                  }
                `}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`
                      mt-0.5
                      flex h-9 w-9
                      items-center justify-center
                      rounded-xl

                      ${
                        !isAchieved
                          ? `
                            bg-red-100
                            text-red-600
                          `
                          : `
                            bg-slate-100
                            text-slate-500
                          `
                      }
                    `}
                      >
                        <AlertCircle size={18} />
                      </div>

                      <div>
                        <p
                          className={`font-semibold ${
                            !isAchieved ? "text-red-700" : "text-slate-700"
                          }`}
                        >
                          No
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          Learner needs more support and revision.
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* STRUGGLES */}
              {!isAchieved && (
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                    <AlertCircle size={15} />
                    Learner Struggles
                  </label>

                  <textarea
                    name="struggles"
                    placeholder="What areas did the learner struggle with?"
                    value={formData.struggles}
                    onChange={handleChange}
                    rows={4}
                    className="
                  w-full
                  resize-none
                  rounded-2xl
                  border border-slate-200
                  bg-white
                  px-4 py-3
                  text-sm
                  text-slate-700
                  outline-none
                  transition-all

                  focus:border-orange-400
                  focus:ring-4
                  focus:ring-orange-100
                "
                  />
                </div>
              )}

              {/* NEXT ACTION */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <ArrowRight size={15} />
                  Next Action
                </label>

                <textarea
                  name="nextAction"
                  placeholder="What should happen next?"
                  value={formData.nextAction}
                  onChange={handleChange}
                  rows={4}
                  className="
                w-full
                resize-none
                rounded-2xl
                border border-slate-200
                bg-white
                px-4 py-3
                text-sm
                text-slate-700
                outline-none
                transition-all

                focus:border-orange-400
                focus:ring-4
                focus:ring-orange-100
              "
                />
              </div>

              {/* FOOTER */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="
                rounded-2xl
                border border-slate-200
                px-5 py-2.5
                text-sm
                font-medium
                text-slate-700
                transition-all
                hover:bg-slate-50
              "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="
                rounded-2xl
                bg-orange-500
                px-5 py-2.5
                text-sm
                font-medium
                text-white
                shadow-lg shadow-orange-500/20
                transition-all
                hover:bg-orange-600
              "
                >
                  {loading ? "Saving..." : "Save Review"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
