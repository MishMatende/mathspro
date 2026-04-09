import { ClipboardList } from "lucide-react";

const TestsPage = () => {
  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <ClipboardList size={20} className="text-gray-700" />
        <h1 className="text-lg lg:text-xl font-semibold text-gray-800">
          Tests
        </h1>
      </div>

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center mt-20 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <ClipboardList size={28} className="text-gray-400" />
        </div>

        <h2 className="text-sm font-medium text-gray-700 mb-1">
          No tests available yet
        </h2>

        <p className="text-xs text-gray-400 max-w-sm">
          Tests created by the admin will appear here. You will be able to
          assign, mark, and review learner performance.
        </p>
      </div>
    </div>
  );
};

export default TestsPage;
