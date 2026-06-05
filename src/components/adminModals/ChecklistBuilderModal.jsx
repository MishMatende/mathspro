// src/components/adminModals/ChecklistBuilderModal.jsx

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "../../lib/supabase";
import { Plus, Pencil, Trash2, ChevronRight, X } from "lucide-react";
import toast from "react-hot-toast";
import { getCache, setCache, clearCache } from "../../lib/cache";
import CreateTopicModal from "./CreateTopicModal";
import EditTopicModal from "./EditTopicModal";
import DeleteTopicModal from "./DeleteTopicModal";

import CreateSubtopicModal from "./CreateSubtopicModal";
import EditSubtopicModal from "./EditSubtopicModal";
import DeleteSubtopicModal from "./DeleteSubtopicModal";

export default function ChecklistBuilderModal({ level, onClose }) {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateTopic, setShowCreateTopic] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [deletingTopic, setDeletingTopic] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [showCreateSubtopic, setShowCreateSubtopic] = useState(false);
  const [editingSubtopic, setEditingSubtopic] = useState(null);
  const [deletingSubtopic, setDeletingSubtopic] = useState(null);
  const [expandedTopics, setExpandedTopics] = useState({});

  const CACHE_KEY = `checklist_builder_${level.id}`;

  const toggleTopic = (topicId) => {
    setExpandedTopics((prev) => ({
      ...prev,
      [topicId]: !prev[topicId],
    }));
  };

  const loadChecklist = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);

      const { data, error } = await supabase
        .from("checklist_topics")
        .select(
          `
          *,
          checklist_subtopics (
            *
          )
        `,
        )
        .eq("level_id", level.id)
        .order("sort_order");

      if (error) throw error;

      setTopics(data || []);

      setCache(CACHE_KEY, data || []);
    } catch (error) {
      console.error(error);

      toast.error("Failed to load checklist");
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [CACHE_KEY, level.id]);

  useEffect(() => {
    const cached = getCache(CACHE_KEY);

    if (cached) {
      setTopics(cached);
      setLoading(false);

      loadChecklist(false);
    } else {
      loadChecklist(true);
    }
  }, [CACHE_KEY, loadChecklist]);

  function refresh() {
    clearCache(CACHE_KEY);

    loadChecklist();
  }

  async function handleDeleteTopic() {
    if (!deletingTopic) return;

    try {
      const { error } = await supabase
        .from("checklist_topics")
        .delete()
        .eq("id", deletingTopic.id);

      if (error) throw error;

      toast.success("Topic deleted");

      setDeletingTopic(null);

      refresh();
    } catch (error) {
      console.error(error);

      toast.error("Failed to delete topic");
    }
  }

  async function handleDeleteSubtopic() {
    if (!deletingSubtopic) return;

    try {
      const { error } = await supabase
        .from("checklist_subtopics")
        .delete()
        .eq("id", deletingSubtopic.id);

      if (error) throw error;

      toast.success("Subtopic deleted");

      setDeletingSubtopic(null);

      refresh();
    } catch (error) {
      console.error(error);

      toast.error("Failed to delete subtopic");
    }
  }

  const modal = (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm flex justify-center items-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl w-[94vw] md:w-[72vw] max-w-5xl h-[88vh] max-h-[calc(100vh-2rem)] flex flex-col overflow-hidden shadow-2xl"
      >
        <div className="p-4 sm:p-6 border-b flex justify-between items-start gap-4 shrink-0">
          <div className="min-w-0">
            <h2 className="text-xl sm:text-3xl font-bold text-gray-900 truncate">
              {level.name}
            </h2>

            <p className="text-gray-500">Checklist builder</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowCreateTopic(true)}
              className="
                flex items-center gap-2
                px-4 sm:px-5 py-3
                rounded-2xl
                border
                bg-white
                hover:bg-orange-200
              "
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Add topic</span>
            </button>

            <button
              onClick={onClose}
              aria-label="Close checklist builder"
              className="
                h-12 w-12
                rounded-2xl
                border
                bg-white
                flex items-center justify-center
                hover:bg-gray-100
              "
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : topics.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="font-semibold text-lg mb-2">No Topics Yet</h3>

              <p className="text-gray-500 mb-5">
                Create your first topic for this checklist.
              </p>

              <button
                onClick={() => setShowCreateTopic(true)}
                className="px-5 py-3 rounded-2xl bg-orange-500 text-white"
              >
                Create Topic
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {topics.map((topic) => {
                const isExpanded = expandedTopics[topic.id];

                return (
                  <div
                    key={topic.id}
                    className="
          overflow-hidden
          rounded-3xl
          border
          border-stone-300
          bg-stone-100
        "
                  >
                    {/* Topic Header */}

                    <div className="flex items-center justify-between px-5 py-4">
                      <div
                        className="flex items-center gap-4 cursor-pointer flex-1"
                        onClick={() => toggleTopic(topic.id)}
                      >
                        <ChevronRight
                          size={18}
                          className={`transition-transform ${
                            isExpanded ? "rotate-90" : ""
                          }`}
                        />

                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">
                            {topic.title}
                          </h3>

                          <p className="text-sm text-gray-500">
                            {topic.checklist_subtopics?.length || 0} subtopics
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedTopic(topic);
                            setShowCreateSubtopic(true);
                          }}
                          className="
                h-10 w-10
                rounded-xl
                border
                bg-white
                flex items-center justify-center
                hover:bg-green-200
              "
                        >
                          <Plus size={16} />
                        </button>

                        <button
                          onClick={() => setEditingTopic(topic)}
                          className="
                h-10 w-10
                rounded-xl
                border
                bg-white
                flex items-center justify-center
                hover:bg-blue-200
              "
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          onClick={() => setDeletingTopic(topic)}
                          className="
                h-10 w-10
                rounded-xl
                border
                bg-white
                flex items-center justify-center
                hover:bg-red-200
              "
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Expanded Content */}

                    {isExpanded && (
                      <div className="border-t border-stone-300 bg-white">
                        {topic.checklist_subtopics
                          ?.sort(
                            (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
                          )
                          .map((subtopic) => (
                            <div
                              key={subtopic.id}
                              className="
                    flex items-center justify-between
                    px-5 py-4
                    border-b border-gray-100
                    last:border-b-0
                  "
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-orange-500" />

                                <span className="text-gray-800">
                                  {subtopic.title}
                                </span>
                              </div>

                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedTopic(topic);
                                    setEditingSubtopic(subtopic);
                                  }}
                                  className="
                        h-9 w-9
                        rounded-xl
                        border
                        flex items-center justify-center
                        hover:bg-blue-200
                      "
                                >
                                  <Pencil size={14} />
                                </button>

                                <button
                                  onClick={() => {
                                    setSelectedTopic(topic);
                                    setDeletingSubtopic(subtopic);
                                  }}
                                  className="
                        h-9 w-9
                        rounded-xl
                        border
                        flex items-center justify-center
                        hover:bg-red-200
                      "
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {showCreateTopic && (
        <CreateTopicModal
          levelId={level.id}
          onClose={() => setShowCreateTopic(false)}
          onCreated={() => {
            setShowCreateTopic(false);
            refresh();
          }}
        />
      )}

      {editingTopic && (
        <EditTopicModal
          topic={editingTopic}
          onClose={() => setEditingTopic(null)}
          onUpdated={() => {
            setEditingTopic(null);
            refresh();
          }}
        />
      )}

      {deletingTopic && (
        <DeleteTopicModal
          topic={deletingTopic}
          onClose={() => setDeletingTopic(null)}
          onConfirm={handleDeleteTopic}
        />
      )}

      {showCreateSubtopic && selectedTopic && (
        <CreateSubtopicModal
          topic={selectedTopic}
          onClose={() => {
            setShowCreateSubtopic(false);
            setSelectedTopic(null);
          }}
          onCreated={() => {
            setShowCreateSubtopic(false);
            setSelectedTopic(null);
            refresh();
          }}
        />
      )}

      {editingSubtopic && (
        <EditSubtopicModal
          subtopic={editingSubtopic}
          onClose={() => {
            setEditingSubtopic(null);
            setSelectedTopic(null);
          }}
          onUpdated={() => {
            setEditingSubtopic(null);
            setSelectedTopic(null);
            refresh();
          }}
        />
      )}

      {deletingSubtopic && (
        <DeleteSubtopicModal
          subtopic={deletingSubtopic}
          onClose={() => {
            setDeletingSubtopic(null);
            setSelectedTopic(null);
          }}
          onConfirm={handleDeleteSubtopic}
        />
      )}
    </div>
  );

  return createPortal(modal, document.body);
}
