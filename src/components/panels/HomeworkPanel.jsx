import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Download,
  Upload,
  FileText,
  Plus,
  Pencil,
  Loader2,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { getCache, setCache, clearCache } from "../../lib/cache";
import { supabase } from "../../lib/supabase";
import { downloadStorageFile } from "../../lib/downloadStorageFile";
import { useAuth } from "../../context/AuthContext";
import UploadHomeworkModal from "../tutorModals/UploadHomeworkModal";

const getDownloadName = (title, filePath, suffix = "") => {
  const extension = filePath?.split(".").pop();
  const safeTitle = `${title || "homework"} ${suffix}`
    .trim()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

  return extension ? `${safeTitle}.${extension}` : safeTitle;
};

const submissionStatus = (submission) => submission?.status || "pending";

export default function HomeworkPanel({ studentId }) {
  const { user } = useAuth();
  const [homework, setHomework] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isHomeworkModalOpen, setIsHomeworkModalOpen] = useState(false);
  const [editingHomework, setEditingHomework] = useState(null);
  const [reviewingHomework, setReviewingHomework] = useState(null);
  const [pendingMarkedFiles, setPendingMarkedFiles] = useState({});
  const [feedback, setFeedback] = useState({});
  const [savingSubmissionId, setSavingSubmissionId] = useState(null);
  const [search, setSearch] = useState("");
  const [submissionFilter, setSubmissionFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const homeworkCacheKey = `tutor_homework_${studentId}_${user?.id}`;
  const isModalOpen =
    isHomeworkModalOpen ||
    Boolean(editingHomework) ||
    Boolean(reviewingHomework);

  const fetchHomework = async ({
    forceRefresh = false,
    showLoader = true,
  } = {}) => {
    if (!studentId || !user?.id) return;

    if (!forceRefresh) {
      const cached = getCache(homeworkCacheKey);
      if (cached) {
        setHomework(cached);
        setLoading(false);
        return;
      }
    }

    if (showLoader) setLoading(true);

    const { data, error } = await supabase
      .from("homework")
      .select(
        `
          id, learner_id, title, category, instructions, file_url, due_date, status, created_at,
          homework_submissions (
            id, submission_file_url, marked_file_url, remarks, score, status, submitted_at, reviewed_at
          )
        `,
      )
      .eq("learner_id", studentId)
      .eq("tutor_id", user.id)
      .order("created_at", { ascending: false });

    if (showLoader) setLoading(false);

    if (error) {
      console.error(error);
      toast.error("Failed to load homework");
      return;
    }

    setHomework(data || []);
    setCache(homeworkCacheKey, data || []);
  };

  useEffect(() => {
    fetchHomework();
  }, [studentId, user?.id]);

  const downloadFile = async (filePath, title, suffix = "") => {
    if (!filePath) {
      toast.error("No file found");
      return;
    }

    try {
      await downloadStorageFile({
        bucket: "homework-files",
        path: filePath,
        fileName: getDownloadName(title, filePath, suffix),
      });
    } catch (error) {
      toast.error(error.message || "Failed to download file");
    }
  };

  const handleFeedbackChange = (submissionId, field, value) => {
    setFeedback((current) => ({
      ...current,
      [submissionId]: { ...current[submissionId], [field]: value },
    }));
  };

  const chooseMarkedFile = (submissionId, file) => {
    if (!file) return;

    if (file.type && file.type !== "application/pdf") {
      toast.error("Please select a PDF file");
      return;
    }

    setPendingMarkedFiles((current) => ({ ...current, [submissionId]: file }));
  };

  const saveFeedback = async (submission) => {
    const values = feedback[submission.id] || {};
    const markedFile = pendingMarkedFiles[submission.id];
    let markedFilePath = submission.marked_file_url || null;

    setSavingSubmissionId(submission.id);

    if (markedFile) {
      const fileName = `${crypto.randomUUID()}.pdf`;
      markedFilePath = `${user.id}/marked/${submission.id}/${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from("homework-files")
        .upload(markedFilePath, markedFile);

      if (uploadError) {
        setSavingSubmissionId(null);
        toast.error(uploadError.message || "Failed to upload marked work");
        return;
      }
    }

    const { error } = await supabase
      .from("homework_submissions")
      .update({
        marked_file_url: markedFilePath,
        remarks: values.remarks ?? submission.remarks ?? null,
        score:
          values.score?.trim?.() === ""
            ? null
            : (values.score ?? submission.score),
        status: "reviewed",
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", submission.id);

    setSavingSubmissionId(null);

    if (error) {
      if (markedFile && markedFilePath !== submission.marked_file_url) {
        await supabase.storage.from("homework-files").remove([markedFilePath]);
      }
      toast.error(error.message || "Failed to save feedback");
      return;
    }

    setPendingMarkedFiles((current) => {
      const next = { ...current };
      delete next[submission.id];
      return next;
    });
    clearCache(homeworkCacheKey);
    toast.success("Feedback saved");
    setReviewingHomework(null);
    await fetchHomework({ forceRefresh: true, showLoader: false });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    clearCache(homeworkCacheKey);
    await fetchHomework({ forceRefresh: true, showLoader: false });
    setRefreshing(false);
    toast.success("Homework refreshed");
  };

  const filteredHomework = homework
    .filter((item) => {
      const matchesSearch = `${item.title || ""} ${item.category || ""}`
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesStatus =
        submissionFilter === "all" ||
        submissionStatus(item.homework_submissions?.[0]) === submissionFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((first, second) => {
      if (sortBy === "title") {
        return (first.title || "").localeCompare(second.title || "");
      }
      if (sortBy === "dueDate") {
        return (first.due_date || "9999-12-31").localeCompare(
          second.due_date || "9999-12-31",
        );
      }
      return 0;
    });

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: isModalOpen ? 0.96 : 1,
          filter: isModalOpen ? "blur(6px)" : "blur(0px)",
        }}
        transition={{
          duration: 0.3,
          type: "spring",
          stiffness: 220,
          damping: 25,
        }}
        style={{ pointerEvents: isModalOpen ? "none" : "auto" }}
      >
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Homework</h2>
            <p className="mt-1 text-sm text-gray-500">
              Assign work, review submissions and provide feedback.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsHomeworkModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-(--color-primary) px-4 py-2 text-white transition hover:shadow-md cursor-pointer"
            >
              <Plus size={16} /> Upload Homework
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="rounded-xl border border-gray-200 bg-white p-2.5 transition hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
            </button>
          </div>
        </div>

        {loading && (
          <div className="rounded-3xl border bg-white p-12 text-center">
            <Loader2
              size={24}
              className="mx-auto mb-4 animate-spin text-gray-400"
            />
            <p className="text-gray-500">Loading homework...</p>
          </div>
        )}

        {!loading && homework.length === 0 && (
          <div className="rounded-3xl border bg-white p-12 text-center">
            <FileText size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-900">
              No Homework Assigned
            </h3>
            <p className="mt-2 text-gray-500">
              Upload homework for this learner to get started.
            </p>
          </div>
        )}

        {!loading && homework.length > 0 && (
          <>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative sm:w-72">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search homework"
                  className="w-full rounded-xl border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-orange-400"
                />
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <select
                  value={submissionFilter}
                  onChange={(event) => setSubmissionFilter(event.target.value)}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
                >
                  <option value="all">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="submitted">Submitted</option>
                  <option value="reviewed">Reviewed</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
                >
                  <option value="newest">Newest assigned</option>
                  <option value="dueDate">Due date</option>
                  <option value="title">Title A–Z</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
              <table className="w-full min-w-205 text-left text-sm">
                <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Homework</th>
                    <th className="px-4 py-3 font-semibold">Topic</th>
                    <th className="px-4 py-3 font-semibold">Due date</th>
                    <th className="px-4 py-3 font-semibold">Submission</th>
                    <th className="px-4 py-3 font-semibold">Score</th>
                    <th className="px-4 py-3 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredHomework.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-gray-400"
                      >
                        No homework matches these filters.
                      </td>
                    </tr>
                  ) : (
                    filteredHomework.map((item) => {
                      const submission = item.homework_submissions?.[0];
                      const status = submissionStatus(submission);
                      return (
                        <tr key={item.id} className="hover:bg-gray-50/70">
                          <td className="px-4 py-3 font-medium text-gray-800">
                            {item.title || "Homework"}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {item.category || "Assignment"}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {item.due_date || "No due date"}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded-full px-2 py-1 text-xs ${status === "reviewed" ? "bg-green-50 text-green-700" : status === "submitted" ? "bg-yellow-50 text-yellow-700" : "bg-gray-100 text-gray-600"}`}
                            >
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {submission?.score ?? "—"}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-3">
                              {item.file_url && (
                                <button
                                  onClick={() =>
                                    downloadFile(
                                      item.file_url,
                                      item.title,
                                      "worksheet",
                                    )
                                  }
                                  className="text-blue-600 hover:text-blue-700 cursor-pointer"
                                  title="Download worksheet"
                                >
                                  <Download size={16} />
                                </button>
                              )}
                              {/* <button
                                onClick={() => setEditingHomework(item)}
                                className="text-gray-600 hover:text-gray-900 cursor-pointer"
                                title="Edit homework"
                              >
                                <Pencil size={16} />
                              </button> */}
                              {submission && (
                                <button
                                  onClick={() => setReviewingHomework(item)}
                                  className="text-orange-600 hover:text-orange-700 cursor-pointer"
                                  title="Review submission"
                                >
                                  <FileText size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </motion.div>

      <UploadHomeworkModal
        isOpen={isHomeworkModalOpen || Boolean(editingHomework)}
        onClose={() => {
          setIsHomeworkModalOpen(false);
          setEditingHomework(null);
        }}
        learnerId={studentId}
        homework={editingHomework}
        onUploaded={async () => {
          clearCache(homeworkCacheKey);
          await fetchHomework({ forceRefresh: true, showLoader: false });
        }}
      />

      {reviewingHomework &&
        (() => {
          const submission = reviewingHomework.homework_submissions?.[0];
          const feedbackValues = feedback[submission.id] || {};
          return (
            <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-6">
              <div
                className="md:w-[15vw]
                w-[96vw] max-w-xl rounded-t-3xl bg-white p-5 shadow-xl sm:rounded-3xl sm:p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Review Homework
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {reviewingHomework.title}
                    </p>
                  </div>
                  <button
                    onClick={() => setReviewingHomework(null)}
                    className="rounded-xl border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="mt-5 flex flex-wrap gap-3 text-sm">
                  <button
                    onClick={() =>
                      downloadFile(
                        submission.submission_file_url,
                        reviewingHomework.title,
                        "submission",
                      )
                    }
                    className="flex items-center gap-1.5 text-blue-600 hover:underline cursor-pointer"
                  >
                    <Download size={14} /> Submission
                  </button>
                  {submission.marked_file_url && (
                    <button
                      onClick={() =>
                        downloadFile(
                          submission.marked_file_url,
                          reviewingHomework.title,
                          "marked",
                        )
                      }
                      className="flex items-center gap-1.5 text-green-600 hover:underline cursor-pointer"
                    >
                      <Download size={14} /> Marked work
                    </button>
                  )}
                  {!submission.marked_file_url && (
                    <label className="flex cursor-pointer items-center gap-1.5 text-green-600 hover:underline">
                      <Upload size={14} />{" "}
                      {pendingMarkedFiles[submission.id]
                        ? "Marked file selected"
                        : "Upload marked work"}
                      <input
                        type="file"
                        hidden
                        accept="application/pdf,.pdf"
                        onChange={(event) => {
                          chooseMarkedFile(
                            submission.id,
                            event.target.files?.[0],
                          );
                          event.target.value = "";
                        }}
                      />
                    </label>
                  )}
                </div>
                {pendingMarkedFiles[submission.id] && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-green-600">
                    Selected: {pendingMarkedFiles[submission.id].name}
                    <button
                      onClick={() =>
                        setPendingMarkedFiles((current) => {
                          const next = { ...current };
                          delete next[submission.id];
                          return next;
                        })
                      }
                      className="text-red-500 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}
                <div className="mt-5 space-y-3">
                  <textarea
                    rows={4}
                    placeholder="Feedback"
                    value={feedbackValues.remarks ?? submission.remarks ?? ""}
                    onChange={(event) =>
                      handleFeedbackChange(
                        submission.id,
                        "remarks",
                        event.target.value,
                      )
                    }
                    className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-400"
                  />
                  <div className="flex items-end gap-3">
                    <label className="flex-1 text-xs font-medium text-gray-500">
                      Score
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder="0"
                        value={feedbackValues.score ?? submission.score ?? ""}
                        onChange={(event) =>
                          handleFeedbackChange(
                            submission.id,
                            "score",
                            event.target.value,
                          )
                        }
                        className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-400"
                      />
                    </label>
                    <button
                      onClick={() => saveFeedback(submission)}
                      disabled={savingSubmissionId === submission.id}
                      className="flex h-10 items-center gap-2 rounded-xl bg-(--color-primary) px-4 text-sm font-medium text-white disabled:opacity-60 cursor-pointer"
                    >
                      {savingSubmissionId === submission.id ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <Pencil size={15} />
                      )}
                      Save review
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
    </>
  );
}
