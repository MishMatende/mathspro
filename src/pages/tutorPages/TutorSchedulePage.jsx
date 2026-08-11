// src/pages/tutor/TutorSchedulePage.jsx

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, RefreshCw, Plus } from "lucide-react";
import { supabase } from "../../lib/supabase";
import TutorLessonCalendar from "../../components/tutor/TutorLessonCalendar";
import LessonReviewModal from "../../components/tutorModals/LessonReviewModal";
import toast from "react-hot-toast";
import CreateTutorLessonModal from "../../components/tutorModals/CreateTutorLessonModal";
import { getCache, setCache, clearCache } from "../../lib/cache";
import { useAuth } from "../../context/AuthContext";

export default function TutorSchedulePage() {
  const { user } = useAuth();

  const [selectedLesson, setSelectedLesson] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [tutor, setTutor] = useState(null);

  const getCacheKey = (userId) => `tutor_lessons_cache_${userId}`;

  // 🔥 Load cached lessons immediately
  useEffect(() => {
    if (!user) return;

    const cached = getCache(getCacheKey(user.id));

    if (cached) {
      setLessons(cached);
      setLoading(false);

      // background refresh
      fetchLessons(false);
    } else {
      fetchLessons(true);
    }
  }, [user]);

  const fetchTutor = async () => {
    if (!user) return null;

    const cacheKey = `tutor_profile_${user.id}`;

    const cached = getCache(cacheKey);

    if (cached) {
      setTutor(cached);
      return cached;
    }

    const { data, error } = await supabase
      .from("tutors")
      .select("*")
      .eq("email", user.email)
      .single();

    if (error) throw error;

    setCache(cacheKey, data);

    setTutor(data);

    return data;
  };

  // 🔥 Fetch tutor lessons
  const fetchLessons = async (showLoader = true) => {
    if (!user) return;

    if (showLoader) {
      setLoading(true);
    }

    const cacheKey = getCacheKey(user.id);

    const tutorData = tutor || (await fetchTutor());

    if (!tutorData) {
      setLoading(false);
      toast.error("Tutor profile not found");
      return;
    }

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

    if (error) {
      setLoading(false);
      toast.error("Failed to fetch lessons");
      return;
    }

    setLessons(data || []);
    setCache(cacheKey, data || []);

    if (showLoader) {
      setLoading(false);
    }
  };

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

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="
      flex items-center gap-2
      px-4 py-2
      rounded-xl
      bg-orange-500
      text-white
      hover:bg-orange-600
      transition
    "
            >
              <Plus size={16} />
              Lesson
            </button>

            <button
              onClick={async () => {
                if (!user) return;

                clearCache(getCacheKey(user.id));

                await fetchLessons();

                toast.success("Schedule refreshed");
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
        onSaved={async () => {
          if (!user) return;

          clearCache(getCacheKey(user.id));
          await fetchLessons(false);
          setSelectedLesson(null);
        }}
      />

      <CreateTutorLessonModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={async () => {
          if (!user) return;

          clearCache(getCacheKey(user.id));

          await fetchLessons();

          setShowCreateModal(false);
        }}
      />
    </>
  );
}
