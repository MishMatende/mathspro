import { useState, useEffect, useRef } from "react";
import LessonBlock from "../../components/tutor/LessonBlock";
import LessonReviewModal from "../../components/tutorModals/LessonReviewModal";
import {
  generateTimeSlots,
  getWeekDays,
  getSingleDay,
} from "../../components/tutor/scheduleUtils";
import { schedule } from "../../components/data/mockData";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TutorSchedulePage = () => {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [view, setView] = useState("day");
  const [dayOffset, setDayOffset] = useState(0);
  const [direction, setDirection] = useState(null);

  // Current time (updates every minute)
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const timeSlots = generateTimeSlots();
  const days = getWeekDays(weekOffset);
  const selectedDay = getSingleDay(dayOffset);

  // Convert time → vertical position
  const getCurrentTimePosition = () => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();

    const totalMinutes = hours * 60 + minutes;

    const startHour = 8;
    const minutesFromStart = totalMinutes - startHour * 60;

    const pxPerMinute = 80 / 60; // 1 hour ≈ 80px

    return Math.max(
      0,
      Math.min(minutesFromStart * pxPerMinute, timeSlots.length * 80),
    );
  };

  // Check if day is today
  const isToday = (date) => {
    const today = new Date();
    return new Date(date).toDateString() === today.toDateString();
  };

  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = getCurrentTimePosition() - 200;
    }
  }, [view, dayOffset, weekOffset]);

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

          {/* NAV */}
          <div className="flex gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => {
                setDirection(-1);
                view === "day"
                  ? setDayOffset((p) => p - 1)
                  : setWeekOffset((p) => p - 1);
              }}
              className="p-2 rounded-lg border bg-white shadow-sm hover:bg-gray-50"
            >
              <ChevronLeft size={18} />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => {
                setDirection(1);
                view === "day"
                  ? setDayOffset((p) => p + 1)
                  : setWeekOffset((p) => p + 1);
              }}
              className="p-2 rounded-lg border bg-white shadow-sm hover:bg-gray-50"
            >
              <ChevronRight size={18} />
            </motion.button>
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-2 mb-4 bg-gray-100 p-1 rounded-lg w-fit">
          {["day", "week"].map((tab) => (
            <button
              key={tab}
              onClick={() => setView(tab)}
              className={`px-4 py-2 text-sm rounded-md capitalize transition
              ${
                view === tab
                  ? "bg-white shadow-sm text-gray-800"
                  : "text-gray-500 hover:text-gray-700"
              }`}
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
            {/* SCROLL CONTAINER */}
            <div
              ref={containerRef}
              className="max-h-[70vh] overflow-y-auto scroll-smooth"
            >
              <div className={`${view === "week" ? "overflow-x-auto" : ""}`}>
                <div
                  className={`${
                    view === "week" ? "min-w-175" : "w-full"
                  } bg-white/80 backdrop-blur-md rounded-3xl shadow-lg border border-gray-200/60 overflow-hidden`}
                >
                  {/* HEADER */}
                  <div
                    className={`grid ${
                      view === "day"
                        ? "grid-cols-[60px_1fr]"
                        : "grid-cols-[60px_repeat(5,1fr)]"
                    } border-b border-gray-100 bg-gray-50`}
                  >
                    <div />

                    {view === "day" ? (
                      <div className="p-2 text-center text-sm font-medium text-gray-600">
                        {selectedDay.label}
                      </div>
                    ) : (
                      days.map((day, i) => (
                        <div key={i} className="p-2 text-center text-sm">
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
                    <div className="border-r">
                      {timeSlots.map((time, i) => (
                        <div
                          key={i}
                          className="h-20 text-[11px] text-gray-400 px-2 pt-2 font-medium"
                        >
                          {time}
                        </div>
                      ))}
                    </div>

                    {/* DAY VIEW */}
                    {view === "day" && (
                      <div className="relative">
                        {timeSlots.map((_, i) => (
                          <div
                            key={i}
                            className="h-20 border-b border-gray-100"
                          />
                        ))}

                        {/* TIME LINE */}
                        <div
                          className="absolute left-0 right-0 flex items-center pointer-events-none z-20"
                          style={{
                            top: getCurrentTimePosition(),
                            transition: "top 0.3s linear",
                          }}
                        >
                          {/* Dot */}
                          <div className="w-3 h-3 bg-red-500 rounded-full -ml-1.5 shadow-lg" />

                          {/* Line */}
                          <div className="flex-1 h-0.5 bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]" />
                        </div>

                        {schedule
                          .filter((l) => l.date === selectedDay.date)
                          .map((lesson) => (
                            <LessonBlock
                              key={lesson.id}
                              lesson={lesson}
                              onClick={() => setSelectedLesson(lesson)}
                            />
                          ))}
                      </div>
                    )}

                    {/* WEEK VIEW */}
                    {view === "week" &&
                      days.map((day, i) => {
                        const showLine = isToday(day.date);

                        return (
                          <div
                            key={i}
                            className={`relative border-r border-gray-100 hover:bg-gray-50/50 transition ${
                              isToday(day.date) ? "bg-blue-50/40" : "bg-white"
                            }`}
                          >
                            {timeSlots.map((_, j) => (
                              <div
                                key={j}
                                className="h-20 border-b border-gray-100"
                              />
                            ))}

                            {/* TODAY LINE */}
                            {showLine && (
                              <div
                                className="absolute left-0 right-0 flex items-center pointer-events-none"
                                style={{
                                  top: getCurrentTimePosition(),
                                  transition: "top 0.3s linear",
                                }}
                              >
                                <div className="w-2 h-2 bg-red-500 rounded-full -ml-1 shadow" />
                                <div className="flex-1 h-0.5 bg-red-500 shadow" />
                              </div>
                            )}

                            {schedule
                              .filter((l) => l.date === day.date)
                              .map((lesson) => (
                                <LessonBlock
                                  key={lesson.id}
                                  lesson={lesson}
                                  onClick={() => setSelectedLesson(lesson)}
                                />
                              ))}
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* MODAL */}
      <LessonReviewModal
        isOpen={!!selectedLesson}
        onClose={() => setSelectedLesson(null)}
        lesson={selectedLesson}
      />
    </>
  );
};

export default TutorSchedulePage;
