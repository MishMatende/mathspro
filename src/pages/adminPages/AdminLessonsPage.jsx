import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { getCache, setCache, clearCache } from "../../lib/cache";
import {
  CalendarDays,
  Plus,
  Clock3,
  UserRound,
  GraduationCap,
  Pencil,
  Filter,
  RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import CreateLessonModal from "../../components/adminModals/CreateLessonModal";
import EditLessonModal from "../../components/adminModals/EditLessonModal";
import AdminLessonsCalendar from "../../components/admin/AdminLessonsCalendar";

export default function AdminLessonsPage() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [dateFilter, setDateFilter] = useState("weekly");
  const [tutorFilter, setTutorFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  // 🔥 Fetch lessons
  const fetchLessons = async (forceRefresh = false) => {
    setLoading(true);

    const cacheKey = "admin_lessons";

    if (!forceRefresh) {
      const cachedLessons = getCache(cacheKey);

      if (cachedLessons) {
        setLessons(cachedLessons);
        setLoading(false);
        return;
      }
    }

    const { data, error } = await supabase
      .from("lessons")
      .select(
        `
      *,
      learners (
        id,
        name
      ),
      tutors (
        id,
        name
      )
    `,
      )
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

    setCache(cacheKey, data || []);
  };

  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      clearCache("admin_lessons");

      await fetchLessons(true);

      toast.success("Lessons refreshed");
    } catch (error) {
      console.log(error);

      toast.error("Failed to refresh lessons");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  // 🔥 Delete lesson
  const deleteLesson = async (id) => {
    const confirmDelete = confirm("Delete this lesson?");

    if (!confirmDelete) return;

    const loadingToast = toast.loading("Deleting lesson...");

    const { error } = await supabase.from("lessons").delete().eq("id", id);

    toast.dismiss(loadingToast);

    if (error) {
      toast.error("Failed to delete lesson");

      return;
    }

    toast.success("Lesson deleted");

    clearCache("admin_lessons");
    fetchLessons(true);
  };

  const today = new Date();

  const filteredLessons = lessons.filter((lesson) => {
    // ✅ Tutor filter
    const tutorMatch =
      tutorFilter === "all" || String(lesson.tutor_id) === String(tutorFilter);

    // ✅ Date filter
    const lessonDate = new Date(lesson.lesson_date);

    let dateMatch = true;

    if (dateFilter === "weekly") {
      const nextWeek = new Date();

      nextWeek.setDate(today.getDate() + 7);

      dateMatch = lessonDate >= today && lessonDate <= nextWeek;
    }

    if (dateFilter === "monthly") {
      const nextMonth = new Date();

      nextMonth.setMonth(today.getMonth() + 1);

      dateMatch = lessonDate >= today && lessonDate <= nextMonth;
    }

    return tutorMatch && dateMatch;
  });

  return (
    <>
      <div className="p-4 lg:p-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <CalendarDays size={22} />
            <h1 className="text-xl font-semibold">Lessons</h1>
          </div>

          <div className="flex items-center gap-2 self-end">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="
        h-12 w-12
        flex items-center justify-center
        rounded-2xl
        border border-slate-200
        bg-white
        hover:bg-slate-50
        transition
        disabled:opacity-50
      "
            >
              <RefreshCw
                size={18}
                className={
                  refreshing ? "animate-spin text-orange-500" : "text-slate-600"
                }
              />
            </button>

            <button
              onClick={() => setIsCreateOpen(true)}
              className="
        group
        flex items-center justify-center gap-2
        bg-white
        text-slate-900
        px-5 py-3.5
        rounded-2xl
        font-semibold
        shadow-lg
        hover:scale-[1.02]
        transition-all
      "
            >
              <Plus
                size={18}
                className="group-hover:rotate-90 transition-all"
              />
              Schedule Lesson
            </button>
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="text-sm text-gray-400">Loading lessons...</div>
        )}

        {/* EMPTY */}
        {!loading && lessons.length === 0 && (
          <div
            className="
              bg-white border
              rounded-3xl
              p-10
              text-center
            "
          >
            <CalendarDays size={40} className="mx-auto text-gray-300 mb-3" />

            <h3 className="font-semibold text-gray-800">
              No lessons scheduled
            </h3>

            <p className="text-sm text-gray-400 mt-1">
              Create your first lesson
            </p>
          </div>
        )}

        <AdminLessonsCalendar
          lessons={lessons}
          onUpdated={fetchLessons}
          onLessonClick={(lesson) => {
            setSelectedLesson(lesson);
          }}
        />

        {/* FILTERS */}
        <div
          className="
    mt-8 mb-5
    flex flex-col lg:flex-row
    lg:items-center lg:justify-between
    gap-4
  "
        >
          {/* LEFT */}
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-slate-500" />

            <h2 className="font-semibold text-slate-800">Upcoming Lessons</h2>
          </div>

          {/* FILTER CONTROLS */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* WEEKLY / MONTHLY */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="
        px-4 py-3
        rounded-2xl
        border border-slate-200
        bg-white
        text-sm
        font-medium
        shadow-sm
      "
            >
              <option value="weekly">This Week</option>

              <option value="monthly">This Month</option>
            </select>

            {/* TUTOR FILTER */}
            <select
              value={tutorFilter}
              onChange={(e) => setTutorFilter(e.target.value)}
              className="
        px-4 py-3
        rounded-2xl
        border border-slate-200
        bg-white
        text-sm
        font-medium
        shadow-sm
      "
            >
              <option value="all">All Tutors</option>

              {[
                ...new Map(
                  lessons.map((lesson) => [lesson.tutors?.id, lesson.tutors]),
                ).values(),
              ]
                .filter(Boolean)
                .map((tutor) => (
                  <option key={tutor.id} value={tutor.id}>
                    {tutor.name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* GRID */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 mt-2">
          {filteredLessons.map((lesson) => (
            <motion.div
              key={lesson.id}
              whileHover={{ scale: 1.01 }}
              className="
                bg-white
                border border-gray-100
                rounded-3xl
                p-5
                shadow-sm
              "
            >
              {/* TOP */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {lesson.title || "Lesson"}
                  </h3>
                </div>

                <span
                  className="
                    text-xs
                    px-2 py-1
                    rounded-full
                    bg-orange-100
                    text-orange-700
                    whitespace-nowrap
                  "
                >
                  {lesson.status}
                </span>
              </div>

              {/* META */}
              <div className="mt-5 space-y-3">
                {/* Learner */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <GraduationCap size={15} className="text-indigo-500" />

                  <span>{lesson.learners?.name}</span>
                </div>

                {/* Tutor */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <UserRound size={15} className="text-orange-500" />

                  <span>{lesson.tutors?.name}</span>
                </div>

                {/* Time */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock3 size={15} />

                  <span>
                    {lesson.lesson_date} • {lesson.start_time.slice(0, 5)}
                    {" - "}
                    {lesson.end_time.slice(0, 5)}
                  </span>
                </div>
              </div>

              {/* FOOTER */}
              <div className="mt-5 flex items-center justify-between">
                <div className="text-xs text-gray-400">
                  {lesson.is_recurring ? "Repeats weekly" : "One-time"}
                </div>

                <div className="flex items-center gap-3">
                  {/* EDIT */}
                  <button
                    onClick={() => setSelectedLesson(lesson)}
                    className="
                      flex items-center gap-1
                      text-sm
                      text-blue-600
                      hover:text-blue-700
                    "
                  >
                    <Pencil size={15} />
                    Edit
                  </button>

                  {/* DELETE */}
                  <button
                    onClick={() => deleteLesson(lesson.id)}
                    className="
                      text-sm
                      text-red-500
                      hover:text-red-600
                    "
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CREATE */}
      <CreateLessonModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={() => {
          clearCache("admin_lessons");
          fetchLessons(true);
        }}
      />

      <EditLessonModal
        open={!!selectedLesson}
        lesson={selectedLesson}
        onClose={() => setSelectedLesson(null)}
        onUpdated={() => {
          clearCache("admin_lessons");
          fetchLessons(true);
        }}
      />
    </>
  );
}
