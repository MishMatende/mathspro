import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Users, GraduationCap, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { getCache, setCache, clearCache } from "../../lib/cache";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    learners: 0,
    tutors: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async (forceRefresh = false) => {
    setLoading(true);

    try {
      const cacheKey = "admin_dashboard_stats";

      // Cache first
      if (!forceRefresh) {
        const cachedStats = getCache(cacheKey);

        if (cachedStats) {
          setStats(cachedStats);
          setLoading(false);
          return;
        }
      }

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

      if (learnersRes.error) throw learnersRes.error;
      if (tutorsRes.error) throw tutorsRes.error;

      const newStats = {
        learners: learnersRes.count || 0,
        tutors: tutorsRes.count || 0,
      };

      setStats(newStats);

      setCache(cacheKey, newStats);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      clearCache("admin_dashboard_stats");

      await fetchStats(true);

      toast.success("Dashboard refreshed");
    } catch (error) {
      console.log(error);
      toast.error("Failed to refresh dashboard");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold">Admin Dashboard</h1>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="
      flex items-center justify-center
      h-11 w-11
      rounded-xl
      border border-gray-200
      bg-white
      hover:bg-gray-50
      transition
      disabled:opacity-50
    "
        >
          <RefreshCw
            size={18}
            className={`${
              refreshing ? "animate-spin text-orange-500" : "text-gray-600"
            }`}
          />
        </button>
      </div>

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
