import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import {
  Search,
  GraduationCap,
  Plus,
  Trash2,
  RefreshCw,
  User,
  Pencil,
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import EditLearnerModal from "../../components/adminModals/EditLearnerModal";
import LearnerProfilePanel from "../../components/adminPanels/LearnerprofilePanel";
import CreateUserModal from "../../components/adminModals/CreateUserModal";
import DeleteUserModal from "../../components/adminModals/DeleteUserModal";

import { getCache, setCache, clearCache } from "../../lib/cache";

const PAGE_SIZE = 10;

export default function AdminLearnersPage() {
  const [learners, setLearners] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedLearner, setSelectedLearner] = useState(null);
  const [profileLearner, setProfileLearner] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
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
  const deleteUser = async () => {
    if (!userToDelete) return;

    setDeleting(true);

    try {
      const { error } = await supabase.functions.invoke("delete-user", {
        body: {
          userId: userToDelete.id,
        },
      });

      if (error) {
        toast.error(error.message || "Delete failed");
        return;
      }

      toast.success("Learner deleted");

      setUserToDelete(null);

      clearCache(`admin_learners_page_${page}`);

      fetchLearners(true);
    } catch (err) {
      console.error(err);

      toast.error("Failed to delete learner");
    } finally {
      setDeleting(false);
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

          <div className="flex gap-3 flex-wrap justify-between">
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
            <div className="flex gap-2">
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
        </div>

        {/* GRID */}
        <div className="space-y-3">
          {filtered.map((learner) => (
            <motion.div
              key={learner.id}
              onClick={() => setProfileLearner(learner)}
              whileHover={{ y: -1 }}
              className="group cursor-pointer bg-white rounded-2xl border border-slate-200 px-4 py-3 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between">
                {/* LEFT */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-11 w-11 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                    <User size={18} className="text-orange-600" />
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate">
                      {learner.name}
                    </h3>

                    <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                      <span>{learner.curriculum}</span>

                      <span className="text-slate-300">•</span>

                      <span>{learner.level}</span>
                    </div>
                  </div>
                </div>

                {/* RIGHT */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedLearner(learner);
                    }}
                    className="h-9 w-9 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50"
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setUserToDelete(learner);
                    }}
                    className="h-9 w-9 rounded-xl border border-red-200 text-red-500 flex items-center justify-center hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
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

          <div className="text-sm text-slate-500">
            Showing {filtered.length} learners
          </div>

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

      <DeleteUserModal
        isOpen={Boolean(userToDelete)}
        user={userToDelete}
        loading={deleting}
        onClose={() => !deleting && setUserToDelete(null)}
        onConfirm={deleteUser}
      />
    </>
  );
}
