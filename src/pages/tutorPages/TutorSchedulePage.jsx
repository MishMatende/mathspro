// src/pages/tutor/TutorSchedulePage.jsx

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, RefreshCw } from "lucide-react";
import { supabase } from "../../lib/supabase";
import TutorLessonCalendar from "../../components/tutor/TutorLessonCalendar";
import LessonReviewModal from "../../components/tutorModals/LessonReviewModal";
import toast from "react-hot-toast";

export default function TutorSchedulePage() {
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  const getCacheKey = (userId) => `tutor_lessons_cache_${userId}`;

  // 🔥 Load cached lessons immediately
  useEffect(() => {
    const loadCachedLessons = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const cacheKey = getCacheKey(user.id);

      try {
        const cached = localStorage.getItem(cacheKey);

        if (cached) {
          setLessons(JSON.parse(cached));
        }
      } catch (err) {
        console.log("Cache read error:", err);
      }
    };

    loadCachedLessons();
  }, []);

  // 🔥 Fetch tutor lessons
  const fetchLessons = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);

      return;
    }

    const cacheKey = getCacheKey(user.id);

    // 🔥 Find tutor record
    const { data: tutorData, error: tutorError } = await supabase
      .from("tutors")
      .select("*")
      .eq("email", user.email)
      .single();

    if (tutorError || !tutorData) {
      console.log(tutorError);

      toast.error("Tutor profile not found");

      setLoading(false);

      return;
    }

    // 🔥 Fetch tutor lessons
    const { data, error } = await supabase
      .from("lessons")
      .select(
        `
        *,
        learners (
          id,
          name
        )
      `,
      )
      .eq("tutor_id", tutorData.id)
      .order("lesson_date", {
        ascending: true,
      });

    setLoading(false);

    if (error) {
      console.log(error);

      toast.error("Failed to fetch lessons");

      return;
    }

    setLessons(data || []);

    try {
      localStorage.setItem(cacheKey, JSON.stringify(data || []));
    } catch (err) {
      console.log("Cache write error:", err);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  return (
    <>
      <motion.div
        animate={{
          scale: selectedLesson ? 0.985 : 1,
          filter: selectedLesson ? "blur(6px)" : "blur(0px)",
          opacity: selectedLesson ? 0.8 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 220,
          damping: 24,
        }}
        style={{
          pointerEvents: selectedLesson ? "none" : "auto",
        }}
        className="relative min-h-screen p-3 sm:p-4 lg:p-6"
      >
        {/* HEADER */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="
        flex h-11 w-11 items-center justify-center
        rounded-2xl
        bg-linear-to-br
        from-indigo-500
        to-violet-500
        text-white
        shadow-lg
      "
            >
              <CalendarDays size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                Schedule
              </h1>

              <p className="text-sm text-slate-500">
                View your upcoming lessons
              </p>
            </div>
          </div>

          <button
            onClick={async () => {
              const {
                data: { user },
              } = await supabase.auth.getUser();

              if (user) {
                localStorage.removeItem(getCacheKey(user.id));
              }

              fetchLessons();
            }}
            disabled={loading}
            className="
      flex items-center gap-2
      px-3 py-2
      rounded-xl
      border border-slate-200
      bg-white
      hover:bg-slate-50
      transition
      disabled:opacity-50
    "
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="text-sm text-slate-400">Loading lessons...</div>
        )}

        {/* CALENDAR */}
        {!loading && (
          <AnimatePresence mode="wait">
            <motion.div
              key="calendar"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.3,
              }}
            >
              <TutorLessonCalendar
                schedule={lessons}
                setSelectedLesson={setSelectedLesson}
              />
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>

      {/* MODAL */}
      <LessonReviewModal
        isOpen={!!selectedLesson}
        onClose={() => setSelectedLesson(null)}
        lesson={selectedLesson}
      />
    </>
  );
}
