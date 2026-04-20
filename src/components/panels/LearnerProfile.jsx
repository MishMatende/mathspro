import { useState } from "react";
import LessonTimeline from "./LessonTimeline";
import HomeworkPanel from "./HomeworkPanel";
import { motion } from "framer-motion";
import {
  User,
  BookOpen,
  FileText,
  ClipboardList,
  GraduationCap,
  Layers,
  ArrowLeft,
} from "lucide-react";
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
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full flex flex-col min-w-0"
    >
      {/* HEADER */}
      <div className="px-4 py-4 lg:p-6 bg-white border-b">
        {/* Back */}
        <div className="flex items-center gap-3 mb-3 lg:hidden">
          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-gray-600 cursor-pointer hover:bg-gray-200 transition"
          >
            <ArrowLeft size={16} />
          </motion.button>
          <p className="text-sm font-medium text-gray-700">Learner Profile</p>
        </div>

        {/* Profile */}
        <div className="flex items-center gap-3 lg:gap-4">
          {/* Avatar */}
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="w-10 h-10 lg:w-14 lg:h-14 rounded-full bg-gray-200 flex items-center justify-center text-sm lg:text-lg font-semibold"
          >
            {learner.name.charAt(0)}
          </motion.div>

          {/* Info */}
          <div>
            <h2 className="text-base lg:text-xl font-semibold text-gray-800">
              {learner.name}
            </h2>

            {/* ✅ Curriculum + Level */}
            <div className="flex flex-wrap items-center gap-3 mt-1 text-xs lg:text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <GraduationCap size={14} />
                {learner.curriculum}
              </div>

              <div className="flex items-center gap-1">
                <Layers size={14} />
                {learner.level}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="px-4 lg:px-6 pt-2 pb-3 bg-white">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;

            return (
              <motion.button
                key={tab.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 text-xs lg:text-sm rounded-md whitespace-nowrap cursor-pointer transition
                  ${
                    activeTab === tab.id
                      ? "bg-white shadow-sm text-gray-800"
                      : "text-gray-500 hover:text-gray-700"
                  }
                `}
              >
                <Icon size={16} />
                {tab.label}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 px-4 lg:px-6 py-4 overflow-y-auto bg-gray-50">
        {activeTab === "overview" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {/* Goals */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h4 className="font-medium text-gray-800 mb-2 text-sm">Goals</h4>
              <p className="text-sm text-gray-600">
                {learner.goals || "Not set"}
              </p>
            </div>

            {/* Weaknesses */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h4 className="font-medium text-gray-800 mb-2 text-sm">
                Areas for Growth
              </h4>
              <p className="text-sm text-gray-600">
                {learner.weaknesses || "Not recorded"}
              </p>
            </div>
          </motion.div>
        )}

        {activeTab === "lessons" && <LessonTimeline />}
        {activeTab === "homework" && <HomeworkPanel studentId={learner.id} />}

        {activeTab === "tests" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center min-h-[60vh] text-center text-gray-400"
          >
            <FileText className="w-8 h-8 mb-2 text-gray-300" />

            <p className="text-sm font-medium text-gray-500">
              No tests available yet
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Tests assigned by admin will appear here
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default LearnerProfile;
