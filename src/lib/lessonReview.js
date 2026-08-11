import { clearCache } from "./cache";

const REVIEW_DELAY_MS = 48 * 60 * 60 * 1000;

export const getLessonReviewAvailableAt = (lesson) => {
  if (!lesson?.lesson_date || !lesson?.end_time) return null;

  const endTime = String(lesson.end_time).slice(0, 8);
  const lessonEnd = new Date(`${lesson.lesson_date}T${endTime}`);

  if (Number.isNaN(lessonEnd.getTime())) return null;

  return new Date(lessonEnd.getTime() + REVIEW_DELAY_MS);
};

export const canReviewLesson = (lesson, now = new Date()) => {
  const availableAt = getLessonReviewAvailableAt(lesson);
  return Boolean(availableAt && now <= availableAt);
};

export const getLessonReviewDelayMessage = (lesson) => {
  const availableAt = getLessonReviewAvailableAt(lesson);

  if (!availableAt) {
    return "This lesson needs a valid end time before it can be reviewed.";
  }

  return `Lesson reviews is only available up-to 48 hours after the lesson ends (${availableAt.toLocaleString()}).`;
};

export const clearLessonCaches = (lesson) => {
  if (!lesson?.tutor_id) return;

  clearCache(`dashboard_${lesson.tutor_id}`);
  clearCache(`tutor_lessons_cache_${lesson.tutor_id}`);
  clearCache("admin_dashboard_data");

  if (lesson.learner_id) {
    clearCache(`tutor_lessons_${lesson.learner_id}_${lesson.tutor_id}`);
  }
};
