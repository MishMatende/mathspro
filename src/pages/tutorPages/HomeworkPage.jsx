import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileText,
  Download,
  Search,
  Plus,
  Info,
  Pencil,
  Trash2,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import UploadHomeworkModal from "../../components/tutorModals/UploadHomeworkModal";
import { clearCache, getCache, setCache } from "../../lib/cache";
import { downloadStorageFile } from "../../lib/downloadStorageFile";

const defaultCategories = ["All", "Algebra", "Geometry", "Fractions"];

const isPastDue = (dueDate) => {
  if (!dueDate) return false;

  const today = new Date();
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  return new Date(`${dueDate}T00:00:00`) < startOfToday;
};

const getDownloadName = (title, filePath) => {
  const extension = filePath?.split(".").pop();
  const safeTitle = (title || "homework")
    .trim()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

  return extension ? `${safeTitle}.${extension}` : safeTitle;
};

export default function HomeworkPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [learnerFilter, setLearnerFilter] = useState("all");
  const [dueDateFilter, setDueDateFilter] = useState("today");
  const [submissionFilter, setSubmissionFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHomework, setSelectedHomework] = useState(null);
  const [homeworkToDelete, setHomeworkToDelete] = useState(null);
  const [homework, setHomework] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const cacheKey = user?.id ? `tutor_homework_${user.id}` : null;

  // 🔥 Fetch homework
  const fetchHomework = async (forceRefresh = false) => {
    if (!user) return;

    if (!forceRefresh && cacheKey) {
      const cachedHomework = getCache(cacheKey);

      if (cachedHomework) {
        setHomework(cachedHomework);
        setLoading(false);
        return;
      }
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("homework")
      .select(
        `
        id,
        tutor_id,
        learner_id,
        title,
        category,
        instructions,
        file_url,
        due_date,
        status,
        created_at,
        learners (
          id,
          name
        ),
        homework_submissions (
          id,
          status,
          submitted_at,
          reviewed_at
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

    const nextHomework = data || [];

    setHomework(nextHomework);

    if (cacheKey) {
      setCache(cacheKey, nextHomework);
    }
  };

  useEffect(() => {
    fetchHomework();
  }, [user?.id]);

  const categories = useMemo(() => {
    const dynamicCategories = homework
      .map((hw) => hw.category)
      .filter(Boolean)
      .filter((category, index, list) => list.indexOf(category) === index);

    return [
      ...defaultCategories,
      ...dynamicCategories.filter(
        (category) => !defaultCategories.includes(category),
      ),
    ];
  }, [homework]);

  // 🔥 Filter homework
  const filteredHomework = useMemo(() => {
    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const endOfWeek = new Date(startOfToday);
    endOfWeek.setDate(startOfToday.getDate() + 7);

    return homework.filter((hw) => {
      const searchValue = search.toLowerCase();

      const matchesSearch = `${hw.title || ""} ${hw.learners?.name || ""}`
        .toLowerCase()
        .includes(searchValue);

      const matchesCategory =
        activeCategory === "All" || hw.category === activeCategory;

      const matchesLearner =
        learnerFilter === "all" || hw.learner_id === learnerFilter;

      const hasSubmission = hw.homework_submissions?.some(
        (submission) =>
          submission.status === "submitted" || submission.status === "reviewed",
      );

      const matchesSubmission =
        submissionFilter === "all" ||
        (submissionFilter === "submitted" && hasSubmission) ||
        (submissionFilter === "notSubmitted" && !hasSubmission) ||
        (submissionFilter === "reviewed" &&
          hw.homework_submissions?.some(
            (submission) => submission.status === "reviewed",
          ));

      const dueDate = hw.due_date ? new Date(`${hw.due_date}T00:00:00`) : null;
      const matchesDueDate =
        dueDateFilter === "all" ||
        (dueDateFilter === "noDueDate" && !dueDate) ||
        (dueDateFilter === "overdue" && isPastDue(hw.due_date)) ||
        (dueDateFilter === "today" &&
          dueDate?.getTime() === startOfToday.getTime()) ||
        (dueDateFilter === "nextWeek" &&
          dueDate >= startOfToday &&
          dueDate <= endOfWeek);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesLearner &&
        matchesSubmission &&
        matchesDueDate
      );
    });
  }, [
    homework,
    search,
    activeCategory,
    learnerFilter,
    dueDateFilter,
    submissionFilter,
  ]);

  // 🔥 Download file
  const handleDownload = async (filePath, title) => {
    if (!filePath) {
      toast.error("No worksheet file found");
      return;
    }

    try {
      await downloadStorageFile({
        bucket: "homework-files",
        path: filePath,
        fileName: getDownloadName(title, filePath),
      });
    } catch (err) {
      console.log(err);

      toast.error("Failed to download file");
    }
  };

  const handleSaved = () => {
    if (cacheKey) {
      clearCache(cacheKey);
    }

    fetchHomework(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedHomework(null);
  };

  const handleEdit = (hw) => {
    if (isPastDue(hw.due_date)) {
      toast.error("Past-due homework can no longer be edited");
      return;
    }

    setSelectedHomework(hw);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!homeworkToDelete) return;
    const hw = homeworkToDelete;
    const loadingToast = toast.loading("Deleting homework...");

    try {
      const { error: submissionError } = await supabase
        .from("homework_submissions")
        .delete()
        .eq("homework_id", hw.id);

      if (submissionError) {
        console.log(submissionError);
      }

      const { data, error } = await supabase
        .from("homework")
        .delete()
        .eq("id", hw.id)
        .eq("tutor_id", user.id)
        .select("file_url")
        .single();

      if (error) {
        console.log(error);
        toast.error("Failed to delete homework");
        return;
      }

      const filePath = data?.file_url || hw.file_url;

      if (filePath) {
        const { error: storageError } = await supabase.storage
          .from("homework-files")
          .remove([filePath]);

        if (storageError) {
          console.log(storageError);
        }
      }

      const nextHomework = homework.filter((item) => item.id !== hw.id);

      setHomework(nextHomework);

      if (cacheKey) {
        setCache(cacheKey, nextHomework);
      }

      toast.success("Homework deleted");
      setHomeworkToDelete(null);
    } catch (err) {
      console.log(err);

      toast.error("Failed to delete homework");
    } finally {
      toast.dismiss(loadingToast);
    }
    console.log(hw);
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
              onClick={() => {
                setSelectedHomework(null);
                setIsModalOpen(true);
              }}
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
                cursor-pointer
              "
            >
              <Plus size={16} />
              Upload Homework
            </button>
          </div>
        </div>

        {/* FILTERS */}
        <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <label className="text-xs font-medium text-gray-500">
              Topic
              <select
                value={activeCategory}
                onChange={(event) => setActiveCategory(event.target.value)}
                className="mt-1 block w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-orange-400 cursor-pointer"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === "All" ? "All topics" : category}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs font-medium text-gray-500">
              Learner
              <select
                value={learnerFilter}
                onChange={(event) => setLearnerFilter(event.target.value)}
                className="mt-1 block w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-orange-400 cursor-pointer"
              >
                <option value="all">All</option>
                {[
                  ...new Map(
                    homework.map((hw) => [hw.learner_id, hw.learners]),
                  ).values(),
                ]
                  .filter(Boolean)
                  .map((learner) => (
                    <option key={learner.id} value={learner.id}>
                      {learner.name}
                    </option>
                  ))}
              </select>
            </label>

            <label className="text-xs font-medium text-gray-500">
              Due date
              <select
                value={dueDateFilter}
                onChange={(event) => setDueDateFilter(event.target.value)}
                className="mt-1 block w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-orange-400 cursor-pointer"
              >
                <option value="all">All</option>
                <option value="overdue">Past due</option>
                <option value="today">Due today</option>
                <option value="nextWeek">Due in the next week</option>
                <option value="noDueDate">No due date</option>
              </select>
            </label>

            <label className="text-xs font-medium text-gray-500">
              Submission
              <select
                value={submissionFilter}
                onChange={(event) => setSubmissionFilter(event.target.value)}
                className="mt-1 block w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-orange-400 cursor-pointer"
              >
                <option value="all">All</option>
                <option value="submitted">Submitted</option>
                <option value="notSubmitted">Not submitted</option>
                <option value="reviewed">Reviewed</option>
              </select>
            </label>
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
                    {hw.category || "General"}
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
                    <span>
                      {hw.due_date ? `Due ${hw.due_date}` : "No due date"}
                    </span>

                    <button
                      onClick={() => {
                        console.log("Learner ID", hw.learners?.id);
                        navigate(`/learners/${hw.learners?.id}?tab=homework`);
                      }}
                      className="
    px-2 py-1
    rounded-full
    bg-green-50
    text-green-700
    hover:bg-green-100
    transition
    cursor-pointer
  "
                    >
                      {submitted}/1 submitted
                    </button>
                  </div>
                </div>

                {/* ACTIONS */}
                <div
                  className="
                    mt-5
                    flex items-center
                    justify-between
                    gap-3
                  "
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleEdit(hw)}
                      disabled={isPastDue(hw.due_date)}
                      title={
                        isPastDue(hw.due_date)
                          ? "Past-due homework cannot be edited"
                          : "Edit homework"
                      }
                      className="
                        flex items-center gap-2
                        text-sm
                        text-gray-600
                        hover:text-gray-900
                        disabled:cursor-not-allowed
                        disabled:opacity-40
                        cursor-pointer
                      "
                    >
                      <Pencil size={15} />
                      Edit
                    </button>

                    <button
                      onClick={() => setHomeworkToDelete(hw)}
                      className="
                        flex items-center gap-2
                        text-sm
                        text-red-600
                        hover:text-red-700
                        cursor-pointer
                      "
                    >
                      <Trash2 size={15} />
                      Delete
                    </button>
                  </div>

                  <button
                    onClick={() => handleDownload(hw.file_url, hw.title)}
                    className="
                      flex items-center gap-2
                      text-sm
                      text-blue-600
                      hover:underline
                      cursor-pointer
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
        onClose={handleCloseModal}
        onUploaded={handleSaved}
        homework={selectedHomework}
      />

      {homeworkToDelete && (
        <div
          className="
            fixed inset-0 z-50
            bg-black/40
            backdrop-blur-sm
            flex items-center justify-center
            px-4
          "
        >
          <div
            className="
              max-w-md
              bg-white
              rounded-3xl
              p-6
              shadow-xl
              border border-gray-100
            "
          >
            <div className="flex items-start gap-4">
              <div
                className="
                  w-11 h-11
                  rounded-2xl
                  bg-red-50
                  text-red-600
                  flex items-center justify-center
                  shrink-0
                "
              >
                <Trash2 size={20} />
              </div>

              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-gray-900">
                  Delete homework?
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  This will permanently remove "{homeworkToDelete.title}" and
                  its worksheet file.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setHomeworkToDelete(null)}
                className="
                  px-5 py-3
                  rounded-2xl
                  border border-gray-200
                  text-sm font-medium
                  text-gray-700
                  hover:bg-gray-50
                  cursor-pointer
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="
                  px-5 py-3
                  rounded-2xl
                  bg-red-600
                  text-sm font-medium
                  text-white
                  hover:bg-red-700
                  cursor-pointer
                "
              >
                Delete Homework
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
