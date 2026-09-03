import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  GripVertical,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "../../lib/supabase";

export default function AdminTopicLibraryPage() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [query, setQuery] = useState("");
  const [newSubtopics, setNewSubtopics] = useState({});

  const loadTopics = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("topic_library_topics")
      .select("*, topic_library_subtopics(*)")
      .order("sort_order")
      .order("title");

    setLoading(false);
    if (error) {
      console.error(error);
      toast.error("Failed to load topic library");
      return;
    }
    setTopics(data || []);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(loadTopics, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadTopics]);

  const filteredTopics = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return topics;
    return topics.filter(
      (topic) =>
        topic.title.toLowerCase().includes(search) ||
        topic.topic_library_subtopics?.some((subtopic) =>
          subtopic.title.toLowerCase().includes(search),
        ),
    );
  }, [query, topics]);

  const exactMatch = topics.some(
    (topic) => topic.title.toLowerCase() === query.trim().toLowerCase(),
  );

  async function addTopic(event) {
    event.preventDefault();
    const title = query.trim();
    if (!title || exactMatch) return;
    const { error } = await supabase.from("topic_library_topics").insert({
      title,
      sort_order: topics.length,
    });
    if (error) return toast.error("Failed to add topic");
    setQuery("");
    toast.success("Topic added to library");
    loadTopics();
  }

  async function rename(table, item, label) {
    const title = window.prompt(`${label} name`, item.title)?.trim();
    if (!title || title === item.title) return;
    const { error } = await supabase
      .from(table)
      .update({ title, updated_at: new Date().toISOString() })
      .eq("id", item.id);
    if (error) return toast.error(`Failed to update ${label.toLowerCase()}`);
    loadTopics();
  }

  async function remove(table, item, message) {
    if (!window.confirm(message)) return;
    const { error } = await supabase.from(table).delete().eq("id", item.id);
    if (error) return toast.error("Delete failed");
    toast.success("Removed from library");
    loadTopics();
  }

  async function addSubtopic(event, topic) {
    event.preventDefault();
    const title = (newSubtopics[topic.id] || "").trim();
    if (!title) return;
    const { error } = await supabase.from("topic_library_subtopics").insert({
      topic_id: topic.id,
      title,
      sort_order: topic.topic_library_subtopics?.length || 0,
    });
    if (error) return toast.error("Failed to add subtopic");
    setNewSubtopics((current) => ({ ...current, [topic.id]: "" }));
    loadTopics();
  }

  return (
    <div className="min-h-full px-4 py-7 sm:px-7 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Topic library
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Reusable topics and subtopics you can add to any learner
              checklist.
            </p>
          </div>
          <button
            type="button"
            onClick={loadTopics}
            disabled={loading}
            aria-label="Refresh topic library"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-orange-200 bg-white text-slate-500 shadow-sm transition hover:border-orange-300 hover:text-orange-600 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </header>

        <form
          onSubmit={addTopic}
          className="mt-8 flex items-center gap-3 border-b border-slate-800 pb-3"
        >
          {query ? (
            <Search size={18} className="text-orange-500" />
          ) : (
            <Plus size={18} className="text-orange-500" />
          )}
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search or name a new topic"
            className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
          <button
            disabled={!query.trim() || exactMatch}
            className="shrink-0 text-sm font-semibold text-orange-600 transition hover:text-orange-700 disabled:text-slate-400"
          >
            {exactMatch ? "Already in library" : "Add to library"}
          </button>
        </form>
        {query && (
          <p className="mt-2 text-xs text-slate-500">
            Showing {filteredTopics.length} matching{" "}
            {filteredTopics.length === 1 ? "topic" : "topics"}. Use “Add to
            library” if this is new.
          </p>
        )}

        <div className="mt-7 overflow-hidden rounded-2xl border border-orange-200 bg-white shadow-[0_12px_40px_rgba(124,45,18,0.06)]">
          {loading && topics.length === 0 ? (
            <div className="p-12 text-center text-sm text-slate-500">
              Loading topic library...
            </div>
          ) : filteredTopics.length === 0 ? (
            <div className="p-12 text-center text-sm text-slate-500">
              {query
                ? "No matching topics. You can add this one to the library."
                : "No topics in the library yet."}
            </div>
          ) : (
            filteredTopics.map((topic) => {
              const isExpanded = expanded[topic.id];
              const subtopics = [...(topic.topic_library_subtopics || [])].sort(
                (a, b) => a.sort_order - b.sort_order,
              );
              const initials = topic.title
                .split(/\s+/)
                .slice(0, 2)
                .map((word) => word[0])
                .join("")
                .toUpperCase();

              return (
                <section
                  key={topic.id}
                  className="border-b border-orange-100 last:border-b-0"
                >
                  <div className="group flex items-center gap-2 px-4 py-5 sm:gap-3 sm:px-6">
                    <GripVertical
                      size={16}
                      className="hidden text-orange-200 sm:block"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setExpanded((current) => ({
                          ...current,
                          [topic.id]: !isExpanded,
                        }))
                      }
                      className="text-slate-500"
                    >
                      {isExpanded ? (
                        <ChevronDown size={17} />
                      ) : (
                        <ChevronRight size={17} />
                      )}
                    </button>
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-xs font-semibold text-orange-700">
                      {initials}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setExpanded((current) => ({
                          ...current,
                          [topic.id]: !isExpanded,
                        }))
                      }
                      className="min-w-0 flex-1 text-left"
                    >
                      <h2 className="truncate font-semibold text-slate-900">
                        {topic.title}
                      </h2>
                      <p className="text-sm text-slate-500">
                        {subtopics.length}{" "}
                        {subtopics.length === 1 ? "subtopic" : "subtopics"}
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        rename("topic_library_topics", topic, "Topic")
                      }
                      aria-label={`Rename ${topic.title}`}
                      className="rounded-lg p-2 text-slate-400 opacity-100 transition hover:bg-orange-50 hover:text-orange-600 sm:opacity-0 sm:group-hover:opacity-100"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        remove(
                          "topic_library_topics",
                          topic,
                          `Delete “${topic.title}” and all its subtopics?`,
                        )
                      }
                      aria-label={`Delete ${topic.title}`}
                      className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="ml-10 mr-4 border-t border-orange-100 pb-4 pt-2 sm:ml-16 sm:mr-6">
                      {subtopics.map((subtopic) => (
                        <div
                          key={subtopic.id}
                          className="group/sub flex items-center gap-3 py-2.5 text-sm"
                        >
                          <span className="h-1 w-1 rounded-full bg-orange-300" />
                          <span className="flex-1 text-slate-700">
                            {subtopic.title}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              rename(
                                "topic_library_subtopics",
                                subtopic,
                                "Subtopic",
                              )
                            }
                            className="p-1 text-slate-400 opacity-0 hover:text-orange-600 group-hover/sub:opacity-100"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              remove(
                                "topic_library_subtopics",
                                subtopic,
                                `Delete “${subtopic.title}”?`,
                              )
                            }
                            className="p-1 text-slate-400 hover:text-red-500"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                      <form
                        onSubmit={(event) => addSubtopic(event, topic)}
                        className="mt-2 flex items-center gap-2"
                      >
                        <input
                          value={newSubtopics[topic.id] || ""}
                          onChange={(event) =>
                            setNewSubtopics((current) => ({
                              ...current,
                              [topic.id]: event.target.value,
                            }))
                          }
                          placeholder="Add a subtopic"
                          className="min-w-0 flex-1 rounded-lg border border-orange-200 bg-orange-50/40 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                        />
                        <button className="px-2 text-sm font-semibold text-orange-600">
                          Add
                        </button>
                      </form>
                    </div>
                  )}
                </section>
              );
            })
          )}
        </div>

        <p className="mt-4 text-sm text-slate-500">
          {topics.length} {topics.length === 1 ? "topic" : "topics"} in the
          library
        </p>
      </div>
    </div>
  );
}
