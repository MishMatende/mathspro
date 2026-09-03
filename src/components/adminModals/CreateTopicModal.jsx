import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, CheckCircle2, Search, X } from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "../../lib/supabase";

export default function CreateTopicModal({ levelId, onClose, onCreated }) {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedSubtopics, setSelectedSubtopics] = useState([]);
  const [search, setSearch] = useState("");
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadTopics() {
      const { data, error } = await supabase
        .from("topic_library_topics")
        .select(
          "id, title, sort_order, topic_library_subtopics(id, title, sort_order)",
        )
        .order("sort_order")
        .order("title");

      setLoadingTopics(false);
      if (error) {
        console.error(error);
        toast.error("Failed to load the topic library");
        return;
      }
      setTopics(data || []);
    }

    loadTopics();
  }, []);

  const matchingTopics = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) return topics;
    return topics.filter((topic) => topic.title.toLowerCase().includes(value));
  }, [search, topics]);

  const subtopics = useMemo(
    () =>
      [...(selectedTopic?.topic_library_subtopics || [])].sort(
        (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
      ),
    [selectedTopic],
  );

  function chooseTopic(topic) {
    setSelectedTopic(topic);
    setSelectedSubtopics(
      topic.topic_library_subtopics?.map((item) => item.id) || [],
    );
  }

  function toggleSubtopic(id) {
    setSelectedSubtopics((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!selectedTopic) return;

    try {
      setSaving(true);
      const { error } = await supabase.rpc("add_library_topic_to_checklist", {
        p_level_id: levelId,
        p_library_topic_id: selectedTopic.id,
        p_subtopic_ids: selectedSubtopics,
        p_sort_order: 0,
      });
      if (error) throw error;
      toast.success("Topic added to checklist");
      onCreated();
    } catch (error) {
      console.error(error);
      toast.error("Failed to add topic");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-110 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className="flex max-h-[86vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-white/60 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.28)]">
        <header className="flex items-start justify-between gap-4 border-b border-orange-100 px-5 py-5 sm:px-7">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-orange-600">
              <CheckCircle2 size={15} /> Checklist builder
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              {selectedTopic ? "Choose subtopics" : "Choose a topic"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {selectedTopic
                ? `Select what to include under ${selectedTopic.title}.`
                : "Search your topic library and select one to continue."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={18} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7">
          {!selectedTopic ? (
            <>
              <div className="relative">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Start typing to search topics..."
                  autoFocus
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                />
              </div>

              <div className="mt-4 space-y-2">
                {loadingTopics ? (
                  <p className="py-10 text-center text-sm text-slate-500">
                    Loading topics...
                  </p>
                ) : matchingTopics.length ? (
                  matchingTopics.map((topic) => (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => chooseTopic(topic)}
                      className="group flex w-full items-center gap-4 rounded-2xl border border-slate-200 p-4 text-left transition hover:border-orange-300 hover:bg-orange-50/60"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 font-semibold text-orange-700">
                        {topic.title.charAt(0).toUpperCase()}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold text-slate-800">
                          {topic.title}
                        </span>
                        <span className="text-sm text-slate-500">
                          {topic.topic_library_subtopics?.length || 0} subtopics
                        </span>
                      </span>
                      <span className="text-sm font-medium text-orange-600 opacity-0 transition group-hover:opacity-100">
                        Select
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="py-10 text-center text-sm text-slate-500">
                    No matching library topics.
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setSelectedTopic(null)}
                className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-orange-600"
              >
                <ArrowLeft size={16} /> Choose a different topic
              </button>
              <div className="flex items-center justify-between rounded-2xl bg-orange-50 px-4 py-3">
                <div>
                  <p className="font-semibold text-slate-900">
                    {selectedTopic.title}
                  </p>
                  <p className="text-xs text-slate-500">
                    {selectedSubtopics.length} of {subtopics.length} selected
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedSubtopics(
                      selectedSubtopics.length === subtopics.length
                        ? []
                        : subtopics.map((item) => item.id),
                    )
                  }
                  className="text-sm font-semibold text-orange-600"
                >
                  {selectedSubtopics.length === subtopics.length
                    ? "Clear all"
                    : "Select all"}
                </button>
              </div>
              <div className="mt-3 space-y-2">
                {subtopics.map((subtopic) => {
                  const checked = selectedSubtopics.includes(subtopic.id);
                  return (
                    <button
                      key={subtopic.id}
                      type="button"
                      onClick={() => toggleSubtopic(subtopic.id)}
                      className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${checked ? "border-orange-300 bg-orange-50/50 text-slate-900" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${checked ? "border-orange-500 bg-orange-500 text-white" : "border-slate-300 bg-white"}`}
                      >
                        {checked && <Check size={13} strokeWidth={3} />}
                      </span>
                      {subtopic.title}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {selectedTopic && (
          <footer className="flex items-center justify-between gap-4 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-7">
            <p className="text-sm text-slate-500">
              The selected items will be copied into this checklist.
            </p>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving || selectedSubtopics.length === 0}
              className="shrink-0 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Adding..."
                : `Add ${selectedSubtopics.length} subtopics`}
            </button>
          </footer>
        )}
      </div>
    </div>
  );
}
