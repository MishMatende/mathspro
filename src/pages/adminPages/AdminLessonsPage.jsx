import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { getCache, setCache, clearCache } from "../../lib/cache";
import { CalendarDays, Plus, Pencil, Filter, RefreshCw } from "lucide-react";
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
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const filteredLessons = lessons.filter((lesson) => {
    // ✅ Tutor filter
    const tutorMatch =
      tutorFilter === "all" || String(lesson.tutor_id) === String(tutorFilter);

    // ✅ Date filter
    const lessonDate = new Date(`${lesson.lesson_date}T00:00:00`);

    let dateMatch = true;

    if (dateFilter === "weekly") {
      const nextWeek = new Date(startOfToday);

      nextWeek.setDate(startOfToday.getDate() + 7);

      dateMatch = lessonDate >= startOfToday && lessonDate <= nextWeek;
    }

    if (dateFilter === "monthly") {
      const nextMonth = new Date(startOfToday);

      nextMonth.setMonth(startOfToday.getMonth() + 1);

      dateMatch = lessonDate >= startOfToday && lessonDate <= nextMonth;
    }

    if (dateFilter === "twoWeeks") {
      const twoWeeks = new Date(startOfToday);

      twoWeeks.setDate(startOfToday.getDate() + 14);

      dateMatch = lessonDate >= startOfToday && lessonDate <= twoWeeks;
    }

    if (dateFilter === "twoMonths") {
      const twoMonths = new Date(startOfToday);

      twoMonths.setMonth(startOfToday.getMonth() + 2);

      dateMatch = lessonDate >= startOfToday && lessonDate <= twoMonths;
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

              <option value="twoWeeks">Two Weeks</option>

              <option value="twoMonths">Two Months</option>
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

        {/* TABLE */}
        <div className="mt-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-230 text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Lesson</th>
                <th className="px-4 py-3 font-semibold">Learner</th>
                <th className="px-4 py-3 font-semibold">Tutor</th>
                <th className="px-4 py-3 font-semibold">Date & Time</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Schedule</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLessons.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-slate-400"
                  >
                    No upcoming lessons match these filters.
                  </td>
                </tr>
              ) : (
                filteredLessons.map((lesson) => (
                  <tr key={lesson.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {lesson.title || "Lesson"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {lesson.learners?.name || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {lesson.tutors?.name || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {lesson.lesson_date} · {lesson.start_time?.slice(0, 5)}–
                      {lesson.end_time?.slice(0, 5)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-orange-100 px-2 py-1 text-xs text-orange-700">
                        {lesson.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {lesson.is_recurring ? "Repeats weekly" : "One-time"}
                    </td>
                    {lesson.status != "completed" && (
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => setSelectedLesson(lesson)}
                            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                          >
                            <Pencil size={15} />
                            Edit
                          </button>
                          <button
                            onClick={() => deleteLesson(lesson.id)}
                            className="text-sm text-red-500 hover:text-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
