import { useEffect, useMemo, useState } from "react";

import { supabase } from "../../lib/supabase";

import { useAuth } from "../../context/AuthContext";

import toast from "react-hot-toast";

import {
  CalendarDays,
  BookOpen,
  Clock3,
  CheckCircle2,
  AlertCircle,
  User,
} from "lucide-react";

import { motion } from "framer-motion";

export default function StudentDashboard() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);

  const [student, setStudent] = useState(null);

  const [nextLesson, setNextLesson] = useState(null);

  const [upcomingLessons, setUpcomingLessons] = useState([]);

  const [completedLessons, setCompletedLessons] = useState([]);

  // 🔥 Fetch dashboard data
  const fetchDashboard = async () => {
    if (!user) return;

    setLoading(true);

    try {
      // 🔥 Student profile
      const studentPromise = supabase
        .from("learners")
        .select(
          `
          *,
          tutors (
            id,
            name
          )
        `,
        )
        .eq("id", user.id)
        .single();

      // 🔥 Upcoming lessons
      const upcomingPromise = supabase
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
        .gte("lesson_date", new Date().toISOString().split("T")[0])
        .order("lesson_date", {
          ascending: true,
        })
        .order("start_time", {
          ascending: true,
        })
        .limit(5);

      // 🔥 Completed lessons
      const completedPromise = supabase
        .from("lessons")
        .select("*")
        .eq("learner_id", user.id)
        .eq("status", "completed")
        .order("lesson_date", {
          ascending: false,
        })
        .limit(5);

      const [studentRes, upcomingRes, completedRes] = await Promise.all([
        studentPromise,
        upcomingPromise,
        completedPromise,
      ]);

      if (studentRes.error) throw studentRes.error;

      if (upcomingRes.error) throw upcomingRes.error;

      if (completedRes.error) throw completedRes.error;

      setStudent(studentRes.data);

      setUpcomingLessons(upcomingRes.data || []);

      setCompletedLessons(completedRes.data || []);

      setNextLesson(upcomingRes.data?.[0] || null);
    } catch (err) {
      console.log(err);

      toast.error("Failed to load dashboard");
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchDashboard();
  }, [user]);

  // 🔥 Metrics
  const stats = useMemo(() => {
    return {
      upcoming: upcomingLessons.length,

      completed: completedLessons.length,
    };
  }, [upcomingLessons, completedLessons]);

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Welcome back{student?.name ? `, ${student.name.split(" ")[0]}` : ""}{" "}
          👋
        </h1>

        <p className="text-sm text-gray-400 mt-1">
          Track your lessons and progress
        </p>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="text-sm text-gray-400">Loading dashboard...</div>
      )}

      {!loading && (
        <>
          {/* NEXT LESSON */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="
              bg-linear-to-br
              from-orange-500
              to-orange-600
              rounded-3xl
              p-6
              text-white
              shadow-lg
            "
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-orange-100 text-sm mb-3">
                  <CalendarDays size={16} />
                  Next Lesson
                </div>

                {nextLesson ? (
                  <>
                    <h2 className="text-2xl font-semibold leading-tight">
                      {nextLesson.title}
                    </h2>

                    <p className="text-orange-100 mt-2 text-sm">
                      {nextLesson.lesson_date} •{" "}
                      {nextLesson.start_time?.slice(0, 5)}
                    </p>

                    <div className="mt-4 flex items-center gap-2 text-sm">
                      <User size={15} />
                      {nextLesson.tutors?.name}
                    </div>
                  </>
                ) : (
                  <div>
                    <h2 className="text-xl font-semibold">
                      No upcoming lessons
                    </h2>

                    <p className="text-orange-100 text-sm mt-2">
                      Your next lesson will appear here.
                    </p>
                  </div>
                )}
              </div>

              <div
                className="
                w-14 h-14
                rounded-2xl
                bg-white/15
                flex items-center justify-center
              "
              >
                <BookOpen size={28} />
              </div>
            </div>
          </motion.div>

          {/* STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Upcoming */}
            <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Upcoming Lessons</p>

                  <h3 className="text-3xl font-semibold mt-2">
                    {stats.upcoming}
                  </h3>
                </div>

                <div
                  className="
                  w-12 h-12
                  rounded-2xl
                  bg-orange-100
                  text-orange-600
                  flex items-center justify-center
                "
                >
                  <Clock3 size={22} />
                </div>
              </div>
            </div>

            {/* Completed */}
            <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Completed Lessons</p>

                  <h3 className="text-3xl font-semibold mt-2">
                    {stats.completed}
                  </h3>
                </div>

                <div
                  className="
                  w-12 h-12
                  rounded-2xl
                  bg-green-100
                  text-green-600
                  flex items-center justify-center
                "
                >
                  <CheckCircle2 size={22} />
                </div>
              </div>
            </div>
          </div>

          {/* UPCOMING LESSONS */}
          <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-900">Upcoming Lessons</h3>

              <span className="text-xs text-gray-400">
                {upcomingLessons.length} lessons
              </span>
            </div>

            <div className="space-y-3">
              {upcomingLessons.length === 0 && (
                <div
                  className="
                  border border-dashed border-gray-200
                  rounded-2xl
                  p-8
                  text-center
                  text-sm text-gray-400
                "
                >
                  No upcoming lessons
                </div>
              )}

              {upcomingLessons.map((lesson) => (
                <motion.div
                  key={lesson.id}
                  whileHover={{ scale: 1.01 }}
                  className="
                    border border-gray-100
                    rounded-2xl
                    p-4
                    bg-gray-50
                  "
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {lesson.title}
                      </h4>

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
                    "
                    >
                      {lesson.status}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <CalendarDays size={14} />
                      {lesson.lesson_date}
                    </div>

                    <div className="flex items-center gap-1">
                      <Clock3 size={14} />
                      {lesson.start_time?.slice(0, 5)} -{" "}
                      {lesson.end_time?.slice(0, 5)}
                    </div>

                    <div className="flex items-center gap-1">
                      <User size={14} />
                      {lesson.tutors?.name}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* RECENT FEEDBACK */}
          <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-900">Recent Feedback</h3>
            </div>

            <div className="space-y-4">
              {completedLessons.length === 0 && (
                <div
                  className="
                  border border-dashed border-gray-200
                  rounded-2xl
                  p-8
                  text-center
                  text-sm text-gray-400
                "
                >
                  No completed lessons yet
                </div>
              )}

              {completedLessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="
                    border border-gray-100
                    rounded-2xl
                    p-4
                  "
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {lesson.title}
                      </h4>

                      <p className="text-xs text-gray-400 mt-1">
                        {lesson.lesson_date}
                      </p>
                    </div>

                    <div
                      className="
                      w-10 h-10
                      rounded-xl
                      bg-orange-100
                      text-orange-600
                      flex items-center justify-center
                    "
                    >
                      <AlertCircle size={18} />
                    </div>
                  </div>

                  {(lesson.struggles || lesson.next_action) && (
                    <div className="mt-4 space-y-3">
                      {lesson.struggles && (
                        <div>
                          <p className="text-xs uppercase text-gray-400 mb-1">
                            Struggles
                          </p>

                          <p className="text-sm text-gray-700">
                            {lesson.struggles}
                          </p>
                        </div>
                      )}

                      {lesson.next_action && (
                        <div>
                          <p className="text-xs uppercase text-gray-400 mb-1">
                            Next Action
                          </p>

                          <p className="text-sm text-gray-700">
                            {lesson.next_action}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
