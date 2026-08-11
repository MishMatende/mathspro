import { useEffect, useState } from "react";
import LessonReviewModal from "../tutorModals/LessonReviewModal";
import { motion } from "framer-motion";
import { CheckCircle, AlertCircle, RefreshCw, Plus } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { getCache, setCache, clearCache } from "../../lib/cache";
import CreateTutorLessonModal from "../tutorModals/CreateTutorLessonModal";
import {
  canReviewLesson,
  getLessonReviewDelayMessage,
} from "../../lib/lessonReview";

const LessonTimeline = ({ learnerId }) => {
  const { user } = useAuth();

  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // --------------------------------------------------
  // CACHE KEY
  // --------------------------------------------------

  const getCacheKey = () => `tutor_lessons_${learnerId}_${user?.id}`;

  // --------------------------------------------------
  // STATUS CONFIG
  // --------------------------------------------------

  const statusConfig = {
    scheduled: {
      label: "Scheduled",
      color: "bg-blue-100 text-blue-700",
      dot: "bg-blue-100 text-blue-600",
    },
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

  // --------------------------------------------------
  // FETCH LESSONS FROM SUPABASE
  // --------------------------------------------------

  const fetchLessons = async (showLoader = true) => {
    if (!learnerId || !user?.id) return;

    if (showLoader) {
      setLoading(true);
    }

    const { data, error } = await supabase
      .from("lessons")
      .select("*")
      .eq("learner_id", learnerId)
      .eq("tutor_id", user.id)
      .order("lesson_date", { ascending: false })
      .order("start_time", { ascending: false });

    if (error) {
      if (showLoader) {
        setLoading(false);
      }

      console.error("Failed to fetch lessons:", error);
      toast.error("Failed to load lessons");
      return;
    }

    const freshLessons = data || [];

    // Update UI
    setLessons(freshLessons);

    // Save fresh data to cache
    setCache(getCacheKey(), freshLessons);

    if (showLoader) {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // INITIAL LOAD
  // --------------------------------------------------

  useEffect(() => {
    if (!learnerId || !user?.id) return;

    const cacheKey = getCacheKey();
    const cachedLessons = getCache(cacheKey);

    if (cachedLessons) {
      // Show cached lessons immediately
      setLessons(cachedLessons);
      setLoading(false);

      // Refresh from Supabase in the background
      fetchLessons(false);
    } else {
      // No valid cache — fetch normally
      fetchLessons(true);
    }
  }, [learnerId, user?.id]);

  // --------------------------------------------------
  // MANUAL REFRESH
  // --------------------------------------------------

  const handleRefresh = async () => {
    if (!learnerId || !user?.id) return;

    setRefreshing(true);

    // Remove cached data
    clearCache(getCacheKey());

    // Fetch fresh data
    await fetchLessons(false);

    setRefreshing(false);

    toast.success("Lessons refreshed");
  };

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <>
      {/* MAIN TIMELINE */}
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
        {/* HEADER */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Lessons</h2>

            <p className="text-sm text-gray-500 mt-1">
              Review lesson history, feedback and student progress.
            </p>
          </div>

          <div className="flex gap-2">
            {/* CREATE LESSON */}
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
                cursor-pointer
              "
            >
              <Plus size={16} />
            </button>

            {/* REFRESH */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="
      flex items-center gap-2
      px-4 py-2
      rounded-xl
      border border-gray-200
      bg-white
      hover:bg-gray-50
      transition
      disabled:opacity-50
    "
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
            </button>
          </div>
        </div>

        {/* INFO BANNER */}
        <div
          className="
    flex items-start gap-3
    bg-blue-50
    border border-blue-100
    text-blue-700
    rounded-2xl
    px-4 py-3
    mb-6
  "
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" />

          <p className="text-sm">
            Tap on a lesson to add feedback and track student progress.
          </p>
        </div>

        {/* TIMELINE */}
        <div className="relative">
          {/* LOADING */}
          {loading && (
            <div className="text-sm text-gray-400">Loading lessons...</div>
          )}

          {/* EMPTY STATE */}
          {!loading && lessons.length === 0 && (
            <div
              className="
                bg-white
                rounded-xl
                p-8
                text-center
                text-sm
                text-gray-400
                border border-gray-100
              "
            >
              No lessons found for this learner
            </div>
          )}

          {/* VERTICAL LINE */}
          {lessons.length > 0 && (
            <div
              className="
                absolute
                left-4 sm:left-5
                top-0
                bottom-0
                w-0.5
                bg-gray-200
              "
            />
          )}

          {/* LESSONS */}
          <div className="space-y-4 sm:space-y-6">
            {lessons.map((lesson) => {
              const status = lesson.status || "pending";

              const config = statusConfig[status] || statusConfig.pending;

              return (
                <div key={lesson.id} className="relative pl-8 sm:pl-10">
                  {/* TIMELINE DOT */}
                  <div
                    className={`
                      absolute
                      left-0
                      top-2
                      w-6 h-6
                      sm:w-8 sm:h-8
                      rounded-full
                      flex items-center justify-center
                      ${config.dot}
                    `}
                  >
                    {status === "completed" && <CheckCircle size={14} />}

                    {status === "needs_attention" && <AlertCircle size={14} />}

                    {status === "pending" && <span className="text-xs">•</span>}

                    {status === "scheduled" && (
                      <span className="text-xs">•</span>
                    )}
                  </div>

                  {/* LESSON CARD */}
                  <div
                    onClick={() => {
                      if (!canReviewLesson(lesson)) {
                        toast.error(getLessonReviewDelayMessage(lesson));
                        return;
                      }

                      setSelectedLesson(lesson);
                    }}
                    className="
                      bg-white
                      rounded-xl
                      p-3 sm:p-5
                      shadow-sm
                      w-full
                      cursor-pointer
                      transition
                      hover:shadow-md
                      hover:scale-[1.01]
                      active:scale-[0.98]
                    "
                  >
                    {/* TOP ROW */}
                    <div
                      className="
                        flex
                        flex-col
                        sm:flex-row
                        sm:justify-between
                        sm:items-start
                        gap-2
                        mb-2
                      "
                    >
                      <div>
                        <p
                          className="
                            font-semibold
                            text-gray-800
                            text-sm
                            sm:text-base
                          "
                        >
                          {lesson.objective}
                        </p>

                        <p
                          className="
                            text-xs
                            text-gray-400
                            mt-1
                          "
                        >
                          {lesson.lesson_date} •{" "}
                          {lesson.start_time?.slice(0, 5)}
                        </p>
                      </div>

                      {/* STATUS */}
                      <span
                        className={`
                          text-[10px]
                          sm:text-xs
                          px-2
                          py-0.5
                          rounded-full
                          w-fit
                          ${config.color}
                        `}
                      >
                        {config.label}
                      </span>
                    </div>

                    {/* CONTENT */}
                    <div
                      className="
                        mt-2
                        sm:mt-3
                        space-y-2
                        text-xs
                        sm:text-sm
                      "
                    >
                      {/* STRUGGLES */}
                      <div>
                        <span
                          className="
                            text-gray-500
                            font-medium
                          "
                        >
                          Struggles:
                        </span>

                        <p className="text-gray-700">
                          {lesson.struggles || "Not recorded"}
                        </p>
                      </div>

                      {/* NEXT STEP */}
                      <div>
                        <span
                          className="
                            text-gray-500
                            font-medium
                          "
                        >
                          Next Step:
                        </span>

                        <p className="text-gray-700">
                          {lesson.next_action || "Not recorded"}
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

      {/* --------------------------------------------------
          LESSON REVIEW MODAL
      -------------------------------------------------- */}

      <LessonReviewModal
        isOpen={!!selectedLesson}
        onClose={() => setSelectedLesson(null)}
        lesson={selectedLesson}
        onSaved={async () => {
          // Clear old cached lesson data
          clearCache(getCacheKey());

          // Fetch updated lesson data
          await fetchLessons(false);

          // Close modal
          setSelectedLesson(null);
        }}
      />

      {/* --------------------------------------------------
          CREATE LESSON MODAL
      -------------------------------------------------- */}

      <CreateTutorLessonModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={async () => {
          if (!user) return;

          // Clear old cache
          clearCache(getCacheKey());

          // Fetch newly created lesson
          await fetchLessons(false);

          // Close modal
          setShowCreateModal(false);
        }}
      />
    </>
  );
};

export default LessonTimeline;
