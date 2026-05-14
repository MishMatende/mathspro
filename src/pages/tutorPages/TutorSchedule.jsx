// src/components/tutor/TutorSchedule.jsx

import { useEffect, useMemo, useState } from "react";

import FullCalendar from "@fullcalendar/react";

import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

import {
  CalendarDays,
  Clock3,
  ExternalLink,
  Sparkles,
  User2,
} from "lucide-react";

import { supabase } from "../../lib/supabase";

import { useAuth } from "../../context/AuthContext";

import toast from "react-hot-toast";

export default function TutorSchedule() {
  const { user } = useAuth();

  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedLesson, setSelectedLesson] = useState(null);

  // ✅ Cache config
  const CACHE_KEY = `tutor_lessons_${user?.id}`;
  const CACHE_DURATION = 1000 * 60 * 5; // 5 mins

  // ✅ Safe calendar URL
  const calendarUrl = user?.calendar_token
    ? `https://boeiswmtpvzmcjzctkid.supabase.co/functions/v1/calendar-feed?token=${user.calendar_token}&type=tutor`
    : "#";

  // 🔥 Fetch tutor lessons with caching
  const fetchLessons = async ({ forceRefresh = false } = {}) => {
    if (!user) return;

    // ✅ Try cache first
    if (!forceRefresh) {
      try {
        const cached = localStorage.getItem(CACHE_KEY);

        if (cached) {
          const parsed = JSON.parse(cached);

          const isValid = Date.now() - parsed.timestamp < CACHE_DURATION;

          if (isValid) {
            setLessons(parsed.data || []);
            setLoading(false);
          }
        }
      } catch (err) {
        console.log("Cache read error:", err);
      }
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("lessons")
      .select(
        `
        *,
        learners (
          id,
          name
        )
      `,
      )
      .eq("tutor_id", user.id)
      .order("lesson_date", {
        ascending: true,
      });

    setLoading(false);

    if (error) {
      console.log(error);

      toast.error("Failed to fetch lessons");

      return;
    }

    const lessonsData = data || [];

    setLessons(lessonsData);

    // ✅ Save cache
    try {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          data: lessonsData,
          timestamp: Date.now(),
        }),
      );
    } catch (err) {
      console.log("Cache write error:", err);
    }
  };

  // 🔥 Initial fetch
  useEffect(() => {
    fetchLessons();
  }, [user?.id]);

  // 🔥 Realtime updates + cache invalidation
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`tutor-lessons-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "lessons",
          filter: `tutor_id=eq.${user.id}`,
        },
        async () => {
          localStorage.removeItem(CACHE_KEY);

          await fetchLessons({
            forceRefresh: true,
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // 🔥 Convert to calendar events
  const events = useMemo(() => {
    return lessons.map((lesson) => ({
      id: lesson.id,

      title: lesson.title,

      start: `${lesson.lesson_date}T${lesson.start_time}`,

      end: `${lesson.lesson_date}T${lesson.end_time}`,

      backgroundColor: "#f97316",
      borderColor: "#f97316",

      extendedProps: {
        objective: lesson.objective,
        learner: lesson.learners?.name,
        notes: lesson.notes,
        start_time: lesson.start_time,
        end_time: lesson.end_time,
      },
    }));
  }, [lessons]);

  const upcomingLessons = lessons.length;

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-orange-100/40 p-4 lg:p-6">
      {/* HERO */}
      {/* <div
        className="
          relative
          overflow-hidden
          rounded-[32px]
          bg-gradient-to-r
          from-orange-500
          via-orange-400
          to-amber-400
          p-6 lg:p-8
          text-white
          shadow-xl
          mb-6
        "
      >
        glow
        <div className="absolute -top-16 -right-16 h-52 w-52 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-3">
            {user?.calendar_token && (
              <a
                href={calendarUrl}
                target="_blank"
                rel="noreferrer"
                className="
                  group
                  inline-flex
                  items-center
                  gap-2
                  rounded-2xl
                  bg-white
                  px-5
                  py-4
                  text-sm
                  font-semibold
                  text-orange-600
                  shadow-lg
                  transition-all
                  hover:-translate-y-0.5
                  hover:shadow-2xl
                "
              >
                Subscribe Calendar
                <ExternalLink
                  size={16}
                  className="transition group-hover:translate-x-0.5"
                />
              </a>
            )}
          </div>
        </div>
      </div> */}

      {/* CALENDAR CARD */}
      <div
        className="
          overflow-hidden
          rounded-4xl
          border border-white/60
          bg-white/80
          backdrop-blur-xl
          shadow-xl
        "
      >
        {/* top bar */}
        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-gray-100
            px-5
            py-4
          "
        >
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Weekly Planner
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Manage your tutoring schedule visually
            </p>
          </div>

          <div
            className="
              hidden sm:flex
              items-center gap-2
              rounded-full
              bg-orange-50
              px-4 py-2
              text-sm
              font-medium
              text-orange-600
            "
          >
            <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
            Live Schedule
          </div>
        </div>

        {/* CALENDAR */}
        <div className="p-3 sm:p-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="h-12 w-12 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin" />

              <p className="mt-5 text-sm text-gray-500">
                Loading your schedule...
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-237.5 lg:min-w-0">
                <FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  initialView="timeGridDay"
                  height="auto"
                  events={events}
                  nowIndicator={true}
                  editable={false}
                  selectable={false}
                  allDaySlot={false}
                  slotMinTime="06:00:00"
                  slotMaxTime="22:00:00"
                  dayMaxEvents={true}
                  stickyHeaderDates={true}
                  expandRows={true}
                  dayHeaderFormat={{
                    weekday: "short",
                    day: "numeric",
                  }}
                  headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "timeGridDay,timeGridWeek,dayGridMonth",
                  }}
                  buttonText={{
                    today: "Today",
                    month: "Month",
                    week: "Week",
                    day: "Day",
                  }}
                  eventTimeFormat={{
                    hour: "numeric",
                    minute: "2-digit",
                    meridiem: "short",
                  }}
                  eventClassNames={() => [
                    "!border-0",
                    "!rounded-2xl",
                    "!px-2",
                    "!py-1",
                    "shadow-sm",
                    "hover:shadow-lg",
                    "transition-all",
                    "cursor-pointer",
                  ]}
                  eventContent={(eventInfo) => (
                    <div className="px-1 py-1">
                      <div className="font-semibold text-[13px] truncate">
                        {eventInfo.event.title}
                      </div>

                      <div className="text-[11px] opacity-90 truncate">
                        {eventInfo.event.extendedProps.learner}
                      </div>
                    </div>
                  )}
                  eventClick={(info) => {
                    setSelectedLesson({
                      title: info.event.title,
                      ...info.event.extendedProps,
                    });
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* LESSON MODAL */}
      {selectedLesson && (
        <div
          className="
            fixed inset-0 z-50
            flex items-center justify-center
            bg-black/40 backdrop-blur-sm
            p-4
          "
          onClick={() => setSelectedLesson(null)}
        >
          <div
            className="
              w-full max-w-lg
              rounded-[28px]
              bg-white
              p-6
              shadow-2xl
              animate-in fade-in zoom-in duration-200
            "
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div
                  className="
                    inline-flex items-center gap-2
                    rounded-full
                    bg-orange-100
                    px-3 py-1
                    text-xs
                    font-semibold
                    text-orange-600
                    mb-3
                  "
                >
                  <Sparkles size={14} />
                  Lesson Details
                </div>

                <h3 className="text-2xl font-bold text-gray-900">
                  {selectedLesson.title}
                </h3>
              </div>

              <button
                onClick={() => setSelectedLesson(null)}
                className="
                  h-10 w-10 rounded-xl bg-gray-100
                  text-gray-500 hover:bg-gray-200
                  transition
                "
              >
                ✕
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-3 rounded-2xl bg-gray-50 p-4">
                <User2 className="text-orange-500 mt-0.5" size={18} />

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Learner
                  </p>

                  <p className="mt-1 font-semibold text-gray-900">
                    {selectedLesson.learner || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-gray-50 p-4">
                <Clock3 className="text-orange-500 mt-0.5" size={18} />

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Time
                  </p>

                  <p className="mt-1 font-semibold text-gray-900">
                    {selectedLesson.start_time} — {selectedLesson.end_time}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Objective
                </p>

                <p className="mt-2 text-sm leading-relaxed text-gray-700">
                  {selectedLesson.objective || "No objective added"}
                </p>
              </div>

              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Notes
                </p>

                <p className="mt-2 text-sm leading-relaxed text-gray-700">
                  {selectedLesson.notes || "No notes added"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULLCALENDAR CUSTOM STYLES */}
      <style>{`
        .fc {
          font-family: inherit;
        }

        .fc-theme-standard td,
        .fc-theme-standard th,
        .fc-theme-standard .fc-scrollgrid {
          border-color: #f3f4f6;
        }

        .fc .fc-toolbar {
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 1.5rem;
        }

        .fc .fc-toolbar-title {
          font-size: 1.2rem;
          font-weight: 700;
          color: #111827;
        }

        .fc .fc-button {
          border: 0 !important;
          background: #f3f4f6 !important;
          color: #374151 !important;
          border-radius: 14px !important;
          padding: 0.55rem 0.9rem !important;
          font-weight: 600 !important;
          box-shadow: none !important;
          transition: 0.2s ease;
        }

        .fc .fc-button:hover {
          background: #fed7aa !important;
          color: #ea580c !important;
        }

        .fc .fc-button-active {
          background: #f97316 !important;
          color: white !important;
        }

        .fc .fc-timegrid-slot {
          height: 4rem !important;
        }

        .fc .fc-col-header-cell {
          background: #fafafa;
          padding: 12px 0;
        }

        .fc .fc-day-today {
          background: rgba(249, 115, 22, 0.06) !important;
        }

        .fc .fc-highlight {
          background: rgba(249, 115, 22, 0.12) !important;
        }

        .fc-direction-ltr .fc-timegrid-slot-label-frame,
        .fc-direction-ltr .fc-timegrid-axis-frame {
          color: #9ca3af;
          font-size: 0.75rem;
        }
      `}</style>
    </div>
  );
}
