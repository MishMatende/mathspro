import { useState } from "react";
import LessonTimeline from "./LessonTimeline";
import HomeworkPanel from "./HomeworkPanel";
import { motion } from "framer-motion";
import { User, BookOpen, FileText, ClipboardList } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LearnerProfile = ({ learner }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();

  if (!learner) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        Select a learner
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: User },
    { id: "lessons", label: "Lessons", icon: BookOpen },
    { id: "homework", label: "Homework", icon: FileText },
    { id: "tests", label: "Tests", icon: ClipboardList },
  ];

  return (
    <motion.div
      key={learner?.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full flex flex-col min-w-0"
    >
      {/* HEADER (Mobile optimized) */}
      <div className="px-4 py-4 lg:p-6 bg-white">
        {/* Back + Title row */}
        <div className="flex items-center gap-3 mb-3 lg:hidden">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-500 cursor-pointer"
          >
            ←
          </button>

          <p className="text-sm font-medium text-gray-700">Learner Profile</p>
        </div>

        {/* Profile info */}
        <div className="flex items-center gap-3 lg:gap-4">
          {/* Avatar */}
          <div className="w-10 h-10 lg:w-14 lg:h-14 rounded-full bg-gray-200 flex items-center justify-center text-sm lg:text-lg font-semibold">
            {learner.name.charAt(0)}
          </div>

          {/* Info */}
          <div>
            <h2 className="text-base lg:text-xl font-semibold text-gray-800">
              {learner.name}
            </h2>

            <p className="text-xs lg:text-sm text-gray-500">
              Tier {learner.tier} • {learner.progress}% progress
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 lg:mt-4">
          <div className="w-full h-2 bg-gray-200 rounded-full">
            <div
              className="h-2 rounded-full bg-(--color-primary)"
              style={{ width: `${learner.progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* TABS (Scrollable on mobile) */}
      <div className="px-4 lg:px-6 pt-2 pb-3 bg-white overflow-hidden">
        <div className="flex gap-2 overflow-x-auto no-scrollbar max-w-full">
          {tabs.map((tab) => {
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 text-xs lg:text-sm rounded-md whitespace-nowrap cursor-pointer transition shrink-0
          ${
            activeTab === tab.id
              ? "bg-white shadow-sm text-gray-800"
              : "text-gray-500 hover:text-gray-700"
          }
        `}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 px-4 lg:px-6 py-4 overflow-y-auto bg-gray-50">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-medium text-gray-800 mb-2 text-sm">Goals</h4>
              <p className="text-sm text-gray-600">{learner.goals}</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-medium text-gray-800 mb-2 text-sm">
                Weaknesses
              </h4>
              <p className="text-sm text-gray-600">{learner.weaknesses}</p>
            </div>
          </div>
        )}

        {activeTab === "lessons" && <LessonTimeline />}
        {activeTab === "homework" && <HomeworkPanel />}

        {activeTab === "tests" && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center text-gray-400">
            <FileText className="w-8 h-8 mb-2 text-gray-300" />

            <p className="text-sm font-medium text-gray-500">
              No tests available yet
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Tests assigned by admin will appear here
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default LearnerProfile;
