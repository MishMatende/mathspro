import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";
import {
  FileText,
  Download,
  RefreshCw,
  CalendarDays,
  CheckCircle2,
} from "lucide-react";

import { getCache, setCache, clearCache } from "../../lib/cache";

export default function TutorTestsPanel({ studentId }) {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [feedbackData, setFeedbackData] = useState({});
  const [uploadingId, setUploadingId] = useState(null);

  const cacheKey = studentId ? `tutor_student_tests_${studentId}` : null;

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const fetchTests = async (forceRefresh = false) => {
    if (!studentId) return;

    try {
      setLoading(true);

      if (!forceRefresh && cacheKey) {
        const cached = getCache(cacheKey);

        if (cached) {
          setTests(cached);
          setLoading(false);
          return;
        }
      }

      const { data, error } = await supabase
        .from("tests")
        .select("*")
        .eq("learner_id", studentId)
        .order("created_at", {
          ascending: false,
        });

      if (error) throw error;

      const testsData = data || [];

      setTests(testsData);

      if (cacheKey) {
        setCache(cacheKey, testsData);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to load tests");
    } finally {
      setLoading(false);
      setRefreshing(false);
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

      const { error } = await supabase
        .from("tests")
        .update({
          marked_file_url: filePath,
          status: "marked",
          score: feedbackData[testId]?.score || null,
          feedback: feedbackData[testId]?.feedback || null,
        })
        .eq("id", testId);

      if (error) throw error;

      if (cacheKey) {
        clearCache(cacheKey);
      }

      toast.success("Marked test uploaded");

      await fetchTests(true);
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload marked test");
    } finally {
      setUploadingId(null);
    }
  };

  useEffect(() => {
    if (studentId) {
      fetchTests();
    }
  }, [studentId]);

  const handleRefresh = async () => {
    if (cacheKey) {
      clearCache(cacheKey);
    }

    setRefreshing(true);

    await fetchTests(true);

    toast.success("Tests refreshed");
  };

  const downloadFile = async (filePath) => {
    if (!filePath) return;

    try {
      const { data, error } = await supabase.storage
        .from("tests")
        .createSignedUrl(filePath, 60);

      if (error) throw error;

      window.open(data.signedUrl, "_blank");
    } catch (error) {
      console.log(error);
      toast.error("Failed to download file");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-orange-100 text-orange-700";

      case "submitted":
        return "bg-blue-100 text-blue-700";

      case "marked":
        return "bg-green-100 text-green-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-semibold text-gray-800">Tests</h3>

            <p className="text-sm text-gray-400 mt-1">
              {tests.length} test{tests.length !== 1 ? "s" : ""}
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="
              h-10 w-10
              rounded-xl
              border border-gray-200
              flex items-center justify-center
              hover:bg-gray-50
              transition
            "
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin text-orange-500" : ""}
            />
          </button>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="text-sm text-gray-400">Loading tests...</div>
        )}

        {/* EMPTY */}
        {!loading && tests.length === 0 && (
          <div
            className="
              bg-white
              border border-gray-100
              rounded-2xl
              p-8
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

            <h3 className="font-semibold text-gray-800">No Tests Found</h3>

            <p className="text-sm text-gray-400 mt-1">
              Assigned tests will appear here
            </p>
          </div>
        )}

        {/* TESTS */}
        {!loading && tests.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {tests.map((test) => {
              const score = feedbackData[test.id]?.score ?? "";
              const feedback = feedbackData[test.id]?.feedback ?? "";

              const canUpload = score.trim() !== "" && feedback.trim() !== "";

              return (
                <div
                  key={test.id}
                  className="
    bg-white
    border border-gray-100
    rounded-2xl
    p-5
    shadow-sm
    flex flex-col
  "
                >
                  {/* TOP */}
                  <div className="flex items-start gap-3">
                    <div
                      className="
                      h-11 w-11
                      rounded-2xl
                      bg-orange-100
                      text-orange-600
                      flex items-center justify-center
                      shrink-0
                    "
                    >
                      <FileText size={18} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {test.title.charAt(0).toUpperCase() +
                          test.title.slice(1)}
                      </h3>

                      <div className="flex items-center gap-2 mt-2">
                        <CalendarDays size={13} className="text-gray-400" />

                        <span className="text-xs text-gray-500">
                          Due {formatDate(test.due_date)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* STATUS */}
                  <div className="mt-4">
                    <span
                      className={`
                      px-3 py-1
                      rounded-full
                      text-xs
                      font-medium
                      ${getStatusColor(test.status)}
                    `}
                    >
                      {test.status.charAt(0).toUpperCase() +
                        test.status.slice(1)}
                    </span>
                  </div>

                  {/* INSTRUCTIONS */}
                  {test.instructions && (
                    <div className="mt-4">
                      <p className="text-xs uppercase text-gray-400 mb-1">
                        Instructions
                      </p>

                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {test.instructions.charAt(0).toUpperCase() +
                          test.instructions.slice(1)}
                      </p>
                    </div>
                  )}

                  {/* FEEDBACK */}
                  {(test.feedback || test.score) && (
                    <div className="mt-4 border-t border-gray-100 pt-4">
                      {test.feedback && (
                        <>
                          <p className="text-xs uppercase text-gray-400 mb-1">
                            Feedback
                          </p>

                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {test.feedback.charAt(0).toUpperCase() +
                              test.feedback.slice(1)}
                          </p>
                        </>
                      )}

                      {test.score && (
                        <div className="mt-3 flex items-center gap-2 text-green-600">
                          <CheckCircle2 size={15} />

                          <span className="text-sm font-medium">
                            Score: {test.score}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {test.status === "submitted" && (
                    <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">
                          Score
                        </label>

                        <input
                          type="text"
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
                          placeholder="e.g. 8/10"
                          className="
          w-full
          rounded-xl
          border border-gray-200
          px-3 py-2
          text-sm
          focus:outline-none
          focus:ring-2
          focus:ring-orange-200
        "
                        />
                      </div>

                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">
                          Feedback
                        </label>

                        <textarea
                          rows={4}
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
                          placeholder="Enter feedback..."
                          className="
          w-full
          rounded-xl
          border border-gray-200
          px-3 py-2
          text-sm
          resize-none
          focus:outline-none
          focus:ring-2
          focus:ring-orange-200
        "
                        />
                      </div>

                      {canUpload ? (
                        <label
                          className={`
      flex items-center justify-center
      gap-2
      w-full
      py-3
      rounded-xl
      text-white
      transition
      ${
        uploadingId === test.id
          ? "bg-orange-300 cursor-not-allowed"
          : "bg-orange-500 hover:bg-orange-600 cursor-pointer"
      }
    `}
                        >
                          {uploadingId === test.id
                            ? "Uploading..."
                            : "Upload Marked Test"}

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
      w-full
      py-3
      rounded-xl
      bg-slate-100
      text-slate-400
      text-sm
      cursor-not-allowed
    "
                        >
                          Add score & feedback
                        </button>
                      )}
                    </div>
                  )}
                  <div className="mt-auto pt-4 flex gap-2">
                    {test.submission_file_url && (
                      <button
                        onClick={() => downloadFile(test.submission_file_url)}
                        className="
        flex-1
        flex items-center justify-center gap-2
        py-3
        rounded-xl
        border border-slate-200
        hover:bg-slate-50
        transition
        text-sm
        font-medium
      "
                      >
                        <Download size={15} />
                        Submission
                      </button>
                    )}

                    {test.marked_file_url && (
                      <button
                        onClick={() => downloadFile(test.marked_file_url)}
                        className="
        flex-1
        flex items-center justify-center gap-2
        py-3
        rounded-xl
        bg-orange-500
        text-white
        hover:bg-orange-600
        transition
        text-sm
        font-medium
      "
                      >
                        <Download size={15} />
                        Marked Test
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </>
  );
}
