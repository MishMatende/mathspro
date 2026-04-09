import { learners } from "../data/mockData";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const LearnersList = ({ onSelect }) => {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState(null);

  const handleSelect = (learner) => {
    setSelectedId(learner.id);
    onSelect(learner);
  };

  return (
    <div className="h-full overflow-y-auto p-3 sm:p-4">
      {/* Header */}
      <h3 className="font-semibold text-gray-800 mb-4">Learners</h3>

      <div className="space-y-3">
        {learners.map((learner) => {
          const isActive = selectedId === learner.id;

          return (
            <div
              key={learner.id}
              onClick={() => navigate(`/learners/${learner.id}`)}
              className={`p-3 sm:p-4 rounded-xl cursor-pointer transition-all duration-200
                ${
                  isActive
                    ? "bg-(--color-primary)/10 border border-(--color-primary)"
                    : "bg-gray-50 hover:bg-gray-100 border border-transparent"
                }
              `}
            >
              {/* Top row */}
              <div className="flex items-center gap-3 mb-2">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-medium">
                  {learner.name.charAt(0)}
                </div>

                {/* Name + Tier */}
                <div>
                  <p className="font-medium text-sm sm:text-base text-gray-800">
                    {learner.name}
                  </p>
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
          );
        })}
      </div>
    </div>
  );
};

export default LearnersList;
