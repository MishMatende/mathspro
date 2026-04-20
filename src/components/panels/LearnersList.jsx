import { learners } from "../data/mockData";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, Layers, ArrowRight } from "lucide-react";

const LearnersList = ({ onSelect }) => {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState(null);

  const handleSelect = (learner) => {
    setSelectedId(learner.id);
    onSelect?.(learner);
    navigate(`/learners/${learner.id}`);
  };

  return (
    <div className="h-full overflow-y-auto p-3 sm:p-4">
      {/* Header */}
      <h3 className="font-semibold text-gray-800 mb-4 text-sm sm:text-base">
        Learners
      </h3>

      <div className="space-y-3">
        {learners.map((learner) => {
          const isActive = selectedId === learner.id;

          return (
            <motion.div
              key={learner.id}
              whileTap={{ scale: 0.98 }}
              whileHover={{ scale: 1.01 }}
              onClick={() => handleSelect(learner)}
              className={`p-3 sm:p-4 rounded-xl cursor-pointer transition-all duration-200 border
                ${
                  isActive
                    ? "bg-(--color-primary)/10 border-(--color-primary)"
                    : "bg-white hover:bg-gray-50 border-gray-100"
                }
              `}
            >
              {/* Top row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-medium text-sm">
                    {learner.name.charAt(0)}
                  </div>

                  {/* Info */}
                  <div>
                    <p className="font-medium text-sm sm:text-base text-gray-800">
                      {learner.name}
                    </p>

                    {/* ✅ Curriculum + Level */}
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
                <ArrowRight
                  size={16}
                  className="text-gray-300 group-hover:text-gray-500"
                />
              </div>

              {/* Footer */}
              <p className="text-xs text-gray-400 mt-3">
                Last session: {learner.lastSession || "—"}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default LearnersList;
