import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { Download, Trash2, Search, RefreshCw, FileText } from "lucide-react";
import { getCache, setCache, clearCache } from "../../lib/cache";
import { Plus } from "lucide-react";
import UploadFileModal from "../../components/studentModals/UploadFileModal";

export default function StudentFilesPage() {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [search, setSearch] = useState("");
  const [fileToDelete, setFileToDelete] = useState(null);

  const cacheKey = user?.id ? `student_files_${user.id}` : null;

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const fetchFiles = async (forceRefresh = false) => {
    if (!user) return;

    try {
      if (!forceRefresh && cacheKey) {
        const cached = getCache(cacheKey);

        if (cached) {
          setFiles(cached);
          setLoading(false);
          return;
        }
      }

      const { data, error } = await supabase
        .from("files")
        .select("*")
        .eq("learner_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      if (error) throw error;

      setFiles(data || []);

      if (cacheKey) {
        setCache(cacheKey, data || []);
      }
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
  }, [user]);

  const handleRefresh = async () => {
    if (!cacheKey) return;

    setRefreshing(true);

    clearCache(cacheKey);

    await fetchFiles(true);

    toast.success("Files refreshed");
  };

  const downloadFile = async (file) => {
    const { data, error } = await supabase.storage
      .from("files")
      .createSignedUrl(file.file_url, 60);

    if (error) {
      toast.error("Failed to download");
      return;
    }

    window.open(data.signedUrl, "_blank");
  };

  const confirmDelete = async (file) => {
    try {
      const { error: storageError } = await supabase.storage
        .from("files")
        .remove([file.file_url]);

      if (storageError) throw storageError;

      const { error } = await supabase.from("files").delete().eq("id", file.id);

      if (error) throw error;

      setFiles((prev) => prev.filter((item) => item.id !== file.id));

      clearCache(cacheKey);

      toast.success("File deleted");

      setFileToDelete(null);

      await fetchFiles(true);
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete file");
    }
  };

  const filteredFiles = useMemo(() => {
    return files.filter((file) =>
      file.title.toLowerCase().includes(search.toLowerCase()),
    );
  }, [files, search]);

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">My Files</h1>

          <p className="text-sm text-gray-400 mt-1">
            Share files with your tutor
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="
        h-11 w-11
        rounded-xl
        border border-gray-200
        bg-white
        flex items-center justify-center
      "
          >
            <RefreshCw
              size={18}
              className={refreshing ? "animate-spin text-orange-500" : ""}
            />
          </button>

          <button
            onClick={() => setShowUploadModal(true)}
            className="
        h-11 px-4
        rounded-xl
        bg-orange-500
        text-white
        flex items-center gap-2
      "
          >
            <Plus size={16} />
            Upload
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={16}
          className="
            absolute left-3 top-1/2
            -translate-y-1/2
            text-gray-400
          "
        />

        <input
          type="text"
          placeholder="Search files..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="
            w-full
            pl-10 pr-4 py-3
            border border-gray-200
            rounded-xl
          "
        />
      </div>

      {/* Files */}
      {loading ? (
        <p className="text-sm text-gray-400">Loading files...</p>
      ) : filteredFiles.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border">
          <FileText size={40} className="mx-auto text-gray-300 mb-3" />

          <h3 className="font-semibold">No files uploaded</h3>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className="
      bg-white
      border border-gray-100
      rounded-2xl
      p-4
      shadow-sm
    "
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
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

                  <div className="min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {file.title}
                    </h3>

                    <p className="text-sm text-gray-400">
                      {formatDate(file.created_at)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => downloadFile(file)}
                    className="
            h-10 px-4
            rounded-xl
            border border-gray-200
            flex items-center gap-2
            hover:bg-gray-50
          "
                  >
                    <Download size={15} />
                    Download
                  </button>

                  <button
                    onClick={() => setFileToDelete(file)}
                    className="
    h-10 w-10
    rounded-xl
    border border-red-100
    text-red-500
    hover:bg-red-50
    flex items-center justify-center
    transition
  "
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showUploadModal && (
        <UploadFileModal
          onClose={() => setShowUploadModal(false)}
          onUploaded={() => {
            clearCache(cacheKey);
            fetchFiles(true);
          }}
        />
      )}

      {fileToDelete && (
        <>
          <div
            className="
        fixed inset-0
        bg-black/40
        backdrop-blur-sm
        z-40
      "
            onClick={() => setFileToDelete(null)}
          />

          <div
            className="
        fixed inset-0
        z-50
        flex items-center justify-center
        p-4
      "
          >
            <div
              className="
           w-[90vw]
           md:w-[30vw]
           max-w-md
          bg-white
          rounded-3xl
          shadow-2xl
          overflow-hidden
        "
            >
              <div className="p-6">
                <div
                  className="
              h-14 w-14
              rounded-2xl
              bg-red-100
              text-red-600
              flex items-center justify-center
              mb-4
            "
                >
                  <Trash2 size={24} />
                </div>

                <h3 className="text-xl font-semibold text-slate-900">
                  Delete File?
                </h3>

                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                  Are you sure you want to delete
                  <span className="font-medium text-slate-800">
                    {" "}
                    {fileToDelete.title}
                  </span>
                  ?
                </p>

                <p className="text-sm text-red-500 mt-2">
                  This action cannot be undone.
                </p>
              </div>

              <div
                className="
            border-t border-slate-100
            p-5
            flex justify-end gap-3
          "
              >
                <button
                  onClick={() => setFileToDelete(null)}
                  className="
              px-4 py-2.5
              rounded-xl
              border border-slate-200
              hover:bg-slate-50
              transition
            "
                >
                  Cancel
                </button>

                <button
                  onClick={() => confirmDelete(fileToDelete)}
                  className="
              px-5 py-2.5
              rounded-xl
              bg-red-500
              text-white
              hover:bg-red-600
              transition
            "
                >
                  Delete File
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
