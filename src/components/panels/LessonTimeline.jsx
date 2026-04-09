import { useState } from "react";
import { lessons } from "../data/mockData";
import AddLessonModal from "../modals/AddLessonModal";
import { motion } from "framer-motion";
import { CheckCircle, AlertCircle, Plus } from "lucide-react";

const LessonTimeline = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
          Lesson History
        </h3>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 text-(--color-primary) text-sm font-medium cursor-pointer"
        >
          <Plus size={16} />
          Add Lesson
        </button>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line (smaller on mobile) */}
        <div className="absolute left-4 sm:left-5 top-0 bottom-0 w-0.5 bg-gray-200" />

        <div className="space-y-4 sm:space-y-6">
          {lessons.map((lesson) => {
            const isAchieved = lesson.achieved;

            return (
              <div key={lesson.id} className="relative pl-8 sm:pl-10">
                {/* Dot (smaller on mobile) */}
                <div
                  className={`absolute left-0 top-2 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold
                  ${
                    isAchieved
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {isAchieved ? (
                    <CheckCircle size={14} />
                  ) : (
                    <AlertCircle size={14} />
                  )}
                </div>

                {/* Card */}
                <div className="bg-white rounded-xl p-3 sm:p-5 shadow-sm w-full">
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
                      className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full w-fit
                      ${
                        isAchieved
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {isAchieved ? "Achieved" : "Not Achieved"}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="mt-2 sm:mt-3 space-y-2 text-xs sm:text-sm">
                    <div>
                      <span className="text-gray-500 font-medium">
                        Struggles:
                      </span>
                      <p className="text-gray-700">{lesson.struggles}</p>
                    </div>

                    <div>
                      <span className="text-gray-500 font-medium">
                        Next Step:
                      </span>
                      <p className="text-gray-700">{lesson.nextAction}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      <AddLessonModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </motion.div>
  );
};

export default LessonTimeline;
