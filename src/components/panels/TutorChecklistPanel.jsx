// src/components/tutor/TutorChecklistPanel.jsx

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";
import {
  CheckCircle2,
  BookOpen,
  Loader2,
  ChevronDown,
  ChevronUp,
  Sigma,
  Percent,
  FunctionSquare,
  RefreshCw,
} from "lucide-react";
import { getCache, setCache } from "../../lib/cache";

export default function TutorChecklistPanel({ learner }) {
  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [expandedTopics, setExpandedTopics] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  const CHECKLIST_CACHE_KEY = `learner_checklist_panel_${learner?.id}`;

  async function loadChecklist(showLoader = true) {
    if (!learner?.id) return;

    try {
      if (showLoader) {
        setLoading(true);
      }

      const { data: assignment, error: assignmentError } = await supabase
        .from("learner_checklists")
        .select(
          `
            level_id,
            checklist_levels (
              id,
              name
            )
          `,
        )
        .eq("learner_id", learner.id)
        .maybeSingle();

      if (assignmentError) throw assignmentError;

      if (!assignment?.level_id) {
        setTopics([]);
        setProgressMap({});

        setCache(CHECKLIST_CACHE_KEY, {
          topics: [],
          progressMap: {},
        });

        return;
      }

      const { data: topicsData, error: topicsError } = await supabase
        .from("checklist_topics")
        .select(
          `
            *,
            checklist_subtopics (
              *
            )
          `,
        )
        .eq("level_id", assignment.level_id)
        .order("sort_order");

      if (topicsError) throw topicsError;

      const { data: progressData, error: progressError } = await supabase
        .from("learner_subtopic_progress")
        .select("*")
        .eq("learner_id", learner.id);

      if (progressError) throw progressError;

      const map = {};

      (progressData || []).forEach((item) => {
        map[item.subtopic_id] = item.completed;
      });

      setTopics(topicsData || []);
      setProgressMap(map);

      setCache(CHECKLIST_CACHE_KEY, {
        topics: topicsData || [],
        progressMap: map,
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to load checklist");
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    if (!learner?.id) return;

    const cached = getCache(CHECKLIST_CACHE_KEY);

    if (cached) {
      setTopics(cached.topics || []);
      setProgressMap(cached.progressMap || {});
      setLoading(false);
      return;
    }

    loadChecklist();
  }, [learner?.id]);

  useEffect(() => {
    const initial = {};

    topics.forEach((topic) => {
      initial[topic.id] = false;
    });

    setExpandedTopics(initial);
  }, [topics]);

  async function toggleSubtopic(subtopicId, checked) {
    const previous = { ...progressMap };

    const optimistic = {
      ...progressMap,
      [subtopicId]: checked,
    };

    setProgressMap(optimistic);

    setCache(CHECKLIST_CACHE_KEY, {
      topics,
      progressMap: optimistic,
    });

    try {
      const { error } = await supabase.from("learner_subtopic_progress").upsert(
        {
          learner_id: learner.id,
          subtopic_id: subtopicId,
          completed: checked,
          completed_at: checked ? new Date().toISOString() : null,
        },
        {
          onConflict: "learner_id,subtopic_id",
        },
      );

      if (error) throw error;
    } catch (error) {
      console.error(error);

      setProgressMap(previous);

      setCache(CHECKLIST_CACHE_KEY, {
        topics,
        progressMap: previous,
      });

      toast.error("Failed to update progress");
    }
  }

  function getTopicProgress(topic) {
    const total = topic.checklist_subtopics?.length || 0;

    const completed =
      topic.checklist_subtopics?.filter((s) => progressMap[s.id]).length || 0;

    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    return {
      total,
      completed,
      percent,
    };
  }

  const overallProgress = useMemo(() => {
    const allSubtopics = topics.flatMap(
      (topic) => topic.checklist_subtopics || [],
    );

    const total = allSubtopics.length;

    const completed = allSubtopics.filter(
      (subtopic) => progressMap[subtopic.id],
    ).length;

    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    return {
      total,
      completed,
      percent,
    };
  }, [topics, progressMap]);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-10 text-center">
        <Loader2 className="animate-spin mx-auto mb-4" />
        <p>Loading checklist...</p>
      </div>
    );
  }

  function getTopicIcon(title) {
    const text = title.toLowerCase();

    if (text.includes("algebra")) {
      return <Sigma size={18} className="text-indigo-600" />;
    }

    if (text.includes("fraction")) {
      return <FunctionSquare size={18} className="text-blue-600" />;
    }

    if (text.includes("probability")) {
      return <Percent size={18} className="text-emerald-600" />;
    }

    return <BookOpen size={18} className="text-gray-600" />;
  }

  if (topics.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center">
        <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />

        <h3 className="font-semibold text-xl">No Checklist Assigned</h3>

        <p className="text-gray-500 mt-2">
          Ask an administrator to assign a checklist to this learner.
        </p>
      </div>
    );
  }

  async function handleRefresh() {
    setRefreshing(true);

    await loadChecklist(false);

    setRefreshing(false);

    toast.success("Checklist refreshed");
  }

  return (
    <div className="space-y-4">
      {/* OVERALL */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Checklist</h2>

          <p className="text-sm text-gray-500 mt-1">
            Track learner progress across topics and subtopics.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="
      flex items-center gap-2
      px-4 py-2
      rounded-xl
      border
      bg-white
      hover:bg-gray-50
      transition
    "
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500 font-medium">
              Overall progress
            </p>

            <h2 className="text-5xl font-bold mt-2">
              {overallProgress.completed}/{overallProgress.total}
            </h2>
          </div>

          <div className="text-right">
            <div className="text-4xl font-bold">{overallProgress.percent}%</div>

            <p className="text-sm text-gray-500 mt-2">
              {overallProgress.completed} of {overallProgress.total} topics
              complete
            </p>
          </div>
        </div>
      </div>

      {/* TOPICS */}

      {topics.map((topic) => {
        const progress = getTopicProgress(topic);

        const expanded = expandedTopics[topic.id];

        return (
          <div
            key={topic.id}
            className="
            rounded-3xl
            border
            border-gray-200
            bg-white
            overflow-hidden
          "
          >
            {/* HEADER */}

            <button
              onClick={() =>
                setExpandedTopics((prev) => ({
                  ...prev,
                  [topic.id]: !prev[topic.id],
                }))
              }
              className="
              w-full
              p-5
              flex
              items-center
              justify-between
              hover:bg-gray-50
              transition
            "
            >
              <div className="flex items-center gap-4">
                <div
                  className="
                  w-12 h-12
                  rounded-2xl
                  bg-gray-100
                  flex items-center justify-center
                "
                >
                  {getTopicIcon(topic.title)}
                </div>

                <div className="text-left">
                  <h3 className="font-semibold text-lg">{topic.title}</h3>

                  <p className="text-sm text-gray-500">
                    {progress.completed}/{progress.total} subtopics
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-gray-500">
                  {progress.percent}%
                </span>

                {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </button>

            {/* SUBTOPICS */}

            {expanded && (
              <div className="border-t border-gray-100">
                {topic.checklist_subtopics
                  ?.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
                  .map((subtopic) => {
                    const completed = progressMap[subtopic.id];

                    return (
                      <div
                        key={subtopic.id}
                        className="
                        flex
                        items-center
                        justify-between
                        px-5
                        py-4
                        border-b
                        last:border-b-0
                        border-gray-100
                      "
                      >
                        <label className="flex items-center gap-3 cursor-pointer flex-1">
                          <input
                            type="checkbox"
                            checked={!!completed}
                            onChange={(e) =>
                              toggleSubtopic(subtopic.id, e.target.checked)
                            }
                            className="
                            w-5 h-5
                            rounded
                            accent-orange-500
                          "
                          />

                          <span
                            className={
                              completed
                                ? "line-through text-gray-400"
                                : "text-gray-800"
                            }
                          >
                            {subtopic.title}
                          </span>
                        </label>

                        {completed ? (
                          <span
                            className="
                            px-3 py-1
                            rounded-full
                            text-xs
                            font-medium
                            bg-green-100
                            text-green-700
                          "
                          >
                            Complete
                          </span>
                        ) : (
                          <span
                            className="
                            px-3 py-1
                            rounded-full
                            text-xs
                            font-medium
                            bg-gray-100
                            text-gray-600
                          "
                          >
                            Pending
                          </span>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
