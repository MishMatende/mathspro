import { learners, lessons, homework } from "../components/data/mockData";
import {
  Users,
  BookOpen,
  FileText,
  AlertCircle,
  ClipboardList,
} from "lucide-react";
import Card from "../components/Card";

const TutorDashboard = () => {
  // Metrics
  const totalLearners = learners.length;

  const totalLessons = lessons.length;

  const unmarkedHomework = homework.reduce((acc, hw) => {
    return acc + hw.submissions.filter((sub) => !sub.markedFile).length;
  }, 0);

  const pendingTests = 0; // placeholder for now

  const learnersNeedingAttention = learners.filter((l) => l.progress < 60);

  const avgProgress =
    learners.reduce((acc, l) => acc + l.progress, 0) / learners.length;

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Title */}
      <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>

      {/* METRICS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          icon={<Users size={18} />}
          title="Learners"
          value={totalLearners}
        />

        <Card
          icon={<FileText size={18} />}
          title="Unmarked Homework"
          value={unmarkedHomework}
        />

        <Card
          icon={<BookOpen size={18} />}
          title="Lessons"
          value={totalLessons}
        />

        <Card
          icon={<ClipboardList size={18} />}
          title="Pending Tests"
          value={pendingTests}
        />
      </div>

      {/* SECOND ROW */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Learners needing attention */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle size={18} className="text-red-500" />
            <h2 className="font-semibold text-gray-800">Needs Attention</h2>
          </div>

          {learnersNeedingAttention.length === 0 ? (
            <p className="text-sm text-gray-400">
              All learners are doing well 🎉
            </p>
          ) : (
            <div className="space-y-3">
              {learnersNeedingAttention.map((l) => (
                <div
                  key={l.id}
                  className="flex justify-between items-center text-sm"
                >
                  <span>{l.name}</span>
                  <span className="text-red-500 font-medium">
                    {l.progress}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Average Progress */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">Average Progress</h2>

          <div className="w-full h-3 bg-gray-200 rounded-full">
            <div
              className="h-3 rounded-full bg-(--color-primary)"
              style={{ width: `${avgProgress}%` }}
            />
          </div>

          <p className="text-sm text-gray-600 mt-2">
            {Math.round(avgProgress)}% overall progress
          </p>
        </div>
      </div>
    </div>
  );
};

export default TutorDashboard;
