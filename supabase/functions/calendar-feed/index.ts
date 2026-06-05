import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const url = new URL(req.url);

    const token = url.searchParams.get("token");

    const type = url.searchParams.get("type");

    if (!token || !type) {
      return new Response("Missing token", {
        status: 400,
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // 🔥 Determine user type
    const table =
      type === "tutor"
        ? "tutors"
        : "learners";

    // 🔥 Get owner
    const { data: owner, error: ownerError } =
      await supabase
        .from(table)
        .select("*")
        .eq("calendar_token", token)
        .single();

    if (ownerError || !owner) {
      return new Response("Invalid token", {
        status: 404,
      });
    }

    // 🔥 Fetch lessons
    const column =
      type === "tutor"
        ? "tutor_id"
        : "learner_id";

    const { data: lessons, error: lessonsError } =
      await supabase
        .from("lessons")
        .select(`
          *,
          learners (
            name
          ),
          tutors (
            name
          )
        `)
        .eq(column, owner.id)
        .order("lesson_date", {
          ascending: true,
        });

    if (lessonsError) {
      return new Response("Failed to fetch lessons", {
        status: 500,
      });
    }

    // 🔥 Build ICS
    let ics = `
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//MathsPro//Lessons//EN
CALSCALE:GREGORIAN
`;

    for (const lesson of lessons) {
      const start =
        `${lesson.lesson_date}T${lesson.start_time}`
          .replace(/-/g, "")
          .replace(/:/g, "");

      const end =
        `${lesson.lesson_date}T${lesson.end_time}`
          .replace(/-/g, "")
          .replace(/:/g, "");

      const summary =
        type === "tutor"
          ? `${lesson.title} - ${lesson.learners?.name}`
          : `${lesson.title} - ${lesson.tutors?.name}`;

      const description =
        lesson.objective || "";

      ics += `
BEGIN:VEVENT
UID:${lesson.calendar_uid}
DTSTAMP:${start}00
DTSTART:${start}00
DTEND:${end}00
SUMMARY:${summary}
DESCRIPTION:${description}
STATUS:CONFIRMED
END:VEVENT
`;
    }

    ics += `
END:VCALENDAR
`;

    return new Response(ics, {
      headers: {
        "Content-Type":
          "text/calendar; charset=utf-8",

        "Content-Disposition":
          'inline; filename="schedule.ics"',
      },
    });
  } catch (err) {
    console.log(err);

    return new Response("Server error", {
      status: 500,
    });
  }
});