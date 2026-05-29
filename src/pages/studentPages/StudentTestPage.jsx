// src/pages/student/StudentTestPage.jsx

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  FileText,
  Upload,
  Download,
  Clock,
  CheckCircle,
  RefreshCw,
  Clock3,
} from "lucide-react";

export default function StudentTestPage() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState(null);

  const CACHE_DURATION = 5 * 60 * 1000;

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async (forceRefresh = false) => {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const cacheKey = `student_tests_${user.id}`;

      // -------------------------
      // CACHE CHECK
      // -------------------------

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

      // -------------------------
      // LOAD LEARNER
      // -------------------------

      const { data: learner, error: learnerError } = await supabase
        .from("learners")
        .select("id")
        .eq("id", user.id)
        .single();

      if (learnerError) throw learnerError;

      // -------------------------
      // LOAD TESTS
      // -------------------------

      const { data, error } = await supabase
        .from("tests")
        .select("*")
        .eq("learner_id", learner.id)
        .order("due_date", { ascending: true });

      if (error) throw error;

      const testsData = data || [];

      // -------------------------
      // SAVE CACHE
      // -------------------------

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

  const uploadSubmission = async (testId, file) => {
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }
    try {
      setUploadingId(testId);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const fileExt = file.name.split(".").pop();

      const filePath = `submissions/${user.id}/${testId}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("tests")
        .upload(filePath, file, {
          upsert: true,
        });

      if (uploadError) throw uploadError;

      await supabase
        .from("tests")
        .update({
          submission_file_url: filePath,
          status: "submitted",
        })
        .eq("id", testId);

      await clearTestsCache();

      toast.success("Test submitted successfully");

      loadTests(true);
    } catch (error) {
      console.error(error);
      toast.error("Upload failed");
    } finally {
      setUploadingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <span className="bg-amber-100 text-amber-700 text-xs px-3 py-1 rounded-full font-medium">
            Pending
          </span>
        );

      case "submitted":
        return (
          <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-medium">
            Submitted
          </span>
        );

      case "marked":
        return (
          <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium">
            Marked
          </span>
        );

      default:
        return null;
    }
  };

  const clearTestsCache = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      sessionStorage.removeItem(`student_tests_${user.id}`);
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
      toast.error("Failed to download test");
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">My Tests</h1>

        <button
          onClick={() => loadTests(true)}
          className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border hover:bg-gray-50"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {tests.length === 0 ? (
        <div className="bg-white rounded-xl p-6 text-center">
          <FileText className="mx-auto mb-3 text-gray-400" />
          <p className="text-gray-500">No tests assigned yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {tests.map((test) => (
            <motion.div
              key={test.id}
              whileHover={{ scale: 1.01 }}
              className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm"
            >
              {/* TOP */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{test.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {test.subject || "Test"}
                  </p>
                </div>

                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    test.status === "marked"
                      ? "bg-green-100 text-green-700"
                      : test.status === "submitted"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-orange-100 text-orange-700"
                  }`}
                >
                  {test.status || "pending"}
                </span>
              </div>

              {/* DETAILS */}
              <div className="mt-4 space-y-3">
                {test.instructions && (
                  <p className="text-sm text-gray-600">{test.instructions}</p>
                )}

                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Clock3 size={14} />
                  {test.due_date ? `Due ${test.due_date}` : "No due date"}
                </div>

                {/* SCORE */}
                {test.score && (
                  <div className="text-sm font-medium text-green-600">
                    Score: {test.score}
                  </div>
                )}

                {/* REMARKS */}
                {test.remarks && (
                  <div className="text-sm bg-gray-50 border border-gray-100 rounded-2xl p-3">
                    {test.remarks}
                  </div>
                )}
              </div>

              {/* ACTIONS */}
              <div className="mt-5 flex flex-wrap gap-3">
                {/* Download marked test */}
                {test.marked_file_url && (
                  <button
                    onClick={() => downloadMarkedTest(test.marked_file_url)}
                    className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                  >
                    <Download size={16} />
                    Marked Test
                  </button>
                )}

                {/* Upload / Resubmit */}
                {(test.status === "pending" || test.status === "submitted") && (
                  <label className="flex items-center gap-2 text-sm text-orange-600 cursor-pointer hover:underline">
                    <Upload size={16} />
                    {test.status === "submitted" ? "Resubmit" : "Submit"}
                    <input
                      type="file"
                      hidden
                      accept="application/pdf,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadSubmission(test.id, file);
                        e.target.value = "";
                      }}
                    />
                  </label>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
