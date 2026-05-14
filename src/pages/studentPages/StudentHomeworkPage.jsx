import { useEffect, useMemo, useState } from "react";

import { motion } from "framer-motion";

import { FileText, Download, Upload, Search, Clock3 } from "lucide-react";

import { supabase } from "../../lib/supabase";

import { useAuth } from "../../context/AuthContext";

import toast from "react-hot-toast";

export default function StudentHomeworkPage() {
  const { user } = useAuth();

  const [homework, setHomework] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  // 🔥 Fetch homework
  const fetchHomework = async () => {
    if (!user) return;

    setLoading(true);

    const { data, error } = await supabase
      .from("homework")
      .select(
        `
        *,
        homework_submissions (
          id,
          status,
          remarks,
          score,
          submission_file_url,
          marked_file_url
        )
      `,
      )
      .eq("learner_id", user.id)
      .order("created_at", {
        ascending: false,
      });

    setLoading(false);

    if (error) {
      console.log(error);

      toast.error("Failed to fetch homework");

      return;
    }

    setHomework(data || []);
  };

  useEffect(() => {
    fetchHomework();
  }, [user]);

  // 🔥 Filter
  const filteredHomework = useMemo(() => {
    return homework.filter((hw) =>
      hw.title.toLowerCase().includes(search.toLowerCase()),
    );
  }, [homework, search]);

  // 🔥 Download worksheet
  const downloadWorksheet = async (filePath) => {
    const { data, error } = await supabase.storage
      .from("homework-files")
      .createSignedUrl(filePath, 60);

    if (error) {
      toast.error("Failed to download");

      return;
    }

    window.open(data.signedUrl, "_blank");
  };

  // 🔥 Upload submission
  const uploadSubmission = async (hw, file) => {
    try {
      const loadingToast = toast.loading("Uploading...");

      // 🔥 Upload file
      const ext = file.name.split(".").pop();

      const fileName = `${crypto.randomUUID()}.${ext}`;

      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("submission-files")
        .upload(filePath, file);

      if (uploadError) {
        toast.dismiss(loadingToast);

        toast.error("Failed to upload file");

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
          .eq("id", existing.id);

        if (error) {
          toast.dismiss(loadingToast);

          toast.error("Failed to submit homework");

          return;
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
          toast.dismiss(loadingToast);

          toast.error("Failed to submit homework");

          return;
        }
      }

      toast.dismiss(loadingToast);

      toast.success("Homework submitted");

      fetchHomework();
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
        <div className="relative w-full sm:w-72">
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
                  <h3 className="font-semibold text-gray-900">{hw.title}</h3>

                  <p className="text-sm text-gray-500 mt-1">{hw.category}</p>
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
                  {submission?.status || "pending"}
                </span>
              </div>

              {/* DETAILS */}
              <div className="mt-4 space-y-3">
                <p className="text-sm text-gray-600">
                  {hw.instructions || "No instructions"}
                </p>

                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Clock3 size={14} />
                  Due {hw.due_date}
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
                    Score: {submission.score}
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
                    "
                  >
                    {submission.remarks}
                  </div>
                )}
              </div>

              {/* ACTIONS */}
              <div className="mt-5 flex flex-wrap gap-3">
                {/* DOWNLOAD */}
                <button
                  onClick={() => downloadWorksheet(hw.file_url)}
                  className="
                    flex items-center gap-2
                    text-sm
                    text-blue-600
                    hover:underline
                  "
                >
                  <Download size={16} />
                  Worksheet
                </button>

                {/* SUBMIT */}
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
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => uploadSubmission(hw, e.target.files[0])}
                  />
                </label>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
