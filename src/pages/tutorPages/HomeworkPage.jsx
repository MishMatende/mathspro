import { useEffect, useMemo, useState } from "react";

import { motion } from "framer-motion";

import { FileText, Download, Search, Plus, Info } from "lucide-react";

import { supabase } from "../../lib/supabase";

import { useAuth } from "../../context/AuthContext";

import toast from "react-hot-toast";

import UploadHomeworkModal from "../../components/tutorModals/UploadHomeworkModal";

const categories = ["All", "Algebra", "Geometry", "Fractions"];

const HomeworkPage = () => {
  const { user } = useAuth();

  const [search, setSearch] = useState("");

  const [activeCategory, setActiveCategory] = useState("All");

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [homework, setHomework] = useState([]);

  const [loading, setLoading] = useState(true);

  // 🔥 Fetch homework
  const fetchHomework = async () => {
    if (!user) return;

    setLoading(true);

    const { data, error } = await supabase
      .from("homework")
      .select(
        `
        *,
        learners (
          id,
          name
        ),
        homework_submissions (
          id,
          status
        )
      `,
      )
      .eq("tutor_id", user.id)
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

  // 🔥 Filter homework
  const filteredHomework = useMemo(() => {
    return homework.filter((hw) => {
      const matchesSearch = hw.title
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory =
        activeCategory === "All" || hw.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [homework, search, activeCategory]);

  // 🔥 Download file
  const handleDownload = async (filePath) => {
    try {
      const { data, error } = await supabase.storage
        .from("homework-files")
        .createSignedUrl(filePath, 60);

      if (error) {
        console.log(error);

        toast.error("Failed to generate file link");

        return;
      }

      if (data?.signedUrl) {
        window.open(data.signedUrl, "_blank");
      }
    } catch (err) {
      console.log(err);

      toast.error("Failed to download file");
    }
  };

  return (
    <>
      {/* 👇 Animated Background Content */}
      <motion.div
        animate={{
          scale: isModalOpen ? 0.96 : 1,

          filter: isModalOpen ? "blur(6px)" : "blur(0px)",
        }}
        transition={{
          type: "spring",

          stiffness: 220,

          damping: 25,
        }}
        className="p-4 lg:p-6"
      >
        {/* HEADER INFO */}
        <div
          className="
            flex items-start gap-2
            bg-blue-50
            border border-blue-100
            text-blue-700
            text-xs sm:text-sm
            rounded-lg
            px-3 py-2
            mb-4
          "
        >
          <Info size={20} className="mt-0.5" />

          <p>
            Use this page to manage homework, assign worksheets and track
            learner submissions.
          </p>
        </div>

        {/* TOP BAR */}
        <div
          className="
            flex flex-col lg:flex-row
            lg:justify-between
            gap-4
            mb-6
          "
        >
          {/* TITLE */}
          <div className="flex items-center gap-2">
            <FileText size={20} />

            <h1 className="text-lg font-semibold">Homework Management</h1>
          </div>

          {/* ACTIONS */}
          <div
            className="
              flex flex-col sm:flex-row
              gap-3
              w-full lg:w-auto
            "
          >
            {/* SEARCH */}
            <div className="relative w-full sm:w-64">
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
                  text-sm
                  border border-gray-200
                  rounded-xl
                  focus:outline-none
                  focus:ring-2
                  focus:ring-orange-200
                "
              />
            </div>

            {/* UPLOAD BUTTON */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="
                flex items-center justify-center gap-2
                bg-orange-500
                text-white
                px-4 py-2
                rounded-xl
                text-sm
                font-medium
                hover:bg-orange-600
                transition
              "
            >
              <Plus size={16} />
              Upload Homework
            </button>
          </div>
        </div>

        {/* CATEGORIES */}
        <div className="flex gap-2 overflow-x-auto mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`
                px-3 py-1.5
                text-sm
                rounded-full
                whitespace-nowrap
                transition
                ${
                  activeCategory === cat
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-600"
                }
              `}
            >
              {cat}
            </button>
          ))}
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

            <h3 className="font-semibold text-gray-800">No homework found</h3>

            <p className="text-sm text-gray-400 mt-1">
              Upload your first homework
            </p>
          </div>
        )}

        {/* HOMEWORK GRID */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredHomework.map((hw) => {
            const submitted =
              hw.homework_submissions?.filter(
                (s) => s.status === "submitted" || s.status === "reviewed",
              ).length || 0;

            return (
              <motion.div
                key={hw.id}
                whileHover={{ scale: 1.01 }}
                className="
                  bg-white
                  rounded-3xl
                  p-5
                  border border-gray-100
                  shadow-sm
                "
              >
                {/* TOP */}
                <div
                  className="
                    flex items-start
                    justify-between
                    gap-4
                  "
                >
                  <div>
                    <h3
                      className="
                        font-semibold
                        text-gray-900
                      "
                    >
                      {hw.title}
                    </h3>

                    <p
                      className="
                        text-sm
                        text-gray-500
                        mt-1
                      "
                    >
                      {hw.learners?.name}
                    </p>
                  </div>

                  <span
                    className="
                      text-xs
                      px-2 py-1
                      rounded-full
                      bg-orange-100
                      text-orange-700
                    "
                  >
                    {hw.category}
                  </span>
                </div>

                {/* DETAILS */}
                <div className="mt-4 space-y-3">
                  <p
                    className="
                      text-sm
                      text-gray-600
                      line-clamp-3
                    "
                  >
                    {hw.instructions || "No instructions"}
                  </p>

                  <div
                    className="
                      flex items-center
                      justify-between
                      text-xs
                      text-gray-400
                    "
                  >
                    <span>Due {hw.due_date}</span>

                    <span>{submitted}/1 submitted</span>
                  </div>
                </div>

                {/* ACTIONS */}
                <div
                  className="
                    mt-5
                    flex items-center
                    justify-end
                  "
                >
                  <button
                    onClick={() => handleDownload(hw.file_url)}
                    className="
                      flex items-center gap-2
                      text-sm
                      text-blue-600
                      hover:underline
                    "
                  >
                    <Download size={16} />
                    Download
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* MODAL */}
      <UploadHomeworkModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUploaded={fetchHomework}
      />
    </>
  );
};

export default HomeworkPage;
