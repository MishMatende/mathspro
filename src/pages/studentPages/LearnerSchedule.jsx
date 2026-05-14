import { useEffect, useMemo, useState } from "react";

import FullCalendar from "@fullcalendar/react";

import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

import { supabase } from "../../lib/supabase";

import { useAuth } from "../../context/AuthContext";

import { getCache, setCache } from "../../lib/cache";

import toast from "react-hot-toast";

export default function LearnerSchedule() {
  const { user } = useAuth();

  const [learner, setLearner] = useState(null);

  const [lessons, setLessons] = useState([]);

  const [loading, setLoading] = useState(true);

  const [selectedLesson, setSelectedLesson] = useState(null);

  // 🔥 Calendar URL
  const calendarUrl = learner
    ? `https://boeiswmtpvzmcjzctkid.supabase.co/functions/v1/calendar-feed?token=${learner.calendar_token}&type=learner`
    : "#";

  // 🔥 Fetch learner profile
  const fetchLearner = async () => {
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
  const fetchLessons = async () => {
    if (!user) return;

    const cacheKey = `learner_schedule_${user.id}`;

    // 1. Cache first
    const cachedLessons = getCache(cacheKey);

    if (cachedLessons) {
      setLessons(cachedLessons);

      setLoading(false);

      return;
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
      <div className="p-3 sm:p-4 lg:p-6">
        {/* HEADER */}
        <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">My Schedule</h1>

            <p className="text-sm text-gray-400 mt-1">
              View your upcoming lessons
            </p>
          </div>

          {/* 🔥 CALENDAR SUBSCRIBE */}
          <a
            href={calendarUrl}
            target="_blank"
            rel="noreferrer"
            className="
              inline-flex items-center justify-center
              px-4 py-2
              rounded-2xl
              bg-orange-500
              text-white
              text-sm
              font-medium
              shadow-sm
              hover:bg-orange-600
              transition
              whitespace-nowrap
            "
          >
            Subscribe Calendar
          </a>
        </div>

        {/* CALENDAR */}
        <div
          className="
            bg-white
            rounded-3xl
            border border-gray-100
            shadow-sm
            overflow-hidden
          "
        >
          {loading ? (
            <div className="p-8 text-sm text-gray-400">Loading lessons...</div>
          ) : (
            <div className="p-2 sm:p-4">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                height="auto"
                events={events}
                nowIndicator={true}
                editable={false}
                selectable={false}
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,timeGridWeek,timeGridDay",
                }}
                eventClick={(info) => {
                  setSelectedLesson({
                    ...info.event.extendedProps,

                    title: info.event.title,

                    start: info.event.start?.toLocaleString(),

                    end: info.event.end?.toLocaleString(),
                  });
                }}
              />
            </div>
          )}
        </div>
      </div>

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
