import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import {
  Search,
  GraduationCap,
  Plus,
  Trash2,
  RefreshCw,
  User,
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import EditLearnerModal from "../../components/adminModals/EditLearnerModal";
import LearnerProfilePanel from "../../components/adminPanels/LearnerprofilePanel";
import CreateUserModal from "../../components/adminModals/CreateUserModal";

import { getCache, setCache, clearCache } from "../../lib/cache";

const PAGE_SIZE = 6;

export default function AdminLearnersPage() {
  const [learners, setLearners] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedLearner, setSelectedLearner] = useState(null);
  const [profileLearner, setProfileLearner] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [page, setPage] = useState(0);

  const fetchLearners = async (forceRefresh = false) => {
    const cacheKey = `admin_learners_page_${page}`;

    // 🔥 Use cache first
    if (!forceRefresh) {
      const cachedLearners = getCache(cacheKey);

      if (cachedLearners) {
        setLearners(cachedLearners);
        return;
      }
    }

    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    // 🔥 Fetch from DB
    const { data, error } = await supabase
      .from("learners")
      .select("*")
      .range(from, to)
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    setLearners(data);

    // 🔥 Save cache
    setCache(cacheKey, data);
  };

  useEffect(() => {
    fetchLearners();
  }, [page]);

  const filtered = learners.filter((l) =>
    `${l.name}`.toLowerCase().includes(search.toLowerCase()),
  );

  const handleLearnerUpdated = (updatedLearner) => {
    const mergedLearner = {
      ...(profileLearner || {}),
      ...updatedLearner,
    };

    setLearners((currentLearners) =>
      currentLearners.map((learner) =>
        learner.id === mergedLearner.id
          ? {
              ...learner,
              ...mergedLearner,
            }
          : learner,
      ),
    );

    setProfileLearner(mergedLearner);
    clearCache(`admin_learners_page_${page}`);
  };

  // 🔥 DELETE
  const deleteLearner = async (id) => {
    const confirmDelete = confirm("Delete this learner?");
    if (!confirmDelete) return;

    const loading = toast.loading("Deleting...");

    const { error } = await supabase.from("profiles").delete().eq("id", id);

    toast.dismiss(loading);

    if (error) {
      toast.error("Failed to delete");
    } else {
      toast.success("Learner deleted");

      // 🔥 Clear current page cache
      clearCache(`admin_learners_page_${page}`);

      fetchLearners(true);
    }
  };

  return (
    <>
      <motion.div
        animate={{
          scale: selectedLearner || profileLearner ? 0.96 : 1,
          filter: selectedLearner || profileLearner ? "blur(6px)" : "blur(0px)",
        }}
        className="p-4 lg:p-6"
      >
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <GraduationCap size={20} />
            <h1 className="text-lg font-semibold">Learners</h1>
          </div>

          <div className="flex gap-3 flex-wrap">
            {/* Search */}
            <div className="relative sm:w-64">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />

              <input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <button
              onClick={() => {
                clearCache(`admin_learners_page_${page}`);
                fetchLearners(true);
              }}
              className="flex items-center justify-center h-10 w-10 border border-slate-200 rounded-xl hover:bg-slate-50 transition"
            >
              <RefreshCw size={16} />
            </button>

            {/* Create */}
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-2 bg-(--color-primary) text-white px-4 py-2 rounded-lg text-sm"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* GRID */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((learner) => (
            <motion.div
              key={learner.id}
              onClick={() => setProfileLearner(learner)}
              whileHover={{
                y: -3,
              }}
              className="group cursor-pointer bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-all overflow-hidden"
            >
              {/* TOP */}
              <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-white px-4 py-4 border-b border-orange-100">
                <div className="flex items-center justify-between">
                  <div className="flex gap-3 items-center">
                    <div className="h-11 w-11 rounded-2xl bg-orange-100 flex items-center justify-center">
                      <User size={20} className="text-orange-600" />
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {learner.name}
                      </h3>

                      <p className="text-xs text-slate-500">Learner Profile</p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteLearner(learner.id);
                    }}
                    className="h-9 w-9 rounded-xl flex items-center justify-center text-red-500 hover:bg-red-50 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* BODY */}
              <div className="p-4">
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-medium">
                    {learner.curriculum}
                  </span>

                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                    {learner.level}
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedLearner(learner);
                  }}
                  className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition text-sm font-medium"
                >
                  Edit Learner
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* PAGINATION */}
        <div className="flex justify-center items-center gap-3 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
            disabled={page === 0}
          >
            Prev
          </button>

          <span className="text-sm text-slate-500">Page {page + 1}</span>

          <button
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50"
          >
            Next
          </button>
        </div>
      </motion.div>

      {/* MODALS */}
      <EditLearnerModal
        learner={selectedLearner}
        onClose={() => setSelectedLearner(null)}
        onUpdated={() => {
          clearCache(`admin_learners_page_${page}`);
          fetchLearners(true);
        }}
      />

      <CreateUserModal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);

          clearCache(`admin_learners_page_${page}`);

          fetchLearners(true);
        }}
        initialRole="student"
      />

      <LearnerProfilePanel
        learner={profileLearner}
        onClose={() => setProfileLearner(null)}
        onUpdated={handleLearnerUpdated}
      />
    </>
  );
}
