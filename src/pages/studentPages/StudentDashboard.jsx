import { useCallback, useEffect, useState } from "react";
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
  RefreshCw,
  Loader,
} from "lucide-react";
import StudentChecklistModal from "../../components/studentModals/StudentChecklistModal";

const CACHE_DURATION = 5 * 60 * 1000;

export default function StudentDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [nextLesson, setNextLesson] = useState(null);
  const [upcomingLessons, setUpcomingLessons] = useState([]);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [pendingHomework, setPendingHomework] = useState(0);
  const [pendingTests, setPendingTests] = useState(0);
  const [showChecklist, setShowChecklist] = useState(false);
  const [checklistProgress, setChecklistProgress] = useState({
    completed: 0,
    total: 0,
    percent: 0,
  });

  const formatDate = (date) => {
    if (!date) return "No date";

    const d = new Date(date);

    const day = String(d.getDate()).padStart(2, "0");

    const month = d.toLocaleString("en-GB", {
      month: "long",
    });

    const year = d.getFullYear();

    return `${day}-${month}-${year}`;
  };

  const fetchChecklistProgress = useCallback(async (learnerId) => {
    let levelId = "";

    const { data: assignment, error: assignmentError } = await supabase
      .from("learner_checklists")
      .select("level_id")
      .eq("learner_id", learnerId)
      .maybeSingle();

    if (assignmentError) throw assignmentError;

    levelId = assignment?.level_id || "";

    if (!levelId) {
      const { data: personalChecklist, error: personalChecklistError } =
        await supabase
          .from("checklist_levels")
          .select("id")
          .eq("learner_id", learnerId)
          .maybeSingle();

      if (personalChecklistError) throw personalChecklistError;

      levelId = personalChecklist?.id || "";
    }

    if (!levelId) {
      return {
        completed: 0,
        total: 0,
        percent: 0,
      };
    }

    const { data: topics, error: topicsError } = await supabase
      .from("checklist_topics")
      .select(
        `
        id,
        checklist_subtopics (
          id
        )
      `,
      )
      .eq("level_id", levelId);

    if (topicsError) throw topicsError;

    const subtopicIds = (topics || []).flatMap((topic) =>
      (topic.checklist_subtopics || []).map((subtopic) => subtopic.id),
    );

    if (subtopicIds.length === 0) {
      return {
        completed: 0,
        total: 0,
        percent: 0,
      };
    }

    const { count, error: progressError } = await supabase
      .from("learner_subtopic_progress")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("learner_id", learnerId)
      .eq("completed", true)
      .in("subtopic_id", subtopicIds);

    if (progressError) throw progressError;

    const completed = count || 0;
    const total = subtopicIds.length;

    return {
      completed,
      total,
      percent: total === 0 ? 0 : Math.round((completed / total) * 100),
    };
  }, []);

  // 🔥 Fetch dashboard data
  const fetchDashboard = useCallback(
    async (forceRefresh = false) => {
      if (!user) return;

      const cacheKey = `student_dashboard_${user.id}`;

      setLoading(true);

      if (!forceRefresh) {
        const cached = sessionStorage.getItem(cacheKey);

        if (cached) {
          const parsed = JSON.parse(cached);

          const isValid = Date.now() - parsed.timestamp < CACHE_DURATION;

          if (isValid) {
            setStudent(parsed.student);
            setUpcomingLessons(parsed.upcomingLessons);
            setCompletedLessons(parsed.completedLessons);
            setNextLesson(parsed.nextLesson);
            setPendingHomework(parsed.pendingHomework);
            setPendingTests(parsed.pendingTests);
            setChecklistProgress(
              parsed.checklistProgress || {
                completed: 0,
                total: 0,
                percent: 0,
              },
            );

            setLoading(false);
            return;
          }
        }
      }

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
          .select(
            `
    id,
    homework_submissions (
      id,
      status
    )
  `,
          )
          .eq("learner_id", user.id);

        //Pending Tests
        const testsPromise = supabase
          .from("tests")
          .select("*", {
            count: "exact",
            head: true,
          })
          .eq("learner_id", user.id)
          .eq("status", "pending");

        const checklistProgressPromise = fetchChecklistProgress(user.id);

        const [
          studentRes,
          upcomingRes,
          completedRes,
          homeworkRes,
          testsRes,
          checklistProgressRes,
        ] = await Promise.all([
          studentPromise,
          upcomingPromise,
          completedPromise,
          homeworkPromise,
          testsPromise,
          checklistProgressPromise,
        ]);

        const pendingHomeworkCount = (homeworkRes.data || []).filter((hw) => {
          const submission = hw.homework_submissions?.[0];

          return !submission || submission.status === "pending";
        }).length;

        if (homeworkRes.error) throw homeworkRes.error;
        if (studentRes.error) throw studentRes.error;
        if (upcomingRes.error) throw upcomingRes.error;
        if (completedRes.error) throw completedRes.error;
        if (testsRes.error) throw testsRes.error;

        setStudent(studentRes.data);
        setCompletedLessons(completedRes.data || []);
        setPendingHomework(pendingHomeworkCount);
        setPendingTests(testsRes.count || 0);
        setChecklistProgress(checklistProgressRes);

        const now = new Date();

        const futureLessons = (upcomingRes.data || []).filter((lesson) => {
          const lessonEnd = new Date(
            `${lesson.lesson_date}T${lesson.end_time}`,
          );

          return lessonEnd > now;
        });

        setUpcomingLessons(futureLessons);
        setNextLesson(futureLessons[0] || null);

        sessionStorage.setItem(
          cacheKey,
          JSON.stringify({
            timestamp: Date.now(),
            student: studentRes.data,
            completedLessons: completedRes.data || [],
            upcomingLessons: futureLessons,
            nextLesson: futureLessons[0] || null,
            pendingHomework: pendingHomeworkCount,
            pendingTests: testsRes.count || 0,
            checklistProgress: checklistProgressRes,
          }),
        );
      } catch (err) {
        console.log(err);

        toast.error("Failed to load dashboard");
      }

      setLoading(false);
    },
    [fetchChecklistProgress, user],
  );

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Welcome back
            {student?.name ? `, ${student.name.split(" ")[0]}` : ""}
            👋
          </h1>

          <p className="text-sm text-gray-400 mt-1">
            Track your lessons and progress
          </p>
        </div>

        <button
          onClick={() => {
            sessionStorage.removeItem(`student_dashboard_${user.id}`);

            fetchDashboard(true);
          }}
          disabled={loading}
          className="
      flex items-center gap-2
      px-3 py-2
      rounded-xl
      border border-gray-200
      bg-white
      hover:bg-gray-50
      transition
      disabled:opacity-50
    "
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="text-sm text-gray-400">Loading dashboard...</div>
      )}

      {!loading && (
        <>
          {/* NEXT LESSON */}
          {/* TOP CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* NEXT LESSON */}
            <div
              className="
      bg-linear-to-br
      from-orange-500
      to-orange-600
      rounded-3xl
      p-4
      text-white
      shadow-lg
      min-h-38
    "
            >
              <div className="flex h-full flex-col justify-between gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 text-orange-100 text-sm">
                    <CalendarDays size={16} />
                    Next Lesson
                  </div>

                  <div
                    className="
                      w-12 h-12
                      rounded-2xl
                      bg-white/15
                      flex items-center justify-center
                      shrink-0
                    "
                  >
                    <BookOpen size={22} />
                  </div>
                </div>

                {nextLesson ? (
                  <div>
                    <h2 className="text-lg font-semibold truncate">
                      {nextLesson.title || "Lesson"}
                    </h2>

                    <div className="mt-3 space-y-1.5 text-xs text-orange-50">
                      <div className="flex items-center gap-2">
                        <CalendarDays size={13} />
                        {formatDate(nextLesson.lesson_date)}
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock3 size={13} />
                        {nextLesson.start_time?.slice(0, 5)} -{" "}
                        {nextLesson.end_time?.slice(0, 5)}
                      </div>

                      <div className="flex items-center gap-2 truncate">
                        <User size={13} />
                        <span className="truncate">
                          {nextLesson.tutors?.name}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-lg font-semibold">
                      No upcoming lessons
                    </h2>

                    <p className="text-xs text-orange-100 mt-2">
                      Your next lesson will appear here.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* PENDING HOMEWORK */}
            <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm min-h-38">
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
            <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm min-h-38">
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
                  <CheckCircle2 size={22} />
                </div>
              </div>
            </div>

            {/* CHECKLIST PROGRESS */}
            <div
              className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm min-h-38 flex flex-col justify-between cursor-pointer"
              onClick={() => setShowChecklist(true)}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm text-gray-400">Progress</p>

                <div className="flex flex-col gap-2">
                  <div
                    className="
        w-12 h-12
        rounded-2xl
        bg-red-100
        text-red-600
        flex items-center justify-center
      "
                  >
                    <Loader size={22} />
                  </div>
                </div>
              </div>

              <div className="text-5xl font-black tracking-normal text-gray-900 flex items-end justify-between gap-3">
                {checklistProgress.percent}%
                <span className="text-2xl font-semibold text-gray-500 whitespace-nowrap">
                  {checklistProgress.completed}/{checklistProgress.total}
                </span>
              </div>
            </div>

            {/* ASSIGNED TUTOR */}
            <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm min-h-38">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Assigned Tutor</p>

                  <h3 className="text-lg font-semibold mt-2 text-gray-900">
                    {student?.tutors?.name || "Not Assigned"}
                  </h3>
                </div>

                <div
                  className="
        w-12 h-12
        rounded-2xl
        bg-purple-100
        text-purple-600
        flex items-center justify-center
      "
                >
                  <User size={22} />
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
                <div
                  key={lesson.id}
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
                          {formatDate(lesson.lesson_date)}
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
                </div>
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
                        {formatDate(lesson.lesson_date)}
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

      <StudentChecklistModal
        learnerId={user.id}
        isOpen={showChecklist}
        onClose={() => setShowChecklist(false)}
      />
    </div>
  );
}
