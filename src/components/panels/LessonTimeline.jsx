import { useState } from "react";
import { lessons } from "../data/mockData";
import LessonReviewModal from "../tutorModals/LessonReviewModal";
import { motion } from "framer-motion";
import { CheckCircle, AlertCircle, Info } from "lucide-react";

const LessonTimeline = () => {
  const [selectedLesson, setSelectedLesson] = useState(null);

  const statusConfig = {
    pending: {
      label: "Pending",
      color: "bg-yellow-100 text-yellow-700",
      dot: "bg-yellow-100 text-yellow-600",
    },
    completed: {
      label: "Completed",
      color: "bg-green-100 text-green-700",
      dot: "bg-green-100 text-green-600",
    },
    needs_attention: {
      label: "Needs Attention",
      color: "bg-red-100 text-red-700",
      dot: "bg-red-100 text-red-600",
    },
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: selectedLesson ? 0.96 : 1,
          filter: selectedLesson ? "blur(6px)" : "blur(0px)",
        }}
        transition={{
          duration: 0.3,
          type: "spring",
          stiffness: 220,
          damping: 25,
        }}
        style={{
          pointerEvents: selectedLesson ? "none" : "auto",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
            Lesson History
          </h3>
        </div>

        {/* ✅ INFO BANNER */}
        <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs sm:text-sm rounded-lg px-3 py-2 mb-4">
          <Info size={16} className="mt-0.5" />
          <p>Tap on a lesson to add feedback and track student progress.</p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 sm:left-5 top-0 bottom-0 w-0.5 bg-gray-200" />

          <div className="space-y-4 sm:space-y-6">
            {lessons.map((lesson) => {
              const status = lesson.status || "pending";
              const config = statusConfig[status];

              return (
                <div key={lesson.id} className="relative pl-8 sm:pl-10">
                  {/* Dot */}
                  <div
                    className={`absolute left-0 top-2 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${config.dot}`}
                  >
                    {status === "completed" && <CheckCircle size={14} />}
                    {status === "needs_attention" && <AlertCircle size={14} />}
                    {status === "pending" && <span className="text-xs">•</span>}
                  </div>

                  {/* ✅ CLICKABLE CARD */}
                  <div
                    onClick={() => setSelectedLesson(lesson)}
                    className="bg-white rounded-xl p-3 sm:p-5 shadow-sm w-full cursor-pointer transition hover:shadow-md hover:scale-[1.01] active:scale-[0.98]"
                  >
                    {/* Top row */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                      <div>
                        <p className="font-semibold text-gray-800 text-sm sm:text-base">
                          {lesson.objective}
                        </p>

                        <p className="text-xs text-gray-400 mt-1">
                          {lesson.date}
                        </p>
                      </div>

                      {/* Status */}
                      <span
                        className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full w-fit ${config.color}`}
                      >
                        {config.label}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="mt-2 sm:mt-3 space-y-2 text-xs sm:text-sm">
                      <div>
                        <span className="text-gray-500 font-medium">
                          Struggles:
                        </span>
                        <p className="text-gray-700">
                          {lesson.struggles || "Not recorded"}
                        </p>
                      </div>

                      <div>
                        <span className="text-gray-500 font-medium">
                          Next Step:
                        </span>
                        <p className="text-gray-700">
                          {lesson.struggles || "Not recorded"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* ✅ REVIEW MODAL */}
      <LessonReviewModal
        isOpen={!!selectedLesson}
        onClose={() => setSelectedLesson(null)}
        lesson={selectedLesson}
      />
    </>
  );
};

export default LessonTimeline;
