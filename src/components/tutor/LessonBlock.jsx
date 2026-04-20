import { getMinutes } from "./scheduleUtils";

const LessonBlock = ({ lesson, onClick }) => {
  const start = getMinutes(lesson.start);
  const end = getMinutes(lesson.end);

  const top = ((start - 480) / 60) * 64; // 8AM baseline
  const height = ((end - start) / 60) * 64;

  return (
    <div
      onClick={onClick}
      className="absolute left-1 right-1 bg-(--color-primary) text-white rounded-xl px-2 py-2 text-[10px] sm:text-xs shadow-md cursor-pointer hover:opacity-90 transition active:scale-[0.98]"
      style={{
        top: `${top}px`,
        height: `${height}px`,
      }}
    >
      <p className="font-semibold truncate">{lesson.learnerName}</p>
      <p className="opacity-90 truncate">{lesson.topic}</p>
      <p className="opacity-70 text-[9px] sm:text-[10px]">
        {lesson.start} - {lesson.end}
      </p>
    </div>
  );
};

export default LessonBlock;
