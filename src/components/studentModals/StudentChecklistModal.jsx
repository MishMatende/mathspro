// src/components/student/StudentChecklistModal.jsx

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";
import {
  BookOpen,
  Loader2,
  ChevronDown,
  ChevronUp,
  Sigma,
  Percent,
  FunctionSquare,
  CheckCircle2,
  Circle,
  X,
  RefreshCw,
} from "lucide-react";
import { getCache, setCache } from "../../lib/cache";

export default function StudentChecklistModal({ learnerId, isOpen, onClose }) {
  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [expandedTopics, setExpandedTopics] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  const CHECKLIST_CACHE_KEY = `student_checklist_${learnerId}`;

  useEffect(() => {
    if (!isOpen || !learnerId) return;

    const cached = getCache(CHECKLIST_CACHE_KEY);

    if (cached) {
      setTopics(cached.topics || []);
      setProgressMap(cached.progressMap || {});
      setLoading(false);

      // Silent background refresh
      loadChecklist(false);

      return;
    }

    loadChecklist();
  }, [isOpen, learnerId]);

  async function loadChecklist(showLoader = true) {
    try {
      if (showLoader) {
        setLoading(true);
      }

      const { data: assignment } = await supabase
        .from("learner_checklists")
        .select("level_id")
        .eq("learner_id", learnerId)
        .maybeSingle();

      let levelId = assignment?.level_id;

      if (!levelId) {
        const { data: personalChecklist } = await supabase
          .from("checklist_levels")
          .select("id")
          .eq("learner_id", learnerId)
          .maybeSingle();

        levelId = personalChecklist?.id;
      }

      if (!levelId) {
        setTopics([]);
        setProgressMap({});

        setCache(CHECKLIST_CACHE_KEY, {
          topics: [],
          progressMap: {},
        });

        return;
      }

      const { data: topicsData } = await supabase
        .from("checklist_topics")
        .select(
          `
        *,
        checklist_subtopics (*)
      `,
        )
        .eq("level_id", levelId)
        .order("sort_order");

      const { data: progressData } = await supabase
        .from("learner_subtopic_progress")
        .select("*")
        .eq("learner_id", learnerId);

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
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    const initial = {};

    topics.forEach((topic, index) => {
      initial[topic.id] = index === 0;
    });

    setExpandedTopics(initial);
  }, [topics]);

  const overallProgress = useMemo(() => {
    const allSubtopics = topics.flatMap(
      (topic) => topic.checklist_subtopics || [],
    );

    const total = allSubtopics.length;

    const completed = allSubtopics.filter(
      (subtopic) => progressMap[subtopic.id],
    ).length;

    return {
      total,
      completed,
      percent: total === 0 ? 0 : Math.round((completed / total) * 100),
    };
  }, [topics, progressMap]);

  function getTopicProgress(topic) {
    const total = topic.checklist_subtopics?.length || 0;

    const completed =
      topic.checklist_subtopics?.filter((s) => progressMap[s.id]).length || 0;

    return {
      total,
      completed,
      percent: total === 0 ? 0 : Math.round((completed / total) * 100),
    };
  }

  function getTopicIcon(title) {
    const text = title.toLowerCase();

    if (text.includes("algebra")) {
      return <Sigma size={18} className="text-orange-500" />;
    }

    if (text.includes("fraction")) {
      return <FunctionSquare size={18} className="text-orange-500" />;
    }

    if (text.includes("probability")) {
      return <Percent size={18} className="text-orange-500" />;
    }

    return <BookOpen size={18} className="text-orange-500" />;
  }

  async function handleRefresh() {
    setRefreshing(true);

    await loadChecklist(false);

    setRefreshing(false);

    toast.success("Checklist refreshed");
  }

  function getProgressColor(percent) {
    if (percent === 100) {
      return "text-green-600";
    }

    if (percent >= 75) {
      return "text-lime-600";
    }

    if (percent >= 50) {
      return "text-yellow-600";
    }

    return "text-orange-500";
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-gray-50 rounded-3xl w-[90Vw] md:w-[30Vw] max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">My Checklist</h2>

            <p className="text-sm text-gray-500">
              Track your learning progress
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="
        flex items-center justify-center
        w-10 h-10
        rounded-xl
        border
        hover:bg-gray-50
        transition
      "
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="animate-spin mx-auto mb-4" />
              Loading checklist...
            </div>
          ) : (
            <>
              <div
                className="
    mb-4
    rounded-3xl
    p-6
    text-white
    bg-linear-to-r
    from-orange-500
    to-orange-600
    shadow-lg
  "
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-orange-100 font-medium">
                      Overall progress
                    </p>

                    <h2 className="text-5xl font-bold mt-2">
                      {overallProgress.completed}/{overallProgress.total}
                    </h2>
                  </div>

                  <div className="text-right">
                    <div className="text-4xl font-bold">
                      {overallProgress.percent}%
                    </div>
                  </div>
                </div>
              </div>

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
  mb-3
  shadow-sm
"
                  >
                    <button
                      onClick={() =>
                        setExpandedTopics((prev) => ({
                          ...prev,
                          [topic.id]: !prev[topic.id],
                        }))
                      }
                      className="w-full p-5 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="
    w-12 h-12
    rounded-2xl
    bg-orange-50
    flex items-center justify-center
  "
                        >
                          {getTopicIcon(topic.title)}
                        </div>

                        <div className="text-left">
                          <h3 className="font-semibold text-lg">
                            {topic.title}
                          </h3>

                          <p className="text-sm text-gray-500">
                            {progress.completed}/{progress.total} subtopics
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span
                          className={`font-semibold ${getProgressColor(
                            progress.percent,
                          )}`}
                        >
                          {progress.percent}%
                        </span>

                        {expanded ? (
                          <ChevronUp size={18} />
                        ) : (
                          <ChevronDown size={18} />
                        )}
                      </div>
                    </button>

                    {expanded && (
                      <div className="border-t">
                        {topic.checklist_subtopics
                          ?.sort(
                            (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
                          )
                          .map((subtopic) => {
                            const completed = progressMap[subtopic.id];

                            return (
                              <div
                                key={subtopic.id}
                                className="flex items-center justify-between px-5 py-4 border-b last:border-b-0"
                              >
                                <div className="flex items-center gap-3">
                                  {completed ? (
                                    <CheckCircle2
                                      size={18}
                                      className="text-green-600"
                                    />
                                  ) : (
                                    <div
                                      className="
    w-2.5
    h-2.5
    rounded-full
    bg-orange-500
    ml-1
  "
                                    />
                                  )}

                                  <span
                                    className={
                                      completed
                                        ? "line-through text-gray-400"
                                        : "text-gray-800"
                                    }
                                  >
                                    {subtopic.title}
                                  </span>
                                </div>

                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    completed
                                      ? "bg-green-100 text-green-700"
                                      : "bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  {completed ? "Complete" : "Pending"}
                                </span>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
