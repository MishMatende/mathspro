import { useState } from "react";
import LessonBlock from "../../components/tutor/LessonBlock";
import LessonReviewModal from "../../components/tutorModals/LessonReviewModal";
import {
  generateTimeSlots,
  getWeekDays,
} from "../../components/tutor/scheduleUtils";
import { schedule } from "../../components/data/mockData";
import { getSingleDay } from "../../components/tutor/scheduleUtils";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TutorSchedulePage = () => {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [view, setView] = useState("day");
  const [dayOffset, setDayOffset] = useState(0);
  const [direction, setDirection] = useState(null);

  const timeSlots = generateTimeSlots();
  const days = getWeekDays(weekOffset);

  // ✅ Pick current day (first day for now)
  const selectedDay = getSingleDay(dayOffset);

  return (
    <>
      <motion.div
        animate={{
          scale: selectedLesson ? 0.96 : 1,
          filter: selectedLesson ? "blur(6px)" : "blur(0px)",
          opacity: selectedLesson ? 0.85 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 220,
          damping: 25,
        }}
        style={{
          pointerEvents: selectedLesson ? "none" : "auto",
        }}
        className="p-3 sm:p-4 lg:p-6"
      >
        {/* HEADER */}
        <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs sm:text-sm rounded-lg px-3 py-2 mb-4">
          <Info size={16} className="mt-0.5" />
          <p>Access your schedule on this page.</p>
        </div>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
            📅 Schedule
          </h1>

          {/* WEEK NAV */}
          <div className="flex gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => {
                setDirection(-1);
                if (view === "day") {
                  setDayOffset((prev) => prev - 1);
                } else {
                  setWeekOffset((prev) => prev - 1);
                }
              }}
              className="p-2 rounded-lg border bg-white shadow-sm cursor-pointer hover:bg-gray-50 active:bg-gray-100"
            >
              <ChevronLeft size={18} />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => {
                setDirection(1);
                if (view === "day") {
                  setDayOffset((prev) => prev + 1);
                } else {
                  setWeekOffset((prev) => prev + 1);
                }
              }}
              className="p-2 rounded-lg border bg-white shadow-sm cursor-pointer hover:bg-gray-50"
            >
              <ChevronRight size={18} />
            </motion.button>
          </div>
        </div>

        {/* ✅ TABS */}
        <div className="flex gap-2 mb-4 bg-gray-100 p-1 rounded-lg w-fit">
          {["day", "week"].map((tab) => (
            <button
              key={tab}
              onClick={() => setView(tab)}
              className={`px-4 py-2 text-sm rounded-md capitalize cursor-pointer transition
              ${
                view === tab
                  ? "bg-white shadow-sm text-gray-800"
                  : "text-gray-500 hover:text-gray-700"
              }
            `}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* CALENDAR */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${view}-${view === "day" ? dayOffset : weekOffset}`}
            initial={{ x: direction * 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction * -40, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className={`${view === "week" ? "overflow-x-auto" : ""}`}>
              <div
                className={`${
                  view === "week" ? "min-w-175" : "w-full"
                } bg-white rounded-2xl shadow-sm border border-gray-100`}
              >
                {/* HEADER */}
                <div
                  className={`grid ${
                    view === "day"
                      ? "grid-cols-[60px_1fr]"
                      : "grid-cols-[60px_repeat(5,1fr)]"
                  } border-b bg-gray-50 rounded-t-2xl`}
                >
                  <div />

                  {view === "day" ? (
                    <div className="p-2 text-center text-sm font-medium text-gray-600">
                      {selectedDay.label}
                    </div>
                  ) : (
                    days.map((day, index) => (
                      <div
                        key={index}
                        className="p-2 text-center text-xs sm:text-sm font-medium text-gray-600"
                      >
                        {day.label}
                      </div>
                    ))
                  )}
                </div>

                {/* BODY */}
                <div
                  className={`grid ${
                    view === "day"
                      ? "grid-cols-[60px_1fr]"
                      : "grid-cols-[60px_repeat(5,1fr)]"
                  }`}
                >
                  {/* TIME */}
                  <div className="border-r border-gray-100">
                    {timeSlots.map((time, index) => (
                      <div
                        key={index}
                        className="h-16 sm:h-20 text-[10px] sm:text-xs text-gray-400 px-1 sm:px-1 pt-1"
                      >
                        {time}
                      </div>
                    ))}
                  </div>

                  {/* ✅ DAY VIEW */}
                  {view === "day" && (
                    <div className="relative border-r border-gray-100 bg-white">
                      {timeSlots.map((_, i) => (
                        <div
                          key={i}
                          className="h-16 sm:h-20 border-b border-gray-100"
                        />
                      ))}

                      {schedule
                        .filter((lesson) => lesson.date === selectedDay.date)
                        .map((lesson) => (
                          <LessonBlock
                            key={lesson.id}
                            lesson={lesson}
                            onClick={() => setSelectedLesson(lesson)}
                          />
                        ))}
                    </div>
                  )}

                  {/* ✅ WEEK VIEW */}
                  {view === "week" &&
                    days.map((day, dayIndex) => (
                      <div
                        key={dayIndex}
                        className="relative border-r border-gray-100 bg-white"
                      >
                        {timeSlots.map((_, i) => (
                          <div
                            key={i}
                            className="h-16 sm:h-20 border-b border-gray-100"
                          />
                        ))}

                        {schedule
                          .filter((lesson) => lesson.date === day.date)
                          .map((lesson) => (
                            <LessonBlock
                              key={lesson.id}
                              lesson={lesson}
                              onClick={() => setSelectedLesson(lesson)}
                            />
                          ))}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* REVIEW MODAL */}
      <LessonReviewModal
        isOpen={!!selectedLesson}
        onClose={() => setSelectedLesson(null)}
        lesson={selectedLesson}
      />
    </>
  );
};

export default TutorSchedulePage;
