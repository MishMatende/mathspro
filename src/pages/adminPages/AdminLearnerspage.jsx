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
  ClipboardList,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import EditLearnerModal from "../../components/adminModals/EditLearnerModal";
import LearnerProfilePanel from "../../components/adminPanels/LearnerprofilePanel";
import CreateUserModal from "../../components/adminModals/CreateUserModal";
import DeleteUserModal from "../../components/adminModals/DeleteUserModal";

import { getCache, setCache, clearCache } from "../../lib/cache";
import { getOrCreateLearnerChecklist } from "../../lib/learnerChecklist";
import ChecklistBuilderModal from "../../components/adminModals/ChecklistBuilderModal";

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
  const [totalLearners, setTotalLearners] = useState(0);
  const [loading, setLoading] = useState(false);

  const [personalChecklist, setPersonalChecklist] = useState(null);
  const [openingChecklistFor, setOpeningChecklistFor] = useState(null);

  const fetchLearners = async (forceRefresh = false) => {
    const trimmedSearch = search.trim();

    const cacheKey = trimmedSearch
      ? `admin_learners_search_${trimmedSearch.toLowerCase()}_page_${page}`
      : `admin_learners_page_${page}`;

    // Use cache first
    if (!forceRefresh) {
      const cachedData = getCache(cacheKey);

      if (cachedData) {
        setLearners(cachedData.learners || []);
        setTotalLearners(cachedData.total || 0);
        return;
      }
    }

    setLoading(true);

    try {
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from("learners")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (trimmedSearch) {
        query = query.ilike("name", `%${trimmedSearch}%`);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error("Failed to fetch learners:", error);

        toast.error("Failed to load learners");

        return;
      }

      const learnerData = data || [];
      const total = count || 0;

      setLearners(learnerData);
      setTotalLearners(total);

      // Save to cache
      setCache(cacheKey, {
        learners: learnerData,
        total,
      });
    } catch (error) {
      console.error("Unexpected learner fetch error:", error);

      toast.error("Something went wrong while loading learners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLearners();
  }, [page, search]);

  const handleSearchChange = (e) => {
    const value = e.target.value;

    setSearch(value);

    if (page !== 0) {
      setPage(0);
    }
  };

  const clearSearch = () => {
    setSearch("");
    setPage(0);
  };

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

    if (search.trim()) {
      clearCache(
        `admin_learners_search_${search.trim().toLowerCase()}_page_${page}`,
      );
    }
  };

  const openLearnerChecklist = async (learner) => {
    try {
      setOpeningChecklistFor(learner.id);

      const checklist = await getOrCreateLearnerChecklist(learner);

      setPersonalChecklist(checklist);
    } catch (error) {
      console.error(error);

      toast.error("Failed to open learner checklist");
    } finally {
      setOpeningChecklistFor(null);
    }
  };

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

      if (search.trim()) {
        clearCache(
          `admin_learners_search_${search.trim().toLowerCase()}_page_${page}`,
        );
      }

      await fetchLearners(true);
    } catch (err) {
      console.error(err);

      toast.error("Failed to delete learner");
    } finally {
      setDeleting(false);
    }
  };

  const handleRefresh = async () => {
    const trimmedSearch = search.trim();

    clearCache(`admin_learners_page_${page}`);

    if (trimmedSearch) {
      clearCache(
        `admin_learners_search_${trimmedSearch.toLowerCase()}_page_${page}`,
      );
    }

    await fetchLearners(true);

    toast.success("Learners refreshed");
  };

  const totalPages = Math.ceil(totalLearners / PAGE_SIZE);

  const hasPreviousPage = page > 0;
  const hasNextPage = page < totalPages - 1;

  const goToPreviousPage = () => {
    if (hasPreviousPage) {
      setPage((currentPage) => currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (hasNextPage) {
      setPage((currentPage) => currentPage + 1);
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
          {/* TITLE */}
          <div className="flex items-center gap-2">
            <GraduationCap size={20} />

            <h1 className="text-lg font-semibold">Learners</h1>
          </div>

          {/* ACTIONS */}
          <div className="flex gap-3 flex-wrap justify-between">
            {/* SEARCH */}
            <div className="relative sm:w-72">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />

              <input
                type="text"
                placeholder="Search learners..."
                value={search}
                onChange={handleSearchChange}
                className="w-full pl-9 pr-9 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-slate-200"
              />

              {/* CLEAR SEARCH */}
              {search && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex gap-2">
              {/* REFRESH */}
              <button
                type="button"
                onClick={handleRefresh}
                disabled={loading}
                aria-label="Refresh learners"
                title="Refresh learners"
                className="flex items-center justify-center h-10 w-10 border border-slate-200 rounded-xl hover:bg-slate-50 transition disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
              </button>

              {/* CREATE */}
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="flex items-center gap-2 bg-(--color-primary) text-white px-4 py-2 rounded-lg text-sm"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* SEARCH STATUS */}
        {search.trim() && (
          <div className="mb-4 text-sm text-slate-500">
            {loading ? (
              "Searching..."
            ) : (
              <>
                {totalLearners} {totalLearners === 1 ? "learner" : "learners"}{" "}
                found for{" "}
                <span className="font-medium text-slate-700">
                  "{search.trim()}"
                </span>
              </>
            )}
          </div>
        )}

        {/* GRID */}
        <div className="space-y-3">
          {loading && learners.length === 0 ? (
            /*
             * LOADING STATE
             */
            <div className="py-12 text-center text-sm text-slate-500">
              Loading learners...
            </div>
          ) : learners.length > 0 ? (
            learners.map((learner) => (
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
                    {/* EDIT */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLearner(learner);
                      }}
                      aria-label={`Edit ${learner.name}`}
                      title="Edit learner"
                      className="h-9 w-9 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50"
                    >
                      <Pencil size={16} />
                    </button>

                    {/* CHECKLIST */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openLearnerChecklist(learner);
                      }}
                      disabled={openingChecklistFor === learner.id}
                      aria-label={`Open ${learner.name}'s checklist`}
                      title="Open learner checklist"
                      className="h-9 w-9 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-50"
                    >
                      <ClipboardList size={16} />
                    </button>

                    {/* DELETE */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUserToDelete(learner);
                      }}
                      aria-label={`Delete ${learner.name}`}
                      title="Delete learner"
                      className="h-9 w-9 rounded-xl border border-red-200 text-red-500 flex items-center justify-center hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            /*
             * EMPTY STATE
             */
            <div className="py-12 text-center">
              <div className="flex justify-center mb-3">
                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                  <Search size={20} className="text-slate-400" />
                </div>
              </div>

              <h3 className="font-medium text-slate-700">
                {search.trim() ? "No learners found" : "No learners yet"}
              </h3>

              <p className="text-sm text-slate-400 mt-1">
                {search.trim()
                  ? `No learner matches "${search.trim()}".`
                  : "Learners will appear here once they are added."}
              </p>

              {search.trim() && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="mt-4 px-4 py-2 rounded-xl border border-slate-200 text-sm hover:bg-slate-50"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>

        {/* PAGINATION */}
        {totalLearners > 0 && (
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mt-8">
            <button
              type="button"
              onClick={goToPreviousPage}
              disabled={!hasPreviousPage || loading}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Prev
            </button>

            <div className="text-sm text-slate-500">
              Page {page + 1} of {Math.max(totalPages, 1)}
            </div>

            <button
              type="button"
              onClick={goToNextPage}
              disabled={!hasNextPage || loading}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </motion.div>

      {/* MODAL */}

      {/* EDIT LEARNER */}
      <EditLearnerModal
        learner={selectedLearner}
        onClose={() => setSelectedLearner(null)}
        onUpdated={() => {
          clearCache(`admin_learners_page_${page}`);

          if (search.trim()) {
            clearCache(
              `admin_learners_search_${search
                .trim()
                .toLowerCase()}_page_${page}`,
            );
          }

          fetchLearners(true);
        }}
      />

      {/* CREATE USER */}
      <CreateUserModal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);

          clearCache(`admin_learners_page_${page}`);

          if (search.trim()) {
            clearCache(
              `admin_learners_search_${search
                .trim()
                .toLowerCase()}_page_${page}`,
            );
          }

          fetchLearners(true);
        }}
        initialRole="student"
      />

      {/* PROFILE */}
      <LearnerProfilePanel
        learner={profileLearner}
        onClose={() => setProfileLearner(null)}
        onUpdated={handleLearnerUpdated}
      />

      {/* DELETE */}
      <DeleteUserModal
        isOpen={Boolean(userToDelete)}
        user={userToDelete}
        loading={deleting}
        onClose={() => !deleting && setUserToDelete(null)}
        onConfirm={deleteUser}
      />

      {/* PERSONAL CHECKLIST */}
      {personalChecklist && (
        <ChecklistBuilderModal
          level={personalChecklist}
          learner={learners.find(
            (learner) => learner.id === personalChecklist.learner_id,
          )}
          onClose={() => setPersonalChecklist(null)}
        />
      )}
    </>
  );
}
