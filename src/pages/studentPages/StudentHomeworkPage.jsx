import { useEffect, useMemo, useState } from "react";

import { motion } from "framer-motion";

import {
  FileText,
  Download,
  Upload,
  Search,
  Clock3,
  RefreshCw,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { clearCache, getCache, setCache } from "../../lib/cache";

const getDownloadName = (title, filePath, suffix = "") => {
  const extension = filePath?.split(".").pop();
  const safeTitle = `${title || "homework"} ${suffix}`
    .trim()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

  return extension ? `${safeTitle}.${extension}` : safeTitle;
};

export default function StudentHomeworkPage() {
  const { user } = useAuth();
  const [homework, setHomework] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const cacheKey = user?.id ? `student_homework_${user.id}` : null;

  const formatDate = (date) => {
    if (!date) return "No due date";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // 🔥 Fetch homework
  const fetchHomework = async (forceRefresh = false) => {
    if (!user) return;

    if (forceRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      // Cache first
      if (!forceRefresh && cacheKey) {
        const cachedHomework = getCache(cacheKey);

        if (cachedHomework) {
          setHomework(cachedHomework);
          return;
        }
      }

      const { data, error } = await supabase
        .from("homework")
        .select(
          `
        id,
        learner_id,
        title,
        category,
        instructions,
        file_url,
        due_date,
        status,
        created_at,
        homework_submissions (
          id,
          homework_id,
          learner_id,
          status,
          remarks,
          score,
          submission_file_url,
          marked_file_url,
          submitted_at,
          reviewed_at
        )
      `,
        )
        .eq("learner_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.log(error);
        toast.error("Failed to fetch homework");
        return;
      }

      const nextHomework = data || [];

      setHomework(nextHomework);

      if (cacheKey) {
        setCache(cacheKey, nextHomework);
      }
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    if (!cacheKey) return;

    clearCache(cacheKey);

    await fetchHomework(true);

    toast.success("Homework refreshed");
  };

  useEffect(() => {
    fetchHomework();
  }, [user?.id]);

  // 🔥 Filter
  const filteredHomework = useMemo(() => {
    const searchValue = search.toLowerCase();

    return homework.filter((hw) =>
      `${hw.title || ""} ${hw.category || ""}`
        .toLowerCase()
        .includes(searchValue),
    );
  }, [homework, search]);

  // 🔥 Download worksheet
  const downloadFile = async (filePath, title, suffix = "") => {
    if (!filePath) {
      toast.error("No file found");
      return;
    }

    try {
      const { data, error } = await supabase.storage
        .from("homework-files")
        .createSignedUrl(filePath, 60, {
          download: getDownloadName(title, filePath, suffix),
        });

      if (error) {
        toast.error(error.message);
        return;
      }

      window.location.href = data.signedUrl;
    } catch (err) {
      console.error(err);
      toast.error("Failed to download file");
    }
  };

  // 🔥 Upload submission
  const uploadSubmission = async (hw, file) => {
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }

    try {
      const loadingToast = toast.loading("Uploading...");

      // 🔥 Upload file
      const fileName = `${crypto.randomUUID()}.pdf`;

      const filePath = `${user.id}/submissions/${hw.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("homework-files")
        .upload(filePath, file);

      if (uploadError) {
        toast.dismiss(loadingToast);

        toast.error(uploadError.message || "Failed to upload file");

        return;
      }

      // 🔥 Check existing submission
      const existing = hw.homework_submissions?.[0];

      // 🔥 Update
      if (existing) {
        const { error } = await supabase
          .from("homework_submissions")
          .update({
            submission_file_url: filePath,

            status: "submitted",

            submitted_at: new Date().toISOString(),
          })
          .eq("id", existing.id)
          .eq("homework_id", hw.id)
          .eq("learner_id", user.id);

        if (error) {
          await supabase.storage.from("homework-files").remove([filePath]);

          toast.dismiss(loadingToast);

          toast.error(error.message || "Failed to submit homework");

          return;
        }

        if (existing.submission_file_url) {
          await supabase.storage
            .from("homework-files")
            .remove([existing.submission_file_url]);
        }
      }

      // 🔥 Insert
      else {
        const { error } = await supabase.from("homework_submissions").insert([
          {
            homework_id: hw.id,

            learner_id: user.id,

            submission_file_url: filePath,

            status: "submitted",

            submitted_at: new Date().toISOString(),
          },
        ]);

        if (error) {
          await supabase.storage.from("homework-files").remove([filePath]);

          toast.dismiss(loadingToast);

          toast.error(error.message || "Failed to submit homework");

          return;
        }
      }

      toast.dismiss(loadingToast);

      toast.success("Homework submitted");

      if (cacheKey) {
        clearCache(cacheKey);
      }

      fetchHomework(true);
    } catch (err) {
      console.log(err);

      toast.error("Something went wrong");
    }
  };

  return (
    <div className="p-4 lg:p-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold">My Homework</h1>

          <p className="text-sm text-gray-400 mt-1">
            View and submit your assignments
          </p>
        </div>

        {/* SEARCH */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-72">
            <Search
              size={16}
              className="
        absolute
        left-3 top-1/2
        -translate-y-1/2
        text-gray-400
      "
            />

            <input
              type="text"
              placeholder="Search homework..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="
        w-full
        pl-9 pr-3 py-2
        border border-gray-200
        rounded-xl
        text-sm
        focus:outline-none
        focus:ring-2
        focus:ring-orange-200
      "
            />
          </div>
          {/* Refresh */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="
      h-11 w-11 shrink-0
      flex items-center justify-center
      rounded-xl
      border border-gray-200
      bg-white
      transition-all
      hover:bg-gray-50
      disabled:opacity-50
    "
            title="Refresh homework"
          >
            <RefreshCw
              size={18}
              className={
                refreshing ? "animate-spin text-orange-500" : "text-gray-600"
              }
            />
          </button>
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="text-sm text-gray-400">Loading homework...</div>
      )}

      {/* EMPTY */}
      {!loading && filteredHomework.length === 0 && (
        <div
          className="
              bg-white
              border border-gray-100
              rounded-3xl
              p-10
              text-center
            "
        >
          <FileText
            size={40}
            className="
                mx-auto
                text-gray-300
                mb-3
              "
          />

          <h3 className="font-semibold">No homework assigned</h3>

          <p className="text-sm text-gray-400 mt-1">You're all caught up</p>
        </div>
      )}

      {/* GRID */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filteredHomework.map((hw) => {
          const submission = hw.homework_submissions?.[0];

          const isPastDue = hw.due_date && new Date(hw.due_date) < new Date();

          // Allow submit/resubmit unless already reviewed
          const canSubmit = submission?.status !== "reviewed";

          return (
            <motion.div
              key={hw.id}
              whileHover={{ scale: 1.01 }}
              className="
                bg-white
                border border-gray-100
                rounded-3xl
                p-5
                shadow-sm
              "
            >
              {/* TOP */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {hw.title.charAt(0).toUpperCase() + hw.title.slice(1)}
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    {hw.category.charAt(0).toUpperCase() + hw.category.slice(1)}
                  </p>
                </div>

                <span
                  className={`
                    text-xs
                    px-2 py-1
                    rounded-full
                    ${
                      submission?.status === "reviewed"
                        ? "bg-green-100 text-green-700"
                        : submission?.status === "submitted"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-orange-100 text-orange-700"
                    }
                  `}
                >
                  {submission?.status
                    ? submission.status.charAt(0).toUpperCase() +
                      submission.status.slice(1)
                    : "Pending"}
                </span>
              </div>

              {/* DETAILS */}
              <div className="mt-4 space-y-3">
                {submission?.status !== "submitted" &&
                  submission?.status !== "reviewed" && (
                    <p className="text-sm text-gray-600 whitespace-pre-line">
                      {hw.instructions || ""}
                    </p>
                  )}

                <div
                  className={`flex items-center gap-2 text-xs ${
                    isPastDue ? "text-red-500" : "text-gray-400"
                  }`}
                >
                  <Clock3 size={14} />
                  Due: {formatDate(hw.due_date)}
                  {isPastDue && <span>(Overdue)</span>}
                </div>

                {/* SCORE */}
                {submission?.score && (
                  <div
                    className="
                      text-sm
                      font-medium
                      text-green-600
                    "
                  >
                    <div className="text-sm font-medium text-orange-500">
                      Score: {submission.score}
                    </div>
                  </div>
                )}

                {/* REMARKS */}
                {submission?.remarks && (
                  <div
                    className="
                      text-sm
                      bg-gray-50
                      border border-gray-100
                      rounded-2xl
                      p-3
                      whitespace-pre-line
                    "
                  >
                    {submission.remarks.charAt(0).toUpperCase() +
                      submission.remarks.slice(1)}
                  </div>
                )}

                {submission?.submitted_at && (
                  <p className="text-xs text-gray-400">
                    Submitted {formatDate(submission.submitted_at)}
                  </p>
                )}
              </div>

              {/* ACTIONS */}
              <div className="mt-5 flex flex-wrap gap-3">
                {/* DOWNLOAD */}
                {submission?.status !== "submitted" &&
                  submission?.status !== "reviewed" && (
                    <button
                      onClick={() => downloadFile(hw.file_url, hw.title)}
                      className="
      flex items-center gap-2
      text-sm
      text-blue-600
      hover:underline
      cursor-pointer
    "
                    >
                      <Download size={16} />
                      Worksheet
                    </button>
                  )}

                {submission?.submission_file_url && (
                  <button
                    onClick={() =>
                      downloadFile(
                        submission.submission_file_url,
                        hw.title,
                        "submission",
                      )
                    }
                    className="
                      flex items-center gap-2
                      text-sm
                      text-gray-600
                      hover:underline
                      cursor-pointer
                    "
                  >
                    <Download size={16} />
                    Submission
                  </button>
                )}

                {/* SUBMIT */}
                {canSubmit && (
                  <label
                    className="
      flex items-center gap-2
      text-sm
      text-orange-600
      cursor-pointer
      hover:underline
    "
                  >
                    <Upload size={16} />

                    {submission ? "Resubmit" : "Submit"}

                    <input
                      type="file"
                      hidden
                      accept="application/pdf,.pdf"
                      onChange={(e) => {
                        uploadSubmission(hw, e.target.files[0]);
                        e.target.value = "";
                      }}
                    />
                  </label>
                )}
                {submission?.marked_file_url && (
                  <button
                    onClick={() =>
                      downloadFile(
                        submission.marked_file_url,
                        hw.title,
                        "marked",
                      )
                    }
                    className="
      flex items-center gap-2
      text-sm
      text-green-600
      hover:underline
    "
                  >
                    <Download size={16} />
                    Marked Homework
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
