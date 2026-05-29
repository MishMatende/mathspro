import { useEffect, useMemo, useState } from "react";

import { supabase } from "../../lib/supabase";

import { useAuth } from "../../context/AuthContext";

import toast from "react-hot-toast";

import { X, UploadCloud } from "lucide-react";

const defaultForm = {
  learner_id: "",
  tutor_id: "",
  title: "",
  category: "",
  instructions: "",
  due_date: "",
  status: "active",
};

export default function UploadHomeworkModal({
  isOpen,
  onClose,
  onUploaded,
  homework = null,
}) {
  const { user } = useAuth();

  const [learners, setLearners] = useState([]);

  const [loading, setLoading] = useState(false);

  const [file, setFile] = useState(null);

  const [formData, setFormData] = useState(defaultForm);

  const isEditing = useMemo(() => Boolean(homework?.id), [homework?.id]);

  // 🔥 Fetch tutor learners
  const fetchLearners = async () => {
    const { data, error } = await supabase
      .from("learners")
      .select("id, name")
      .eq("tutor_id", user.id)
      .order("name");

    if (!error) {
      setLearners(data || []);
    }
  };

  useEffect(() => {
    if (isOpen && user) {
      fetchLearners();

      setFormData({
        ...defaultForm,
        learner_id: homework?.learner_id || "",
        tutor_id: user.id,
        title: homework?.title || "",
        category: homework?.category || "",
        instructions: homework?.instructions || "",
        due_date: homework?.due_date || "",
        status: homework?.status || "active",
      });

      setFile(null);
    }
  }, [isOpen, user, homework]);

  // 🔥 Input handler
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // 🔥 Upload
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEditing && !file) {
      toast.error("Please upload a file");

      return;
    }

    try {
      setLoading(true);

      let file_url = homework?.file_url || null;
      let uploadedPath = null;

      if (file) {
        // 🔥 Upload file
        const fileExt = file.name.split(".").pop();

        const fileName = `${crypto.randomUUID()}.${fileExt}`;

        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("homework-files")
          .upload(filePath, file);

        if (uploadError) {
          console.log(uploadError);

          toast.error(uploadError.message || "Failed to upload file");

          setLoading(false);

          return;
        }

        uploadedPath = filePath;
        file_url = filePath;
      }

      const payload = {
        learner_id: formData.learner_id,

        tutor_id: user.id,

        title: formData.title.trim(),

        category: formData.category.trim() || null,

        instructions: formData.instructions.trim() || null,

        due_date: formData.due_date || null,

        file_url,

        status: formData.status || "active",
      };

      const query = isEditing
        ? supabase
            .from("homework")
            .update(payload)
            .eq("id", homework.id)
            .eq("tutor_id", user.id)
        : supabase.from("homework").insert([
            {
              ...payload,
              created_by: user.id,
            },
          ]);

      const { error } = await query;

      setLoading(false);

      if (error) {
        console.log(error);

        if (uploadedPath) {
          await supabase.storage.from("homework-files").remove([uploadedPath]);
        }

        toast.error(
          error.message ||
            (isEditing
              ? "Failed to update homework"
              : "Failed to create homework"),
        );

        return;
      }

      if (isEditing && uploadedPath && homework?.file_url) {
        await supabase.storage.from("homework-files").remove([homework.file_url]);
      }

      toast.success(isEditing ? "Homework updated" : "Homework uploaded");

      onUploaded?.();

      onClose();
    } catch (err) {
      console.log(err);

      setLoading(false);

      toast.error("Something went wrong");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="
        fixed inset-0 z-50
        bg-black/40
        backdrop-blur-sm
        flex items-end sm:items-center justify-center
      "
    >
      <div
        className="
          w-full sm:w-150
          bg-white
          rounded-t-3xl sm:rounded-3xl
          p-5 sm:p-6
          max-h-[90vh]
          overflow-y-auto
        "
      >
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">
              {isEditing ? "Edit Homework" : "Upload Homework"}
            </h2>

            <p className="text-sm text-gray-400 mt-1">
              {isEditing
                ? "Update the assignment details"
                : "Create homework for a learner"}
            </p>
          </div>

          <button
            onClick={onClose}
            className="
              w-10 h-10
              rounded-xl
              border border-gray-200
              flex items-center justify-center
            "
          >
            <X size={18} />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* LEARNER */}
          <div>
            <label className="text-sm font-medium">Learner</label>

            <select
              name="learner_id"
              value={formData.learner_id}
              onChange={handleChange}
              required
              className="
                mt-2 w-full
                border border-gray-200
                rounded-2xl
                px-4 py-3
              "
            >
              <option value="">Select learner</option>

              {learners.map((learner) => (
                <option key={learner.id} value={learner.id}>
                  {learner.name}
                </option>
              ))}
            </select>
          </div>

          {/* TITLE */}
          <div>
            <label className="text-sm font-medium">Homework Title</label>

            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Algebra Practice"
              className="
                mt-2 w-full
                border border-gray-200
                rounded-2xl
                px-4 py-3
              "
            />
          </div>

          {/* CATEGORY */}
          <div>
            <label className="text-sm font-medium">Category</label>

            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="Algebra"
              className="
                mt-2 w-full
                border border-gray-200
                rounded-2xl
                px-4 py-3
              "
            />
          </div>

          {/* INSTRUCTIONS */}
          <div>
            <label className="text-sm font-medium">Instructions</label>

            <textarea
              rows={4}
              name="instructions"
              value={formData.instructions}
              onChange={handleChange}
              placeholder="Complete all questions..."
              className="
                mt-2 w-full
                border border-gray-200
                rounded-2xl
                px-4 py-3
              "
            />
          </div>

          {/* DUE DATE */}
          <div>
            <label className="text-sm font-medium">Due Date</label>

            <input
              type="date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
              required
              className="
                mt-2 w-full
                border border-gray-200
                rounded-2xl
                px-4 py-3
              "
            />
          </div>

          {/* STATUS */}
          <div>
            <label className="text-sm font-medium">Status</label>

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="
                mt-2 w-full
                border border-gray-200
                rounded-2xl
                px-4 py-3
              "
            >
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* FILE */}
          <div>
            <label className="text-sm font-medium">
              {isEditing ? "Replace Worksheet" : "Upload Worksheet"}
            </label>

            <label
              className="
                mt-2
                border-2 border-dashed
                border-gray-200
                rounded-2xl
                p-6
                flex flex-col items-center
                justify-center
                cursor-pointer
                hover:border-orange-300
                transition
              "
            >
              <UploadCloud size={30} className="text-gray-400" />

              <p className="text-sm text-gray-500 mt-2">
                {file
                  ? file.name
                  : isEditing
                    ? "Click to replace file"
                    : "Click to upload file"}
              </p>

              <input
                type="file"
                hidden
                accept=".pdf,.doc,.docx"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </label>
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="
                px-5 py-3
                rounded-2xl
                border border-gray-200
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="
                px-5 py-3
                rounded-2xl
                bg-orange-500
                text-white
              "
            >
              {loading
                ? isEditing
                  ? "Saving..."
                  : "Uploading..."
                : isEditing
                  ? "Save Changes"
                  : "Upload Homework"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
