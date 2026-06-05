// src/lib/checkLessonCollision.js

import { supabase } from "./supabase";

export async function checkLessonCollision({
  lessonId = null,

  learner_id,

  tutor_id,

  lesson_date,

  start_time,

  end_time,
}) {
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("lesson_date", lesson_date)
    .neq("status", "cancelled");

  if (error) {
    console.log(error);

    return {
      collision: false,
    };
  }

  // 🔥 Convert to comparable timestamps
  const newStart = new Date(`${lesson_date}T${start_time}`).getTime();

  const newEnd = new Date(`${lesson_date}T${end_time}`).getTime();

  const overlapping = data.find((lesson) => {
    // ignore current lesson when editing
    if (lessonId && lesson.id === lessonId) {
      return false;
    }

    // same tutor or learner
    const sameOwner =
      lesson.tutor_id === tutor_id || lesson.learner_id === learner_id;

    if (!sameOwner) return false;

    const existingStart = new Date(
      `${lesson.lesson_date}T${lesson.start_time}`,
    ).getTime();

    const existingEnd = new Date(
      `${lesson.lesson_date}T${lesson.end_time}`,
    ).getTime();

    // 🔥 overlap logic
    return newStart < existingEnd && newEnd > existingStart;
  });

  return {
    collision: !!overlapping,

    lesson: overlapping || null,
  };
}
