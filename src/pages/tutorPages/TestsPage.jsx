import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";

import {
  FileText,
  Download,
  MessageSquare,
  Award,
  RefreshCw,
  Loader2,
} from "lucide-react";

const CACHE_DURATION = 5 * 60 * 1000;

export default function TestsPage() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState(null);
  const [feedbackData, setFeedbackData] = useState({});

  useEffect(() => {
    loadTests();
  }, []);

  const clearCache = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      sessionStorage.removeItem(`tutor_tests_${user.id}`);
    }
  };

  const loadTests = async (forceRefresh = false) => {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const cacheKey = `tutor_tests_${user.id}`;

      // CACHE
      if (!forceRefresh) {
        const cached = sessionStorage.getItem(cacheKey);

        if (cached) {
          const parsed = JSON.parse(cached);

          const isValid = Date.now() - parsed.timestamp < CACHE_DURATION;

          if (isValid) {
            setTests(parsed.data);
            setLoading(false);
            return;
          }
        }
      }

      const { data, error } = await supabase
        .from("tests")
        .select(
          `
          *,
          learners (
            id,
            name
          )
        `,
        )
        .eq("tutor_id", user.id)
        .in("status", ["submitted", "marked"])
        .order("due_date", { ascending: true });

      if (error) throw error;

      const testsData = data || [];

      sessionStorage.setItem(
        cacheKey,
        JSON.stringify({
          timestamp: Date.now(),
          data: testsData,
        }),
      );

      setTests(testsData);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load tests");
    } finally {
      setLoading(false);
    }
  };

  const uploadMarkedTest = async (testId, file) => {
    try {
      setUploadingId(testId);

      const fileExt = file.name.split(".").pop();

      const filePath = `marked/${testId}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("tests")
        .upload(filePath, file, {
          upsert: true,
        });

      if (uploadError) throw uploadError;

      await supabase
        .from("tests")
        .update({
          marked_file_url: filePath,
          status: "marked",
          score: feedbackData[testId]?.score || null,
          feedback: feedbackData[testId]?.feedback || null,
        })
        .eq("id", testId);

      await clearCache();

      toast.success("Marked test uploaded");

      loadTests(true);
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload marked test");
    } finally {
      setUploadingId(null);
    }
  };

  const downloadSubmission = async (path) => {
    try {
      const { data, error } = await supabase.storage
        .from("tests")
        .createSignedUrl(path, 60);

      if (error) throw error;

      window.open(data.signedUrl, "_blank");
    } catch (error) {
      console.error(error);
      toast.error("Failed to download submission");
    }
  };

  const downloadMarkedTest = async (path) => {
    try {
      const { data, error } = await supabase.storage
        .from("tests")
        .createSignedUrl(path, 60);

      if (error) throw error;

      window.open(data.signedUrl, "_blank");
    } catch (error) {
      console.error(error);
      toast.error("Failed to download marked test");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Loading tests...</p>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Submitted Tests</h1>

        <button
          onClick={() => loadTests(true)}
          className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {tests.length === 0 ? (
        <div className="bg-white rounded-3xl border border-orange-100 p-10 text-center shadow-sm">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-orange-100 flex items-center justify-center mb-4">
            <FileText size={28} className="text-orange-500" />
          </div>

          <h3 className="font-semibold text-slate-800">No submitted tests</h3>

          <p className="text-sm text-slate-500 mt-2">
            Great job. Everything has been marked.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tests.map((test) => {
            const score = feedbackData[test.id]?.score ?? test.score ?? "";

            const feedback =
              feedbackData[test.id]?.feedback ?? test.feedback ?? "";

            const canUpload = score.trim() !== "" && feedback.trim() !== "";

            return (
              <div
                key={test.id}
                className="
    bg-white
    rounded-3xl
    border border-slate-200
    p-4
    shadow-sm
    hover:shadow-lg hover:-translate-y-0.5
    transition
  "
              >
                {/* TOP */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                      <FileText size={18} className="text-orange-500" />
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900 truncate">
                        {test.title}
                      </h3>

                      <p className="text-sm text-slate-500 truncate">
                        {test.learners?.name}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      test.status === "marked"
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {test.status === "marked" ? "Marked" : "Submitted"}
                  </span>
                </div>

                {/* META */}
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-orange-400"></span>
                  Due{" "}
                  {test.due_date
                    ? new Date(test.due_date).toLocaleDateString()
                    : "No due date"}
                </div>

                {/* REVIEW SECTION */}
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
                      <Award size={13} className="text-orange-500" />
                      Score
                    </label>

                    <input
                      type="text"
                      placeholder="e.g. 8/10"
                      value={score}
                      onChange={(e) =>
                        setFeedbackData((prev) => ({
                          ...prev,
                          [test.id]: {
                            ...prev[test.id],
                            score: e.target.value,
                          },
                        }))
                      }
                      className="
        w-full
        rounded-xl
        border border-slate-200
        px-3 py-2
        text-sm
        focus:outline-none
        focus:ring-2
        focus:ring-orange-200
      "
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
                      <MessageSquare size={13} className="text-orange-500" />
                      Feedback
                    </label>

                    <textarea
                      rows={3}
                      placeholder="Add feedback for the learner..."
                      value={feedback}
                      onChange={(e) =>
                        setFeedbackData((prev) => ({
                          ...prev,
                          [test.id]: {
                            ...prev[test.id],
                            feedback: e.target.value,
                          },
                        }))
                      }
                      className="
        w-full
        rounded-xl
        border border-slate-200
        px-3 py-2
        text-sm
        resize-none
        focus:outline-none
        focus:ring-2
        focus:ring-orange-200
      "
                    />
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {test.submission_file_url && (
                    <button
                      onClick={() =>
                        downloadSubmission(test.submission_file_url)
                      }
                      className="
    flex-1
    flex items-center justify-center gap-2
    border border-slate-200
    rounded-xl
    py-2
    text-sm
    hover:bg-slate-50
  "
                    >
                      <Download size={15} />
                      Submission
                    </button>
                  )}

                  {test.status === "marked" && test.marked_file_url ? (
                    <button
                      onClick={() => downloadMarkedTest(test.marked_file_url)}
                      className="
      flex-1
      flex items-center justify-center gap-2
      bg-orange-500
      text-white
      rounded-xl
      py-2
      text-sm
      hover:bg-orange-600
    "
                    >
                      <Download size={15} />
                      Marked Test
                    </button>
                  ) : canUpload ? (
                    <label
                      className={`
      flex-1
      rounded-xl
      py-2
      text-sm
      text-center
      text-white
      transition
      ${
        uploadingId === test.id
          ? "bg-orange-300 cursor-not-allowed pointer-events-none opacity-70"
          : "bg-orange-500 hover:bg-orange-600 cursor-pointer"
      }
    `}
                    >
                      <div className="flex items-center justify-center gap-2">
                        {uploadingId === test.id ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          "Upload Marked Test"
                        )}
                      </div>

                      <input
                        type="file"
                        hidden
                        disabled={uploadingId === test.id}
                        accept="application/pdf,.pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];

                          if (file) {
                            uploadMarkedTest(test.id, file);
                          }

                          e.target.value = "";
                        }}
                      />
                    </label>
                  ) : (
                    <button
                      disabled
                      className="
      flex-1
      rounded-xl
      py-2
      text-sm
      bg-slate-100
      text-slate-400
      cursor-not-allowed
    "
                    >
                      Add score & feedback
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
