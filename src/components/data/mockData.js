export const learners = [
  {
    id: 1,
    name: "John Doe",
    curriculum: "Cambridge",
    level: "Year 8",
    goals: "Improve algebra and problem solving",
    weaknesses: "Struggles with fractions",
  },
  {
    id: 2,
    name: "Jane Smith",
    curriculum: "CBC",
    level: "Grade 6",
    goals: "Build strong foundations",
    weaknesses: "Needs help with division",
  },
  {
    id: 3,
    name: "Michael Leee",
    curriculum: "BI",
    level: "Year 10",
    goals: "Build strong foundations",
    weaknesses: "Needs help with Vectors",
  },
];

export const lessons = [
  {
    id: 1,
    objective: "Algebra basics",
    date: "2026-04-20",
    achieved: true,
    struggles: "",
    nextAction: "",
    status: "completed",
  },
  {
    id: 2,
    objective: "Fractions",
    date: "2026-04-18",
    achieved: false,
    struggles: "",
    nextAction: "",
    status: "needs_attention",
  },
  {
    id: 3,
    objective: "Geometry intro",
    date: "2026-04-22",
    achieved: null,
    struggles: "",
    nextAction: "",
    status: "pending",
  },
];

export const homework = [
  {
    id: 1,
    title: "Algebra Practice",
    category: "Algebra",
    file: "homework1.pdf",
    submissions: [
      {
        studentName: "John Doe",
        studentId: 1,
        file: "submission1.pdf",
        markedFile: null,
        remarks: "",
      },
    ],
  },
  {
    id: 2,
    title: "Geometry Practice",
    category: "Geometry",
    file: "homework2.pdf",
    submissions: [
      {
        studentName: "Jane Smith",
        studentId: 2,
        file: "submission2.pdf",
        markedFile: null,
        remarks: "",
      },
    ],
  },
  {
    id: 3,
    title: "Fractions Practice",
    category: "Fractions",
    file: "homework3.pdf",
    submissions: [
      {
        studentName: "Michael Lee",
        studentId: 3,
        file: "submission3.pdf",
        markedFile: null,
        remarks: "",
      },
    ],
  },
];

export const schedule = [
  {
    id: 1,
    learnerName: "John Doe",
    studentId: 1,
    topic: "Algebra",
    date: "2026-04-20",
    start: "10:00",
    end: "11:00",
  },
  {
    id: 2,
    learnerName: "Jane Smith",
    studentId: 2,
    topic: "Fractions",
    date: "2026-04-21",
    start: "14:00",
    end: "15:00",
  },
  {
    id: 3,
    learnerName: "Michael Lee",
    studentId: 3,
    topic: "Geometry",
    date: "2026-04-22",
    start: "11:30",
    end: "12:30",
  },
];
