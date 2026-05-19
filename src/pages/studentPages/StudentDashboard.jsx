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
  ClipboardList,
  FileQuestion,
} from "lucide-react";
import { motion } from "framer-motion";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [nextLesson, setNextLesson] = useState(null);
  const [upcomingLessons, setUpcomingLessons] = useState([]);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [pendingHomework, setPendingHomework] = useState(0);
  const [pendingTests, setPendingTests] = useState(0);

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

      // Pending homework
      const homeworkPromise = supabase
        .from("homework")
        .select("*", { count: "exact", head: true })
        .eq("learner_id", user.id)
        .eq("status", "pending");

      // Pending tests
      const testsPromise = supabase
        .from("tests")
        .select("*", { count: "exact", head: true })
        .eq("learner_id", user.id)
        .eq("status", "pending");

      const [studentRes, upcomingRes, completedRes, homeworkRes, testsRes] =
        await Promise.all([
          studentPromise,
          upcomingPromise,
          completedPromise,
          homeworkPromise,
          testsPromise,
        ]);

      if (studentRes.error) throw studentRes.error;

      if (upcomingRes.error) throw upcomingRes.error;

      if (completedRes.error) throw completedRes.error;

      setStudent(studentRes.data);

      setUpcomingLessons(upcomingRes.data || []);

      setCompletedLessons(completedRes.data || []);

      setNextLesson(upcomingRes.data?.[0] || null);

      setPendingHomework(homeworkRes.count || 0);

      setPendingTests(testsRes.count || 0);
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
          {/* TOP CARDS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* NEXT LESSON */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="
      bg-linear-to-br
      from-orange-500
      to-orange-600
      rounded-3xl
      p-5
      text-white
      shadow-lg
    "
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 text-orange-100 text-sm mb-4">
                    <CalendarDays size={16} />
                    Next Lesson
                  </div>

                  {nextLesson ? (
                    <>
                      <h2 className="text-xl font-semibold">
                        {nextLesson.title || "Lesson"}
                      </h2>

                      <div className="mt-4 space-y-2 text-sm text-orange-50">
                        <div className="flex items-center gap-2">
                          <CalendarDays size={14} />
                          {nextLesson.lesson_date}
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock3 size={14} />
                          {nextLesson.start_time?.slice(0, 5)} -{" "}
                          {nextLesson.end_time?.slice(0, 5)}
                        </div>

                        <div className="flex items-center gap-2">
                          <User size={14} />
                          {nextLesson.tutors?.name}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <h2 className="text-lg font-semibold">
                        No upcoming lessons
                      </h2>

                      <p className="text-sm text-orange-100 mt-2">
                        Your next lesson will appear here.
                      </p>
                    </>
                  )}
                </div>

                <div
                  className="
          w-12 h-12
          rounded-2xl
          bg-white/15
          flex items-center justify-center
        "
                >
                  <BookOpen size={24} />
                </div>
              </div>
            </motion.div>

            {/* PENDING HOMEWORK */}
            <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Pending Homework</p>

                  <h3 className="text-3xl font-semibold mt-2">
                    {pendingHomework}
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
                  <ClipboardList size={22} />
                </div>
              </div>
            </div>

            {/* PENDING TESTS */}
            <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Pending Tests</p>

                  <h3 className="text-3xl font-semibold mt-2">
                    {pendingTests}
                  </h3>
                </div>

                <div
                  className="
          w-12 h-12
          rounded-2xl
          bg-blue-100
          text-blue-600
          flex items-center justify-center
        "
                >
                  <FileQuestion size={22} />
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
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">Lesson</h4>

                      <div className="mt-3 space-y-2 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <CalendarDays size={14} />
                          {lesson.lesson_date}
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock3 size={14} />
                          {lesson.start_time?.slice(0, 5)} -{" "}
                          {lesson.end_time?.slice(0, 5)}
                        </div>

                        <div className="flex items-center gap-2">
                          <User size={14} />
                          {lesson.tutors?.name}
                        </div>

                        {lesson.objective && (
                          <div className="pt-1 text-gray-600">
                            {lesson.objective}
                          </div>
                        )}
                      </div>
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
