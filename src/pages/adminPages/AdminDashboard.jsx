import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Users, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";

import { getCache, setCache } from "../../lib/cache";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    learners: 0,
    tutors: 0,
  });

  const [loading, setLoading] = useState(true);

  const fetchStats = async (forceRefresh = false) => {
    const cacheKey = "admin_dashboard_stats";

    // 🔥 Use cache first
    if (!forceRefresh) {
      const cachedStats = getCache(cacheKey);

      if (cachedStats) {
        setStats(cachedStats);
        setLoading(false);
        return;
      }
    }

    // 🔥 Fetch counts from learners + tutors tables
    const [learnersRes, tutorsRes] = await Promise.all([
      supabase.from("learners").select("*", {
        count: "exact",
        head: true,
      }),

      supabase.from("tutors").select("*", {
        count: "exact",
        head: true,
      }),
    ]);

    const newStats = {
      learners: learnersRes.count || 0,
      tutors: tutorsRes.count || 0,
    };

    // 🔥 Update state
    setStats(newStats);

    // 🔥 Cache stats
    setCache(cacheKey, newStats);

    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <h1 className="text-lg font-semibold mb-6">Admin Dashboard</h1>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Learners */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4"
        >
          <div className="p-3 rounded-xl bg-blue-50">
            <GraduationCap className="text-blue-600" size={20} />
          </div>

          <div>
            <p className="text-sm text-gray-500">Total Learners</p>

            <h2 className="text-xl font-semibold">
              {loading ? "..." : stats.learners}
            </h2>
          </div>
        </motion.div>

        {/* Tutors */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4"
        >
          <div className="p-3 rounded-xl bg-green-50">
            <Users className="text-green-600" size={20} />
          </div>

          <div>
            <p className="text-sm text-gray-500">Total Tutors</p>

            <h2 className="text-xl font-semibold">
              {loading ? "..." : stats.tutors}
            </h2>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
