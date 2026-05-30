import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Download,
  Upload,
  FileText,
  Plus,
  Pencil,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

import { supabase } from "../../lib/supabase";
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

const HomeworkPanel = ({ studentId }) => {
  const { user } = useAuth();
  const [pendingMarkedFiles, setPendingMarkedFiles] = useState({});
  const [homework, setHomework] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isHomeworkModalOpen, setIsHomeworkModalOpen] = useState(false);
  const [savingSubmissionId, setSavingSubmissionId] = useState(null);
  const [feedback, setFeedback] = useState({});
  const [uploadingSubmissionId, setUploadingSubmissionId] = useState(null);

  const fetchHomework = async () => {
    if (!studentId || !user?.id) return;

    setLoading(true);

    const { data, error } = await supabase
      .from("homework")
      .select(
        `
        id,
        title,
        category,
        instructions,
        file_url,
        due_date,
        status,
        homework_submissions (
          id,
          homework_id,
          learner_id,
          submission_file_url,
          marked_file_url,
          remarks,
          score,
          status,
          submitted_at,
          reviewed_at
        )
      `,
      )
      .eq("learner_id", studentId)
      .eq("tutor_id", user.id)
      .order("created_at", { ascending: false });

    setLoading(false);

    if (error) {
      console.log(error);
      toast.error("Failed to load homework");
      return;
    }

    setHomework(data || []);
  };

  useEffect(() => {
    fetchHomework();
  }, [studentId, user?.id]);

  const downloadFile = async (filePath, title, suffix = "") => {
    if (!filePath) {
      toast.error("No file found");
      return;
    }

    const { data, error } = await supabase.storage
      .from("homework-files")
      .createSignedUrl(filePath, 60, {
        download: getDownloadName(title, filePath, suffix),
      });

    if (error) {
      toast.error(error.message || "Failed to download file");
      return;
    }

    window.open(data.signedUrl, "_blank");
  };

  const handleFeedbackChange = (submissionId, field, value) => {
    setFeedback((current) => ({
      ...current,
      [submissionId]: {
        ...current[submissionId],
        [field]: value,
      },
    }));
  };

  const saveFeedback = async (submission) => {
    const values = feedback[submission.id] || {};
    const markedFile = pendingMarkedFiles[submission.id];
    let markedFilePath = submission.marked_file_url || null;

    setSavingSubmissionId(submission.id);

    if (markedFile) {
      setUploadingSubmissionId(submission.id);
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
      setUploadingSubmissionId(null);
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
      if (markedFilePath && markedFilePath !== submission.marked_file_url) {
        await supabase.storage.from("homework-files").remove([markedFilePath]);
      }

      toast.error(error.message || "Failed to save feedback");
      return;
    }

    if (!error) {
      setPendingMarkedFiles((current) => {
        const next = { ...current };
        delete next[submission.id];
        return next;
      });

      toast.success("Feedback saved");
      fetchHomework();
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: isHomeworkModalOpen ? 0.96 : 1,
          filter: isHomeworkModalOpen ? "blur(6px)" : "blur(0px)",
        }}
        transition={{
          duration: 0.3,
          type: "spring",
          stiffness: 220,
          damping: 25,
        }}
        style={{
          pointerEvents: isHomeworkModalOpen ? "none" : "auto",
        }}
      >
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-5">
          <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
            Homework
          </h3>

          <button
            onClick={() => setIsHomeworkModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-(--color-primary) text-white px-4 py-2.5 rounded-xl text-sm cursor-pointer shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition sm:w-auto"
          >
            <Plus size={16} />
            Upload Homework
          </button>
        </div>

        {loading && (
          <div className="text-sm text-gray-400">Loading homework...</div>
        )}

        {!loading && homework.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center text-sm text-gray-400 border border-gray-100">
            No homework assigned yet
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {homework.map((hw) => {
            const submission = hw.homework_submissions?.[0];
            const feedbackValues = feedback[submission?.id] || {};

            return (
              <div
                key={hw.id}
                className="
                  bg-white
                  rounded-xl
                  p-4
                  shadow-sm
                  border border-gray-100
                  min-w-0
                  flex flex-col
                "
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <FileText size={15} className="text-gray-500" />
                    </div>

                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">
                        {hw.title}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {hw.category || "Assignment"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3 text-xs text-gray-400">
                  <span>
                    {hw.due_date ? `Due ${hw.due_date}` : "No due date"}
                  </span>

                  <span
                    className={`px-2 py-1 rounded-full ${
                      submission?.status === "reviewed"
                        ? "bg-green-100 text-green-600"
                        : submission
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {submission?.status === "reviewed"
                      ? "Reviewed"
                      : submission
                        ? "Submitted"
                        : "Pending"}
                  </span>
                </div>

                {!submission && (
                  <div className="mt-4 border-t border-gray-100 pt-4 text-sm text-gray-400">
                    No submission yet
                  </div>
                )}

                {submission && (
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <div className="flex flex-wrap gap-3 text-xs mb-3">
                      <button
                        onClick={() =>
                          downloadFile(
                            submission.submission_file_url,
                            hw.title,
                            "submission",
                          )
                        }
                        className="flex items-center gap-1.5 text-blue-600 hover:underline"
                      >
                        <Download size={14} />
                        Submission
                      </button>

                      {submission.marked_file_url && (
                        <button
                          onClick={() =>
                            downloadFile(
                              submission.marked_file_url,
                              hw.title,
                              "marked",
                            )
                          }
                          className="flex items-center gap-1.5 text-green-600 hover:underline"
                        >
                          <Download size={14} />
                          Marked Work
                        </button>
                      )}

                      {!submission.marked_file_url && (
                        <div className="flex gap-4">
                          <label
                            className={`
        flex items-center gap-1.5
        ${
          pendingMarkedFiles[submission.id]
            ? "text-gray-400 cursor-not-allowed"
            : "text-green-600 hover:underline cursor-pointer"
        }
      `}
                          >
                            <Upload size={14} />

                            {pendingMarkedFiles[submission.id]
                              ? "Marked File Selected"
                              : "Upload Marked"}

                            <input
                              type="file"
                              hidden
                              disabled={!!pendingMarkedFiles[submission.id]}
                              accept="application/pdf,.pdf"
                              onChange={(e) => {
                                const file = e.target.files?.[0];

                                if (!file) return;

                                setPendingMarkedFiles((current) => ({
                                  ...current,
                                  [submission.id]: file,
                                }));

                                toast.success("Marked work ready to save");
                                e.target.value = "";
                              }}
                            />
                          </label>

                          {pendingMarkedFiles[submission.id] && (
                            <div className="flex items-center gap-2">
                              <p className="text-xs text-green-600">
                                ✓ {pendingMarkedFiles[submission.id].name}
                              </p>

                              <button
                                type="button"
                                onClick={() =>
                                  setPendingMarkedFiles((current) => {
                                    const next = { ...current };
                                    delete next[submission.id];
                                    return next;
                                  })
                                }
                                className="text-xs text-red-500 hover:underline"
                              >
                                Remove
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <textarea
                        rows={3}
                        placeholder="Feedback"
                        value={
                          feedbackValues.remarks ?? submission.remarks ?? ""
                        }
                        onChange={(e) =>
                          handleFeedbackChange(
                            submission.id,
                            "remarks",
                            e.target.value,
                          )
                        }
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary)/30 resize-none"
                      />

                      <div className="flex items-end gap-3">
                        <label className="flex-1">
                          <span className="block text-xs font-medium text-gray-500 mb-1">
                            Score
                          </span>

                          <input
                            type="text"
                            inputMode="decimal"
                            placeholder="0"
                            value={
                              feedbackValues.score ?? submission.score ?? ""
                            }
                            onChange={(e) =>
                              handleFeedbackChange(
                                submission.id,
                                "score",
                                e.target.value,
                              )
                            }
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary)/30"
                          />
                        </label>

                        <button
                          onClick={() => saveFeedback(submission)}
                          disabled={savingSubmissionId === submission.id}
                          className="
    h-9 px-3 rounded-lg text-xs font-medium
    bg-(--color-primary)
    text-white
    hover:shadow-md
    active:scale-[0.98]
    transition-all
    disabled:opacity-60
    flex items-center gap-2
  "
                        >
                          {savingSubmissionId === submission.id ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />
                              Saving...
                            </>
                          ) : submission.status === "reviewed" ? (
                            <Pencil size={14} />
                          ) : (
                            "Save"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      <UploadHomeworkModal
        isOpen={isHomeworkModalOpen}
        onClose={() => setIsHomeworkModalOpen(false)}
        onUploaded={fetchHomework}
        learnerId={studentId}
      />
    </>
  );
};

export default HomeworkPanel;
