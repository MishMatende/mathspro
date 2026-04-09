import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { learners } from "../components/data/mockData";
import { Users, Search } from "lucide-react";

const LearnersPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filteredLearners = learners.filter((learner) =>
    learner.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Users className="text-gray-700" size={20} />
          <h1 className="text-lg lg:text-xl font-semibold text-gray-800">
            Learners
          </h1>
        </div>

        {/* Search */}
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

      {/* Learners Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLearners.map((learner) => (
          <div
            key={learner.id}
            onClick={() => navigate(`/learners/${learner.id}`)}
            className="bg-white rounded-xl p-4 shadow-sm cursor-pointer transition hover:shadow-md hover:scale-[1.01]"
          >
            {/* Top */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-medium">
                {learner.name.charAt(0)}
              </div>

              <div>
                <p className="font-medium text-gray-800">{learner.name}</p>
                <p className="text-xs text-gray-500">Tier {learner.tier}</p>
              </div>
            </div>

            {/* Progress */}
            <div className="mb-2">
              <div className="w-full h-2 bg-gray-200 rounded-full">
                <div
                  className="h-2 rounded-full bg-(--color-primary)"
                  style={{ width: `${learner.progress}%` }}
                />
              </div>

              <p className="text-xs text-gray-500 mt-1">
                {learner.progress}% progress
              </p>
            </div>

            {/* Footer */}
            <p className="text-xs text-gray-400">
              Last session: {learner.lastSession}
            </p>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredLearners.length === 0 && (
        <div className="flex flex-col items-center justify-center mt-20 text-gray-400">
          <Users size={40} className="mb-2 text-gray-300" />
          <p className="text-sm">No learners found</p>
        </div>
      )}
    </div>
  );
};

export default LearnersPage;
