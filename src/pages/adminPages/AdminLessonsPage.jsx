import { useEffect, useState } from "react";

import { supabase } from "../../lib/supabase";

import { CalendarDays, Plus, Clock3, User, Pencil } from "lucide-react";

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

  // 🔥 Fetch lessons
  const fetchLessons = async () => {
    setLoading(true);

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

    setLessons(data);
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

    fetchLessons();
  };

  return (
    <>
      <div className="p-4 lg:p-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <CalendarDays size={22} />

            <h1 className="text-xl font-semibold">Lessons</h1>
          </div>

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
                  self-end
                "
          >
            <Plus size={18} className="group-hover:rotate-90 transition-all" />
            Schedule Lesson
          </button>
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

        {/* GRID */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 mt-2">
          {lessons.map((lesson) => (
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
                    {lesson.title}
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    {lesson.objective || "No objective"}
                  </p>
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
                  <User size={15} />

                  <span>{lesson.learners?.name}</span>
                </div>

                {/* Tutor */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User size={15} />

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
        onCreated={fetchLessons}
      />

      {/* EDIT */}
      <EditLessonModal
        open={!!selectedLesson}
        lesson={selectedLesson}
        onClose={() => setSelectedLesson(null)}
        onUpdated={fetchLessons}
      />
    </>
  );
}
