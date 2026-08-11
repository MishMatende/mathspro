import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import {
  Users,
  GraduationCap,
  RefreshCw,
  BookOpenCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { getCache, setCache, clearCache } from "../../lib/cache";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    learners: 0,
    tutors: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [selectedTutorId, setSelectedTutorId] = useState("all");
  const [showLessonDetails, setShowLessonDetails] = useState(false);

  const fetchStats = async (forceRefresh = false) => {
    setLoading(true);

    try {
      const cacheKey = "admin_dashboard_data";

      // Cache first
      if (!forceRefresh) {
        const cachedDashboard = getCache(cacheKey);

        if (cachedDashboard) {
          setStats(cachedDashboard.stats);
          setTutors(cachedDashboard.tutors || []);
          setCompletedLessons(cachedDashboard.completedLessons || []);
          setLoading(false);
          return;
        }
      }

      const today = new Date();
      const todayDate = today.toISOString().split("T")[0];

      const [learnersRes, tutorsRes, lessonsRes] = await Promise.all([
        supabase.from("learners").select("*", {
          count: "exact",
          head: true,
        }),

        supabase.from("tutors").select("id,name").order("name"),

        supabase
          .from("lessons")
          .select(
            `
              id,
              title,
              lesson_date,
              end_time,
              tutor_id,
              tutors ( name )
            `,
          )
          .eq("status", "completed")
          .lte("lesson_date", todayDate)
          .order("lesson_date", { ascending: false }),
      ]);

      if (learnersRes.error) throw learnersRes.error;
      if (tutorsRes.error) throw tutorsRes.error;
      if (lessonsRes.error) throw lessonsRes.error;

      const pastCompletedLessons = (lessonsRes.data || []).filter((lesson) => {
        const lessonEnd = new Date(
          `${lesson.lesson_date}T${String(lesson.end_time).slice(0, 8)}`,
        );

        return !Number.isNaN(lessonEnd.getTime()) && lessonEnd < today;
      });

      const newStats = {
        learners: learnersRes.count || 0,
        tutors: tutorsRes.data?.length || 0,
      };

      setStats(newStats);
      setTutors(tutorsRes.data || []);
      setCompletedLessons(pastCompletedLessons);

      setCache(cacheKey, {
        stats: newStats,
        tutors: tutorsRes.data || [],
        completedLessons: pastCompletedLessons,
      });
    } catch (error) {
      console.log(error);
      toast.error("Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      clearCache("admin_dashboard_data");

      await fetchStats(true);

      toast.success("Dashboard refreshed");
    } catch (error) {
      console.log(error);
      toast.error("Failed to refresh dashboard");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const filteredLessons = completedLessons.filter((lesson) => {
    const isSelectedMonth = lesson.lesson_date?.startsWith(selectedMonth);
    const isSelectedTutor =
      selectedTutorId === "all" || lesson.tutor_id === selectedTutorId;

    return isSelectedMonth && isSelectedTutor;
  });

  const selectedMonthLabel = selectedMonth
    ? new Date(`${selectedMonth}-01T00:00:00`).toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
      })
    : "Selected month";

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold">Admin Dashboard</h1>

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
            className={`${
              refreshing ? "animate-spin text-orange-500" : "text-gray-600"
            }`}
          />
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Learners */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4"
        >
          <div className="p-3 rounded-xl bg-blue-50">
            <GraduationCap className="text-blue-600" size={20} />
          </div>

          <div>
            <p className="text-sm text-gray-500">Total Learners</p>

            <h2 className="text-xl font-semibold">
              {loading ? "..." : stats.learners}
            </h2>
          </div>
        </motion.div>

        {/* Tutors */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4"
        >
          <div className="p-3 rounded-xl bg-green-50">
            <Users className="text-green-600" size={20} />
          </div>

          <div>
            <p className="text-sm text-gray-500">Total Tutors</p>

            <h2 className="text-xl font-semibold">
              {loading ? "..." : stats.tutors}
            </h2>
          </div>
        </motion.div>
      </div>

      <section className="mt-6 w-full rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-violet-50 p-3">
              <BookOpenCheck className="text-violet-600" size={20} />
            </div>

            <div>
              <h2 className="font-semibold text-gray-800">Lessons Taught</h2>
              <p className="mt-1 text-sm text-gray-500">
                {filteredLessons.length} completed lesson{filteredLessons.length === 1 ? "" : "s"} in {selectedMonthLabel}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:w-auto">
            <label className="text-xs font-medium text-gray-500">
              Month
              <input
                type="month"
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
                className="mt-1 block w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-violet-400"
              />
            </label>

            <label className="text-xs font-medium text-gray-500">
              Tutor
              <select
                value={selectedTutorId}
                onChange={(event) => setSelectedTutorId(event.target.value)}
                className="mt-1 block w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-violet-400"
              >
                <option value="all">All tutors</option>
                {tutors.map((tutor) => (
                  <option key={tutor.id} value={tutor.id}>
                    {tutor.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
          <p className="text-sm text-gray-500">
            {showLessonDetails ? "Lesson details are shown below." : "Showing the total only."}
          </p>

          <button
            type="button"
            onClick={() => setShowLessonDetails((visible) => !visible)}
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-violet-700 hover:bg-violet-50"
          >
            {showLessonDetails ? "Hide lesson names" : "Show lesson names"}
            {showLessonDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {showLessonDetails && (
          <div className="mt-3 divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-100">
            {filteredLessons.length === 0 ? (
              <p className="p-4 text-center text-sm text-gray-400">
                No completed lessons match these filters.
              </p>
            ) : (
              filteredLessons.map((lesson) => (
                <div key={lesson.id} className="flex items-center justify-between gap-4 p-3 text-sm">
                  <div>
                    <p className="font-medium text-gray-800">{lesson.title || "Untitled lesson"}</p>
                    <p className="mt-0.5 text-xs text-gray-500">{lesson.tutors?.name || "Unknown tutor"}</p>
                  </div>
                  <time className="shrink-0 text-xs text-gray-500">
                    {new Date(`${lesson.lesson_date}T00:00:00`).toLocaleDateString(undefined, {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </time>
                </div>
              ))
            )}
          </div>
        )}
      </section>
    </div>
  );
}
