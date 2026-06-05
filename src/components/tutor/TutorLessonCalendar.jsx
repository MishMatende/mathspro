// src/components/tutor/TutorLessonCalendar.jsx

import { useMemo, useState, useEffect } from "react";

import FullCalendar from "@fullcalendar/react";

import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

export default function TutorLessonCalendar({ schedule, setSelectedLesson }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // 🔥 Mobile listener
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 🔥 Convert schedule -> events
  const events = useMemo(() => {
    return schedule
      .map((lesson) => {
        if (!lesson.lesson_date) return null;

        const normalizeTime = (time) => {
          if (!time) return null;

          // Removes seconds if present
          return String(time).slice(0, 5);
        };

        const startTime = normalizeTime(lesson.start_time || lesson.start);

        const endTime = normalizeTime(lesson.end_time || lesson.end);

        if (!startTime || !endTime) return null;

        return {
          id: lesson.id,

          title:
            lesson.title || lesson.subject || lesson.learners?.name || "Lesson",

          start: `${lesson.lesson_date}T${startTime}`,

          end: `${lesson.lesson_date}T${endTime}`,

          backgroundColor: "#6366f1",

          borderColor: "#6366f1",

          textColor: "#ffffff",

          extendedProps: {
            lesson,
          },
        };
      })
      .filter(Boolean);
  }, [schedule]);

  return (
    <div className="calendar-wrapper">
      <FullCalendar
        key={isMobile ? "mobile" : "desktop"}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={isMobile ? "timeGridDay" : "timeGridWeek"}
        editable={false}
        selectable
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
          const lesson = info.event.extendedProps.lesson;

          if (lesson) {
            setSelectedLesson(lesson);
          }
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
          </div>
        )}
      />

      {/* 🔥 FullCalendar Styling */}
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

/* ===== SCROLLBAR ===== */

.fc-scroller::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.fc-scroller::-webkit-scrollbar-thumb {
  background: #dbeafe;
  border-radius: 999px;
}

/* ===== MOBILE FIXES ===== */

@media (max-width: 768px) {
  .calendar-wrapper {
    width: 100%;
    border-radius: 24px;
    overflow: hidden;
  }

  .fc .fc-toolbar {
    padding: 14px !important;
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: stretch !important;
  }

  .fc-toolbar-chunk {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 8px;
    width: 100%;
  }

  .fc .fc-toolbar-title {
    font-size: 1rem !important;
    text-align: center;
  }

  .fc .fc-button {
    flex: 1;
    min-width: 0;
    height: 38px;
    font-size: 0.78rem !important;
    padding: 0 10px !important;
    border-radius: 12px !important;
  }

  .fc-view-harness {
    min-height: 75vh !important;
  }

  .fc-scrollgrid {
    min-width: 100% !important;
  }

  .fc-timegrid-body {
    width: 100% !important;
  }

  .fc-timegrid-cols table {
    width: 100% !important;
  }

  .fc-timegrid-slot {
    height: 72px !important;
  }

  .fc .fc-timegrid-slot-label {
    font-size: 0.7rem;
    padding-right: 6px;
  }

  .fc-timegrid-event {
    inset-inline: 2px !important;
    border-radius: 16px !important;
  }

  .modern-event {
    padding: 8px 6px !important;
  }

  .modern-event-title {
    font-size: 0.72rem !important;
    line-height: 1.1;
  }

  .modern-event-time {
    font-size: 0.62rem !important;
  }
}
`}
      </style>
    </div>
  );
}
