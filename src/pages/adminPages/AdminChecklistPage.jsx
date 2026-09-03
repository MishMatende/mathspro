// src/pages/admin/AdminChecklistPage.jsx

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import {
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  Layers,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import { getCache, setCache, clearCache } from "../../lib/cache";
import CreateChecklistModal from "../../components/adminModals/CreateChecklistModal";
import EditChecklistModal from "../../components/adminModals/EditChecklistModal";
import DeleteChecklistModal from "../../components/adminModals/DeleteChecklistModal";
import ChecklistBuilderModal from "../../components/adminModals/ChecklistBuilderModal";

const CACHE_KEY = "checklist_level_templates";

export default function AdminChecklistPage() {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingLevel, setEditingLevel] = useState(null);
  const [deletingLevel, setDeletingLevel] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);

  async function fetchLevels(showLoader = true) {
    try {
      if (showLoader) setLoading(true);

      const { data, error } = await supabase
        .from("checklist_levels")
        .select(
          `
          *,
          checklist_topics (
            id,
            checklist_subtopics (
              id
            )
          )
        `,
        )
        .is("learner_id", null)
        .order("sort_order");

      if (error) throw error;

      setLevels(data || []);

      setCache(CACHE_KEY, data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load checklists");
    } finally {
      if (showLoader) setLoading(false);
    }
  }

  useEffect(() => {
    const cached = getCache(CACHE_KEY);

    if (cached) {
      setLevels(cached);
      setLoading(false);

      fetchLevels(false);
    } else {
      fetchLevels(true);
    }
  }, []);

  function invalidateAndReload() {
    clearCache(CACHE_KEY);
    fetchLevels();
  }

  async function handleDelete() {
    if (!deletingLevel) return;

    try {
      const { error } = await supabase
        .from("checklist_levels")
        .delete()
        .eq("id", deletingLevel.id);

      if (error) throw error;

      toast.success("Checklist deleted");

      setDeletingLevel(null);

      invalidateAndReload();
    } catch (error) {
      console.error(error);

      toast.error("Failed to delete checklist");
    }
  }

  return (
    <div className="min-h-full bg-linear-to-br from-slate-50 via-white to-orange-50/40 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Learning Checklists</h1>

          <p className="text-gray-500">Manage checklist templates by level.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-orange-500 text-white hover:bg-orange-600"
          >
            <Plus size={18} />
            New Checklist
          </button>

          <button
            onClick={() => {
              clearCache(CACHE_KEY);
              fetchLevels();
            }}
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center shadow-sm">
          Loading checklists...
        </div>
      ) : levels.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center shadow-sm">
          <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />

          <h2 className="font-semibold text-xl">No Checklists Yet</h2>

          <p className="text-gray-500 mt-2">Create your first checklist.</p>

          <button
            onClick={() => setShowCreate(true)}
            className="mt-5 px-5 py-3 rounded-2xl bg-orange-500 text-white"
          >
            Create Checklist
          </button>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {levels.map((level) => {
            const topicCount = level.checklist_topics?.length || 0;

            const subtopicCount =
              level.checklist_topics?.reduce(
                (total, topic) =>
                  total + (topic.checklist_subtopics?.length || 0),
                0,
              ) || 0;

            return (
              <div
                key={level.id}
                onClick={() => setSelectedLevel(level)}
                className="
    overflow-hidden
    rounded-[28px]
    border border-slate-200
    bg-white
    text-slate-900
    cursor-pointer
    transition-all
    hover:-translate-y-1
    shadow-sm hover:border-orange-200 hover:shadow-[0_18px_45px_rgba(249,115,22,0.12)]
  "
              >
                {/* Header */}
                <div className="bg-orange-500 p-6">
                  <div
                    className="
        inline-flex
        items-center
        gap-2
        px-3 py-1
        rounded-full
        bg-orange-400/40
        text-white
        text-xs
        font-medium
        mb-4
      "
                  >
                    <BookOpen size={12} />
                    Grade level
                  </div>

                  <h3 className="text-4xl font-bold tracking-tight text-white">
                    {level.name}
                  </h3>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="
              w-10 h-10
              rounded-xl
              bg-stone-100
              flex items-center justify-center
            "
                        >
                          <Layers size={18} className="text-orange-500" />
                        </div>

                        <span className="text-slate-700">Topics</span>
                      </div>

                      <span className="font-semibold">{topicCount}</span>
                    </div>

                    <div className="border-t border-slate-100" />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="
              w-10 h-10
              rounded-xl
              bg-stone-100
              flex items-center justify-center
            "
                        >
                          <BookOpen size={18} className="text-orange-500" />
                        </div>

                        <span className="text-slate-700">Subtopics</span>
                      </div>

                      <span className="font-semibold">{subtopicCount}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-3 mt-6">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingLevel(level);
                      }}
                      className="
          flex items-center justify-center gap-2
          h-12
          rounded-xl
          border border-slate-200
          text-slate-700
          hover:border-orange-200
          hover:bg-orange-50
          hover:text-orange-700
          transition
        "
                    >
                      <Pencil size={16} />
                      Edit
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingLevel(level);
                      }}
                      className="
          flex items-center justify-center gap-2
          h-12
          rounded-xl
          border border-red-100
          text-red-500
          hover:bg-red-500/10
          transition
        "
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreate && (
        <CreateChecklistModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            invalidateAndReload();
          }}
        />
      )}

      {editingLevel && (
        <EditChecklistModal
          level={editingLevel}
          onClose={() => setEditingLevel(null)}
          onUpdated={() => {
            setEditingLevel(null);
            invalidateAndReload();
          }}
        />
      )}

      {deletingLevel && (
        <DeleteChecklistModal
          level={deletingLevel}
          onClose={() => setDeletingLevel(null)}
          onConfirm={handleDelete}
        />
      )}

      {selectedLevel && (
        <ChecklistBuilderModal
          level={selectedLevel}
          onClose={() => {
            setSelectedLevel(null);
            invalidateAndReload();
          }}
        />
      )}
    </div>
  );
}
