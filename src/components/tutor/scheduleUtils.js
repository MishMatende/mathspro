export const getMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

export const minutesToTime = (mins) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}:${m === 0 ? "00" : m}`;
};

export const generateTimeSlots = () => {
  const slots = [];
  for (let i = 8; i <= 18; i++) {
    slots.push(`${i}:00`);
  }
  return slots;
};

export const getWeekDays = (offset = 0) => {
  const today = new Date();
  const week = [];

  for (let i = 0; i < 5; i++) {
    const date = new Date();
    date.setDate(today.getDate() + i + offset * 7);

    week.push({
      label: date.toLocaleDateString("en-GB", {
        day: "numeric",
        weekday: "short",
      }),
      date: date.toISOString().split("T")[0],
    });
  }

  return week;
};

export const getSingleDay = (offset = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);

  return {
    label: date.toLocaleDateString("en-GB", {
      day: "numeric",
      weekday: "short",
    }),
    date: date.toISOString().split("T")[0],
  };
};
