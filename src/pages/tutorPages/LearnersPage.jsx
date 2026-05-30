import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

import {
  Users,
  Search,
  GraduationCap,
  Layers,
  ArrowRight,
  Info,
  RefreshCw,
} from "lucide-react";

import { motion } from "framer-motion";

import { getCache, setCache } from "../../lib/cache";

const LearnersPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [learners, setLearners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // 🔥 Fetch assigned learners
  const fetchLearners = async (forceRefresh = false) => {
    if (!user?.id) return;

    const cacheKey = `tutor_learners_${user.id}`;

    if (!forceRefresh) {
      const cachedLearners = getCache(cacheKey);

      if (cachedLearners) {
        setLearners(cachedLearners);
        setLoading(false);
        return;
      }
    }

    const { data, error } = await supabase
      .from("learners")
      .select("*")
      .eq("tutor_id", user.id)
      .order("name");

    if (error) {
      console.log(error);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    setLearners(data || []);

    setCache(cacheKey, data || []);

    setLoading(false);
    setRefreshing(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);

    await fetchLearners(true);
  };

  useEffect(() => {
    fetchLearners();
  }, [user]);

  // 🔥 Filter
  const filteredLearners = learners.filter((learner) =>
    learner.name?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-4 lg:p-6">
      {/* INFO */}
      <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs sm:text-sm rounded-lg px-3 py-2 mb-4">
        <Info size={20} className="mt-0.5 shrink-0" />

        <p>
          Use this page to see the list of learners assigned to you. Tap on a
          learner to see more detail about the learner.
        </p>
      </div>

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Users className="text-gray-700" size={20} />

          <h1 className="text-lg lg:text-xl font-semibold text-gray-800">
            Learners
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="
        h-10 w-10
        flex items-center justify-center
        rounded-lg
        border border-gray-200
        bg-white
        hover:bg-gray-50
        transition
        disabled:opacity-50
      "
            title="Refresh learners"
          >
            <motion.div
              animate={refreshing ? { rotate: 360 } : {}}
              transition={{
                duration: 1,
                repeat: refreshing ? Infinity : 0,
                ease: "linear",
              }}
            >
              <RefreshCw size={16} />
            </motion.div>
          </button>

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
              className="
          w-full pl-9 pr-3 py-2 text-sm
          border border-gray-200 rounded-lg
          focus:outline-none
          focus:ring-2
          focus:ring-(--color-primary)/30
        "
            />
          </div>
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="text-sm text-gray-400">Loading learners...</div>
      )}

      {/* GRID */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLearners.map((learner) => (
            <motion.div
              key={learner.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(`/learners/${learner.id}`)}
              className="
                bg-white rounded-xl p-4
                shadow-sm cursor-pointer
                border border-gray-100
                transition hover:shadow-md
              "
            >
              {/* TOP */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div
                    className="
                      w-10 h-10 rounded-full
                      bg-orange-100
                      text-orange-600
                      flex items-center justify-center
                      font-medium text-sm
                    "
                  >
                    {learner.name?.charAt(0)}
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
      )}

      {/* EMPTY STATE */}
      {!loading && filteredLearners.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="
            flex flex-col items-center justify-center
            mt-20 text-gray-400
          "
        >
          <Users size={40} className="mb-2 text-gray-300" />

          <p className="text-sm">No learners assigned to you yet</p>
        </motion.div>
      )}
    </div>
  );
};

export default LearnersPage;
