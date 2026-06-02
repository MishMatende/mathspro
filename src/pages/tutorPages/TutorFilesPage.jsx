// src/pages/tutor/TutorFilesPage.jsx

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import {
  FileText,
  Download,
  Search,
  RefreshCw,
  GraduationCap,
} from "lucide-react";
import { getCache, setCache, clearCache } from "../../lib/cache";

export default function TutorFilesPage() {
  const { user } = useAuth();

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  const cacheKey = user?.id ? `tutor_files_${user.id}` : null;

  const formatDate = (date) => {
    if (!date) return "-";

    const d = new Date(date);

    const day = String(d.getDate()).padStart(2, "0");

    const month = d.toLocaleString("en-GB", {
      month: "long",
    });

    const year = d.getFullYear();

    return `${day}-${month}-${year}`;
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
    try {
      const { data, error } = await supabase.storage
        .from("files")
        .createSignedUrl(file.file_url, 60);

      if (error) throw error;

      window.open(data.signedUrl, "_blank");
    } catch (error) {
      console.log(error);

      toast.error("Failed to download file");
    }
  };

  const filteredFiles = useMemo(() => {
    const value = search.toLowerCase();

    return files.filter(
      (file) =>
        file.title?.toLowerCase().includes(value) ||
        file.learners?.name?.toLowerCase().includes(value),
    );
  }, [files, search]);

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Student Files</h1>

          <p className="text-sm text-gray-400 mt-1">
            Files shared by your students
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="
            h-11 w-11
            rounded-xl
            border border-gray-200
            bg-white
            flex items-center justify-center
            hover:bg-gray-50
            transition
            disabled:opacity-50
          "
        >
          <RefreshCw
            size={18}
            className={refreshing ? "animate-spin text-orange-500" : ""}
          />
        </button>
      </div>

      {/* SEARCH */}
      <div className="relative">
        <Search
          size={16}
          className="
            absolute
            left-3
            top-1/2
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
            pl-10
            pr-4
            py-3
            border border-gray-200
            rounded-xl
            focus:outline-none
            focus:ring-2
            focus:ring-orange-200
          "
        />
      </div>

      {/* LOADING */}
      {loading && <div className="text-sm text-gray-400">Loading files...</div>}

      {/* EMPTY */}
      {!loading && filteredFiles.length === 0 && (
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

          <h3 className="font-semibold">No files available</h3>

          <p className="text-sm text-gray-400 mt-1">
            Student uploads will appear here
          </p>
        </div>
      )}

      {/* GRID */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filteredFiles.map((file) => (
          <div
            key={file.id}
            className="
              bg-white
              border border-gray-100
              rounded-3xl
              p-5
              shadow-sm
            "
          >
            {/* TOP */}
            <div className="flex items-start gap-3">
              <div
                className="
                  h-12 w-12
                  rounded-2xl
                  bg-orange-100
                  text-orange-600
                  flex items-center justify-center
                  shrink-0
                "
              >
                <FileText size={20} />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-900 truncate">
                  {file.title}
                </h3>

                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <GraduationCap size={14} />

                    <span>{file.learners?.name}</span>
                  </div>

                  <p className="text-xs text-gray-400">
                    Posted {formatDate(file.created_at)}
                  </p>
                </div>
              </div>
            </div>

            {/* ACTIONS */}
            <button
              onClick={() => downloadFile(file)}
              className="
                mt-5
                w-full
                flex items-center justify-center gap-2
                py-3
                rounded-2xl
                border border-gray-200
                hover:bg-gray-50
                transition
                text-sm
                font-medium
              "
            >
              <Download size={16} />
              Download File
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
