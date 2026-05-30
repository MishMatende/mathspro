// src/pages/tutor/TutorTestsPage.jsx

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";

import { FileText, Upload, Calendar, User, RefreshCw } from "lucide-react";

const CACHE_DURATION = 5 * 60 * 1000;

export default function TestsPage() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState(null);

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
        .eq("status", "submitted")
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

      await supabase.from("tests").update({
        marked_file_url: filePath,
        status: "marked",
      });

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
          Refresh
        </button>
      </div>

      {tests.length === 0 ? (
        <div className="bg-white rounded-3xl border border-orange-100 p-10 text-center shadow-sm">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-orange-100 flex items-center justify-center mb-4">
            <FileText size={28} className="text-orange-600" />
          </div>

          <h3 className="font-semibold text-slate-800">No submitted tests</h3>

          <p className="text-sm text-slate-500 mt-2">
            Great job. Everything has been marked.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {tests.map((test) => (
            <div
              key={test.id}
              className="group bg-white rounded-3xl border border-orange-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              {/* HEADER */}
              <div className="bg-linear-to-r from-orange-50 via-amber-50 to-white px-5 py-4 border-b border-orange-100">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3 min-w-0">
                    <div className="h-12 w-12 rounded-2xl bg-orange-100 flex items-center justify-center shrink-0">
                      <FileText size={22} className="text-orange-600" />
                    </div>

                    <div className="min-w-0">
                      <h2 className="font-semibold text-slate-900 text-lg truncate">
                        {test.title}
                      </h2>

                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                        {test.instructions}
                      </p>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold">
                    Needs Review
                  </span>
                </div>
              </div>

              {/* BODY */}
              <div className="p-5">
                {/* STUDENT */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center">
                    <User size={16} className="text-slate-600" />
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">Learner</p>

                    <p className="font-medium text-slate-800">
                      {test.learners?.name || "Unknown Learner"}
                    </p>
                  </div>
                </div>

                {/* DUE DATE */}
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-slate-100 text-slate-600 text-sm mb-5">
                  <Calendar size={14} />
                  Due{" "}
                  {test.due_date
                    ? new Date(test.due_date).toLocaleDateString()
                    : "No due date"}
                </div>

                {/* ACTIONS */}
                <div className="flex flex-col gap-3">
                  {test.submission_file_url && (
                    <button
                      onClick={() =>
                        downloadSubmission(test.submission_file_url)
                      }
                      className="w-full flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-2xl text-slate-700 hover:bg-slate-50 transition"
                    >
                      <FileText size={18} />
                      Download Submission
                    </button>
                  )}

                  <label className="w-full flex items-center justify-center gap-2 py-3 bg-orange-500 text-white rounded-2xl cursor-pointer hover:bg-orange-600 transition shadow-sm">
                    <Upload size={18} />

                    {uploadingId === test.id
                      ? "Uploading..."
                      : "Upload Marked Test"}

                    <input
                      type="file"
                      className="hidden"
                      accept="application/pdf,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];

                        if (file) {
                          uploadMarkedTest(test.id, file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
