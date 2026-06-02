// src/pages/admin/AdminChecklistPage.jsx

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Plus, RefreshCw, Pencil, Trash2, CheckSquare } from "lucide-react";
import { getCache, setCache, clearCache } from "../../lib/cache";
import CreateChecklistItemModal from "../../components/adminModals/CreateCheklistItemModal";
import EditChecklistItemModal from "../../components/adminModals/EditChecklistItemModal";

import toast from "react-hot-toast";
import DeleteChecklistItemModal from "../../components/adminModals/DeleteChecklistItemModal";

export default function AdminChecklistPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState("All");
  const [showCreate, setShowCreate] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  const CHECKLIST_CACHE_KEY = "admin_checklist_templates";

  async function fetchTemplates(showLoader = true) {
    try {
      if (showLoader) setLoading(true);

      const { data, error } = await supabase
        .from("checklist_templates")
        .select("*")
        .order("grade")
        .order("unit")
        .order("sort_order");

      if (error) throw error;

      setTemplates(data || []);

      setCache(CHECKLIST_CACHE_KEY, data || []);
    } catch (error) {
      console.error(error);

      toast.error("Failed to load checklist templates");
    } finally {
      if (showLoader) setLoading(false);
    }
  }

  useEffect(() => {
    const cached = getCache(CHECKLIST_CACHE_KEY);

    if (cached) {
      setTemplates(cached);
      setLoading(false);

      fetchTemplates(false);
    } else {
      fetchTemplates(true);
    }
  }, []);

  async function handleDelete() {
    if (!deleteItem) return;

    try {
      const { error } = await supabase
        .from("checklist_templates")
        .delete()
        .eq("id", deleteItem.id);

      if (error) throw error;

      clearCache(CHECKLIST_CACHE_KEY);

      toast.success("Skill deleted");

      setDeleteItem(null);

      fetchTemplates();
    } catch (error) {
      console.error(error);

      toast.error("Failed to delete skill");
    }
  }

  const grades = useMemo(() => {
    const unique = [...new Set(templates.map((x) => x.grade))];
    return ["All", ...unique];
  }, [templates]);

  const filteredTemplates = useMemo(() => {
    if (selectedGrade === "All") return templates;

    return templates.filter((item) => item.grade === selectedGrade);
  }, [templates, selectedGrade]);

  const grouped = useMemo(() => {
    const groups = {};

    filteredTemplates.forEach((item) => {
      const key = `${item.grade}__${item.unit}`;

      if (!groups[key]) {
        groups[key] = {
          grade: item.grade,
          unit: item.unit,
          items: [],
        };
      }

      groups[key].items.push(item);
    });

    return Object.values(groups);
  }, [filteredTemplates]);

  async function handleRefresh() {
    clearCache(CHECKLIST_CACHE_KEY);

    await fetchTemplates(true);

    toast.success("Checklist refreshed");
  }

  return (
    <div className="p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Learning Checklists</h1>

          <p className="text-gray-500">
            Create and manage checklist templates.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl border"
          >
            <RefreshCw size={18} />
            Refresh
          </button>

          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-orange-500 text-white hover:bg-orange-600"
          >
            <Plus size={18} />
            Add Skill
          </button>
        </div>
      </div>

      <div className="mb-6">
        <select
          value={selectedGrade}
          onChange={(e) => setSelectedGrade(e.target.value)}
          className="px-4 py-3 rounded-2xl border"
        >
          {grades.map((grade) => (
            <option key={grade}>{grade}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="rounded-3xl bg-white p-12 text-center shadow-sm">
          Loading checklist templates...
        </div>
      ) : grouped.length === 0 ? (
        <div className="rounded-3xl bg-white p-12 text-center shadow-sm">
          <CheckSquare className="mx-auto mb-4 text-gray-400" size={48} />

          <h2 className="font-semibold text-lg">No checklist items found</h2>

          <p className="text-gray-500">Create your first checklist skill.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map((group) => (
            <div
              key={`${group.grade}-${group.unit}`}
              className="bg-white rounded-3xl shadow-sm overflow-hidden"
            >
              <div className="border-b p-5">
                <h2 className="text-xl font-bold">{group.grade}</h2>

                <p className="text-gray-500">{group.unit}</p>
              </div>

              <div>
                {group.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between px-5 py-4 border-b last:border-b-0"
                  >
                    <div>
                      <p className="font-medium">{item.skill}</p>

                      <p className="text-sm text-gray-400">
                        Sort Order: {item.sort_order}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingItem(item)}
                        className="p-2 rounded-xl border hover:bg-gray-50"
                      >
                        <Pencil size={18} />
                      </button>

                      <button
                        onClick={() => setDeleteItem(item)}
                        className="p-2 rounded-xl border hover:bg-red-50 text-red-500"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <CreateChecklistItemModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            clearCache(CHECKLIST_CACHE_KEY);
            setShowCreate(false);
            fetchTemplates();
          }}
        />
      )}

      {editingItem && (
        <EditChecklistItemModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onUpdated={() => {
            clearCache(CHECKLIST_CACHE_KEY);
            setEditingItem(null);
            fetchTemplates();
          }}
        />
      )}

      {deleteItem && (
        <DeleteChecklistItemModal
          item={deleteItem}
          onClose={() => setDeleteItem(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
