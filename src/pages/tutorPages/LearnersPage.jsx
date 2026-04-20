import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { learners } from "../../components/data/mockData";
import {
  Users,
  Search,
  GraduationCap,
  Layers,
  ArrowRight,
  Info,
} from "lucide-react";
import { motion } from "framer-motion";

const LearnersPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filteredLearners = learners.filter((learner) =>
    learner.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-4 lg:p-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Users className="text-gray-700" size={20} />
          <h1 className="text-lg lg:text-xl font-semibold text-gray-800">
            Learners
          </h1>
        </div>

        <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs sm:text-sm rounded-lg px-3 py-2 mb-4">
          <Info size={20} className="mt-0.5" />
          <p>
            Use this page to see the list of learners assigned to you. Tap on a
            learner to see more detail about the learner.
          </p>
        </div>

        {/* SEARCH */}
        <div className="relative w-full sm:w-64">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search learners..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary)/30"
          />
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLearners.map((learner) => (
          <motion.div
            key={learner.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(`/learners/${learner.id}`)}
            className="bg-white rounded-xl p-4 shadow-sm cursor-pointer border border-gray-100 transition hover:shadow-md"
          >
            {/* TOP */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-medium text-sm">
                  {learner.name.charAt(0)}
                </div>

                {/* Name */}
                <div>
                  <p className="font-medium text-gray-800 text-sm sm:text-base">
                    {learner.name}
                  </p>

                  {/* Curriculum + Level */}
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                    <div className="flex items-center gap-1">
                      <GraduationCap size={12} />
                      {learner.curriculum}
                    </div>

                    <div className="flex items-center gap-1">
                      <Layers size={12} />
                      {learner.level}
                    </div>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <ArrowRight size={16} className="text-gray-300" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* EMPTY STATE */}
      {filteredLearners.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center mt-20 text-gray-400"
        >
          <Users size={40} className="mb-2 text-gray-300" />
          <p className="text-sm">No learners found</p>
        </motion.div>
      )}
    </div>
  );
};

export default LearnersPage;
