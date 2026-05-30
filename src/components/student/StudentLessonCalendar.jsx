// src/components/student/StudentLessonCalendar.jsx

import { useMemo, useEffect, useState } from "react";

import FullCalendar from "@fullcalendar/react";

import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

import { CalendarDays, Clock3, User, BookOpen } from "lucide-react";

export default function StudentLessonCalendar({ lessons = [], onLessonClick }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // 🔥 Responsive listener
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 🔥 Convert lessons -> calendar events
  const events = useMemo(() => {
    return lessons.map((lesson) => {
      const title = lesson.title || lesson.subject || "Lesson";

      return {
        id: lesson.id,

        title: isMobile
          ? `${lesson.tutors?.name || title}`
          : `${title} • ${lesson.tutors?.name || ""}`,

        start: `${lesson.lesson_date}T${lesson.start_time}`,

        end: `${lesson.lesson_date}T${lesson.end_time}`,

        display: "block",

        backgroundColor: "#8b5cf6",

        borderColor: "#8b5cf6",

        textColor: "#ffffff",

        extendedProps: {
          tutor: lesson.tutors?.name,

          subject: lesson.subject,

          objective: lesson.objective,

          notes: lesson.notes,

          status: lesson.status,

          rawLesson: lesson,
        },
      };
    });
  }, [lessons, isMobile]);

  return (
    <div className="calendar-wrapper">
      {/* Calendar */}
      <FullCalendar
        key={isMobile ? "mobile" : "desktop"}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={isMobile ? "timeGridDay" : "timeGridWeek"}
        editable={false}
        selectable={false}
        nowIndicator
        allDaySlot={false}
        height="calc(100vh - 220px)"
        expandRows
        stickyHeaderDates
        dayMaxEvents={2}
        contentHeight="auto"
        slotMinTime="06:00:00"
        slotMaxTime="22:00:00"
        slotDuration="00:30:00"
        events={events}
        eventDisplay="block"
        eventOverlap={false}
        slotEventOverlap={false}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: isMobile
            ? "timeGridDay,timeGridWeek"
            : "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        buttonText={{
          today: "Today",
          month: "Month",
          week: "Week",
          day: "Day",
        }}
        dayHeaderFormat={{
          weekday: "short",
          day: "numeric",
        }}
        eventTimeFormat={{
          hour: "numeric",
          minute: "2-digit",
          meridiem: "short",
        }}
        eventClassNames={() => [
          "!border-0",
          "!rounded-[20px]",
          "overflow-hidden",
          "shadow-sm",
          "hover:shadow-xl",
          "transition-all",
          "duration-200",
          "cursor-pointer",
        ]}
        eventClick={(info) => {
          const lesson = info.event.extendedProps.rawLesson;

          onLessonClick?.({
            ...lesson,

            tutor: lesson.tutors?.name || "-",

            start: info.event.start?.toLocaleString(),

            end: info.event.end?.toLocaleString(),
          });
        }}
        eventContent={(eventInfo) => (
          <div
            className="
              h-full
              w-full
              rounded-[20px]
              bg-linear-to-br
              from-indigo-500
              via-violet-500
              to-purple-500
              px-3 py-2
              text-white
              flex flex-col justify-between
            "
          >
            <div className="text-[11px] font-semibold opacity-90">
              {eventInfo.timeText}
            </div>

            <div className="text-[13px] font-bold leading-tight line-clamp-2">
              {eventInfo.event.title}
            </div>

            {!isMobile && (
              <div className="mt-2 flex items-center gap-1 text-[11px] opacity-90">
                <User size={11} />

                <span>{eventInfo.event.extendedProps?.tutor}</span>
              </div>
            )}
          </div>
        )}
      />

      {/* Styles */}
      <style>
        {`
/* ===== WRAPPER ===== */

.calendar-wrapper {
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(20px);
  border-radius: 32px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.7);
  box-shadow:
    0 10px 40px rgba(15, 23, 42, 0.06),
    0 2px 8px rgba(15, 23, 42, 0.04);
}

/* ===== GENERAL ===== */

.fc {
  font-family: Inter, sans-serif;

  --fc-border-color: #eef2ff;
  --fc-page-bg-color: transparent;
  --fc-neutral-bg-color: transparent;
  --fc-today-bg-color: rgba(99, 102, 241, 0.08);
}

/* ===== TOOLBAR ===== */

.fc .fc-toolbar {
  padding: 24px;
  margin-bottom: 0 !important;
  border-bottom: 1px solid #f1f5f9;
  gap: 12px;
}

.fc .fc-toolbar-title {
  font-size: 1.35rem !important;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.02em;
}

/* ===== BUTTONS ===== */

.fc .fc-button {
  height: 42px;
  border-radius: 14px !important;
  border: none !important;
  background: #f8fafc !important;
  color: #475569 !important;
  padding: 0 16px !important;
  font-weight: 700 !important;
  font-size: 0.88rem !important;
  transition: all 0.2s ease;
  box-shadow: none !important;
}

.fc .fc-button:hover {
  background: #eef2ff !important;
  color: #4f46e5 !important;
  transform: translateY(-1px);
}

.fc .fc-button-active {
  background: linear-gradient(
    135deg,
    #6366f1,
    #8b5cf6
  ) !important;

  color: white !important;
}

/* ===== HEADER ===== */

.fc .fc-col-header-cell {
  background: white;
  padding: 16px 0;
}

.fc .fc-col-header-cell-cushion {
  text-decoration: none !important;
  color: #64748b;
  font-weight: 700;
  font-size: 0.88rem;
}

/* ===== GRID ===== */

.fc-theme-standard td,
.fc-theme-standard th {
  border-color: #f1f5f9 !important;
}

.fc .fc-scrollgrid {
  border: none !important;
}

.fc .fc-timegrid-slot {
  height: 76px !important;
}

.fc .fc-timegrid-slot-label {
  color: #94a3b8;
  font-size: 0.75rem;
  font-weight: 600;
}

/* ===== TODAY ===== */

.fc .fc-day-today {
  background: rgba(99, 102, 241, 0.05) !important;
}

/* ===== NOW LINE ===== */

.fc .fc-timegrid-now-indicator-line {
  border-color: #ef4444 !important;
  border-width: 2px;
}

.fc .fc-timegrid-now-indicator-arrow {
  border-color: #ef4444 !important;
}

/* ===== EVENTS ===== */

.fc-event {
  border: none !important;
  background: transparent !important;
}

.fc-timegrid-event {
  inset-inline: 6px !important;
  border-radius: 20px !important;
  overflow: hidden;
  box-shadow:
    0 8px 20px rgba(99, 102, 241, 0.18),
    0 2px 6px rgba(99, 102, 241, 0.12);
}

/* ===== MONTH VIEW ===== */

.fc-daygrid-event {
  border-radius: 14px !important;
  overflow: hidden;
}

/* ===== MOBILE ===== */

@media (max-width: 768px) {
  .calendar-wrapper {
    border-radius: 24px;
  }

  .fc .fc-toolbar {
    padding: 14px !important;
    flex-direction: column;
    align-items: stretch !important;
  }

  .fc-toolbar-chunk {
    display: flex;
    justify-content: center;
    gap: 8px;
    width: 100%;
  }

  .fc .fc-toolbar-title {
    font-size: 1rem !important;
    text-align: center;
  }

  .fc .fc-button {
    flex: 1;
    height: 38px;
    font-size: 0.78rem !important;
    padding: 0 10px !important;
  }

  .fc-timegrid-slot {
    height: 72px !important;
  }

  .fc-timegrid-event {
    inset-inline: 2px !important;
    border-radius: 16px !important;
  }
}
`}
      </style>
    </div>
  );
}
