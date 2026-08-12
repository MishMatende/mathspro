import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";
import { downloadStorageFile } from "../../lib/downloadStorageFile";
import { FileText, Download, RefreshCw } from "lucide-react";

export default function TutorFilesPanel({ studentId }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const fetchFiles = async () => {
    if (!studentId) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("files")
        .select("*")
        .eq("learner_id", studentId)
        .order("created_at", {
          ascending: false,
        });

      if (error) throw error;

      setFiles(data || []);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load files");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [studentId]);

  const refreshFiles = async () => {
    setRefreshing(true);
    await fetchFiles();
    toast.success("Files refreshed");
  };

  const downloadFile = async (file) => {
    try {
      await downloadStorageFile({ bucket: "files", path: file.file_url });
    } catch (error) {
      console.log(error);
      toast.error("Failed to download file");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-semibold text-gray-800">Student Files</h3>

          <p className="text-sm text-gray-400 mt-1">
            {files.length} file{files.length !== 1 ? "s" : ""}
          </p>
        </div>

        <button
          onClick={refreshFiles}
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
      {loading && <div className="text-sm text-gray-400">Loading files...</div>}

      {/* EMPTY */}
      {!loading && files.length === 0 && (
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

          <h3 className="font-semibold text-gray-800">No Files Uploaded</h3>

          <p className="text-sm text-gray-400 mt-1">
            Files uploaded by the learner will appear here
          </p>
        </div>
      )}

      {/* FILES */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {files.map((file) => (
          <div
            key={file.id}
            className="
              bg-white
              rounded-xl
              p-4
              shadow-sm
              border border-gray-100
            "
          >
            <div className="flex items-start gap-3">
              <div
                className="
                  h-10 w-10
                  rounded-xl
                  bg-orange-100
                  text-orange-600
                  flex items-center justify-center
                  shrink-0
                "
              >
                <FileText size={18} />
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-gray-900 truncate">
                  {file.title}
                </h4>

                <p className="text-xs text-gray-400 mt-1">
                  Posted {formatDate(file.created_at)}
                </p>
              </div>
            </div>

            <button
              onClick={() => downloadFile(file)}
              className="
                mt-4
                w-full
                flex items-center justify-center gap-2
                py-2.5
                rounded-xl
                border border-gray-200
                hover:bg-gray-50
                transition
                text-sm
                font-medium
              "
            >
              <Download size={15} />
              Download File
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
