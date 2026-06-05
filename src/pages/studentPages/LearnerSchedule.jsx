import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { getCache, setCache, clearCache } from "../../lib/cache";
import toast from "react-hot-toast";
import { RefreshCw } from "lucide-react";
import StudentLessonCalendar from "../../components/student/StudentLessonCalendar";

export default function LearnerSchedule() {
  const { user } = useAuth();
  const [learner, setLearner] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // 🔥 Fetch learner profile
  const fetchLearner = async (forceRefresh = false) => {
    if (!user) return;

    const cacheKey = `learner_profile_${user.id}`;

    // 1. Cache first
    const cachedLearner = getCache(cacheKey);

    if (cachedLearner) {
      setLearner(cachedLearner);

      return;
    }

    // 2. Fetch DB
    const { data, error } = await supabase
      .from("learners")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.log(error);

      return;
    }

    setLearner(data);

    // 3. Cache
    setCache(cacheKey, data);
  };

  // 🔥 Fetch learner lessons
  const fetchLessons = async (forceRefresh = false) => {
    if (!user) return;

    const cacheKey = `learner_schedule_${user.id}`;

    // 1. Cache first
    if (!forceRefresh) {
      const cachedLessons = getCache(cacheKey);

      if (cachedLessons) {
        setLessons(cachedLessons);
        setLoading(false);
        return;
      }
    }

    // 2. Fetch DB
    const { data, error } = await supabase
      .from("lessons")
      .select(
        `
        *,
        tutors (
          id,
          name
        )
      `,
      )
      .eq("learner_id", user.id)
      .order("lesson_date", {
        ascending: true,
      });

    setLoading(false);

    if (error) {
      console.log(error);

      toast.error("Failed to fetch lessons");

      return;
    }

    setLessons(data);

    // 3. Cache
    setCache(cacheKey, data);
  };

  const handleRefresh = async () => {
    if (!user) return;

    setRefreshing(true);

    try {
      clearCache(`learner_profile_${user.id}`);
      clearCache(`learner_schedule_${user.id}`);

      await fetchLearner(true);
      await fetchLessons(true);

      toast.success("Schedule refreshed");
    } catch (error) {
      console.log(error);
      toast.error("Failed to refresh schedule");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchLearner();

      fetchLessons();
    }
  }, [user]);

  // 🔥 Convert lessons to calendar events
  const events = useMemo(() => {
    return lessons.map((lesson) => ({
      id: lesson.id,

      title: `${lesson.title} • ${lesson.tutors?.name || ""}`,

      start: `${lesson.lesson_date}T${lesson.start_time}`,

      end: `${lesson.lesson_date}T${lesson.end_time}`,

      backgroundColor: lesson.color || "#f97316",

      borderColor: lesson.color || "#f97316",

      extendedProps: {
        objective: lesson.objective,

        tutor: lesson.tutors?.name,

        notes: lesson.notes,

        status: lesson.status,
      },
    }));
  }, [lessons]);

  return (
    <>
      <div className="flex items-center justify-between m-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">My Schedule</h1>

          <p className="text-sm text-gray-400">View your upcoming lessons</p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="
        flex items-center justify-center
        h-11 w-11
        rounded-xl
        border border-gray-200
        bg-white
        hover:bg-gray-50
        transition
        disabled:opacity-50
      "
        >
          <RefreshCw
            size={18}
            className={refreshing ? "animate-spin text-orange-500" : ""}
          />
        </button>
      </div>

      <StudentLessonCalendar
        lessons={lessons}
        onLessonClick={(lesson) => {
          setSelectedLesson(lesson);
        }}
      />

      {/* 🔥 LESSON MODAL */}
      {selectedLesson && (
        <div
          className="
            fixed inset-0 z-50
            bg-black/40
            backdrop-blur-sm
            flex items-end sm:items-center justify-center
            p-0 sm:p-4
          "
        >
          <div
            className="
              w-full sm:w-112.5
              bg-white
              rounded-t-3xl sm:rounded-3xl
              p-5
              max-h-[90vh]
              overflow-y-auto
            "
          >
            {/* TOP */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">
                  {selectedLesson.title}
                </h2>

                <p className="text-sm text-gray-500 mt-1 capitalize">
                  {selectedLesson.status || "Scheduled"}
                </p>
              </div>

              <button
                onClick={() => setSelectedLesson(null)}
                className="
                  text-sm
                  text-gray-500
                  hover:text-black
                  transition
                "
              >
                Close
              </button>
            </div>

            {/* INFO */}
            <div className="mt-6 space-y-5">
              {/* Tutor */}
              <div>
                <p className="text-xs uppercase text-gray-400 mb-1">Tutor</p>

                <p className="text-sm font-medium">
                  {selectedLesson.tutor || "-"}
                </p>
              </div>

              {/* Objective */}
              <div>
                <p className="text-xs uppercase text-gray-400 mb-1">
                  Objective
                </p>

                <p className="text-sm">
                  {selectedLesson.objective || "No objective"}
                </p>
              </div>

              {/* Notes */}
              <div>
                <p className="text-xs uppercase text-gray-400 mb-1">Notes</p>

                <p className="text-sm">{selectedLesson.notes || "No notes"}</p>
              </div>

              {/* Time */}
              <div>
                <p className="text-xs uppercase text-gray-400 mb-1">
                  Lesson Time
                </p>

                <p className="text-sm">{selectedLesson.start}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
