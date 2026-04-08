export const learners = [
  {
    id: 1,
    name: "John Doe",
    tier: 2,
    progress: 65,
    lastSession: "2 days ago",
    goals: "Improve algebra and problem solving",
    weaknesses: "Fractions, equations",
  },
  {
    id: 2,
    name: "Jane Smith",
    tier: 1,
    progress: 85,
    lastSession: "Yesterday",
    goals: "Competition prep",
    weaknesses: "Speed",
  },
];

export const lessons = [
  {
    id: 1,
    date: "2026-04-05",
    objective: "Understand algebraic expressions",
    achieved: true,
    struggles: "Simplifying fractions",
    nextAction: "Practice more fraction problems",
  },
  {
    id: 2,
    date: "2026-04-03",
    objective: "Linear equations",
    achieved: false,
    struggles: "Balancing equations",
    nextAction: "Revise basics and retry",
  },
];

export const homework = [
  {
    id: 1,
    title: "Algebra Practice",
    file: "homework1.pdf",
    submissions: [
      {
        studentName: "John Doe",
        file: "submission1.pdf",
        markedFile: null,
        remarks: "",
      },
    ],
  },
];
