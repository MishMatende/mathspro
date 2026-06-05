// src/pages/tutor/TutorDashboard.jsx

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

import {
  Users,
  BookOpen,
  FileText,
  AlertCircle,
  ClipboardList,
  Info,
  RefreshCw,
} from "lucide-react";

import Card from "../../components/Card";

const CACHE_DURATION = 5 * 60 * 1000; // 5 mins

export default function TutorDashboard() {
  const [loading, setLoading] = useState(true);

  const [dashboardData, setDashboardData] = useState({
    totalLearners: 0,
    weeklyUpcomingLessons: 0,
    unmarkedHomework: 0,
    pendingTests: 0,
    learners: [],
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async (forceRefresh = false) => {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const cacheKey = `dashboard_${user.id}`;

      // -------------------------
      // CACHE CHECK
      // -------------------------

      if (!forceRefresh) {
        const cached = sessionStorage.getItem(cacheKey);

        if (cached) {
          const parsed = JSON.parse(cached);

          const isValid = Date.now() - parsed.timestamp < CACHE_DURATION;

          if (isValid) {
            setDashboardData(parsed.data);
            setLoading(false);
            return;
          }
        }
      }

      const today = new Date();

      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      const formatDate = (date) => date.toISOString().split("T")[0];

      // -------------------------
      // FETCH EVERYTHING IN PARALLEL
      // -------------------------

      const [
        learnersCountResult,
        learnersListResult,
        lessonsCountResult,
        homeworkResult,
        testsResult,
      ] = await Promise.all([
        supabase
          .from("learners")
          .select("*", {
            count: "exact",
            head: true,
          })
          .eq("tutor_id", user.id),

        supabase
          .from("learners")
          .select("id,name")
          .eq("tutor_id", user.id)
          .order("name"),

        supabase
          .from("lessons")
          .select("lesson_date,start_time")
          .eq("tutor_id", user.id)
          .gte("lesson_date", formatDate(today))
          .lte("lesson_date", formatDate(endOfWeek)),

        supabase
          .from("homework_submissions")
          .select(
            `
            id,
            homework!inner(
              tutor_id
            )
          `,
          )
          .eq("marked", false)
          .eq("homework.tutor_id", user.id),

        supabase
          .from("tests")
          .select("id", {
            count: "exact",
            head: true,
          })
          .eq("tutor_id", user.id)
          .eq("status", "submitted"),
      ]);

      if (learnersCountResult.error) throw learnersCountResult.error;
      if (learnersListResult.error) throw learnersListResult.error;
      if (lessonsCountResult.error) throw lessonsCountResult.error;
      if (homeworkResult.error) throw homeworkResult.error;
      if (testsResult.error) throw testsResult.error;

      const weeklyUpcomingLessons =
        lessonsCountResult.data?.filter((lesson) => {
          const lessonDateTime = new Date(
            `${lesson.lesson_date}T${lesson.start_time}`,
          );

          return lessonDateTime > new Date();
        }).length || 0;

      const data = {
        totalLearners: learnersCountResult.count || 0,
        weeklyUpcomingLessons,
        unmarkedHomework: homeworkResult.data?.length || 0,
        pendingTests: testsResult.count || 0,
        learners: learnersListResult.data || [],
      };

      // -------------------------
      // SAVE CACHE
      // -------------------------

      sessionStorage.setItem(
        cacheKey,
        JSON.stringify({
          timestamp: Date.now(),
          data,
        }),
      );

      setDashboardData(data);
    } catch (error) {
      console.error("Dashboard Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshDashboard = () => {
    loadDashboard(true);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  const {
    totalLearners,
    weeklyUpcomingLessons,
    unmarkedHomework,
    learners,
    pendingTests,
  } = dashboardData;

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* INFO */}
      <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs sm:text-sm rounded-lg px-3 py-2">
        <Info size={16} className="mt-0.5" />
        <p>Access your metrics on this page.</p>
      </div>

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>

        <button
          onClick={refreshDashboard}
          className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border hover:bg-gray-50 transition"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          icon={<Users size={18} />}
          title="Learners"
          value={totalLearners}
        />

        <Card
          icon={<FileText size={18} />}
          title="Unmarked Homework"
          value={unmarkedHomework}
        />

        <Card
          icon={<BookOpen size={18} />}
          title="Upcoming Lessons"
          value={weeklyUpcomingLessons}
        />

        <Card
          icon={<ClipboardList size={18} />}
          title="Unmarked Tests"
          value={pendingTests}
        />
      </div>

      {/* SECOND ROW */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle size={18} className="text-orange-500" />
            <h2 className="font-semibold text-gray-800">Learners</h2>
          </div>

          {learners.length === 0 ? (
            <p className="text-sm text-gray-400">No learners found.</p>
          ) : (
            <div className="space-y-3">
              {learners.slice(0, 8).map((learner) => (
                <div
                  key={learner.id}
                  className="flex items-center justify-between border-b border-gray-100 pb-2"
                >
                  <span className="text-sm text-gray-700">{learner.name}</span>
                </div>
              ))}
            </div>
          )}
        </div> */}

        {/* SUMMARY */}
        {/* <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">Summary</h2>

          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Total Learners</span>
              <span className="font-semibold">{totalLearners}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span>Upcoming This Week</span>
              <span className="font-semibold">{weeklyUpcomingLessons}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span>Unmarked Homework</span>
              <span className="font-semibold text-orange-600">
                {unmarkedHomework}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span>Pending Tests</span>
              <span className="font-semibold">0</span>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}
