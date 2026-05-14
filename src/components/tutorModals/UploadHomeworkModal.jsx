import { useEffect, useState } from "react";

import { supabase } from "../../lib/supabase";

import { useAuth } from "../../context/AuthContext";

import toast from "react-hot-toast";

import { X, UploadCloud } from "lucide-react";

export default function UploadHomeworkModal({ isOpen, onClose, onUploaded }) {
  const { user } = useAuth();

  const [learners, setLearners] = useState([]);

  const [loading, setLoading] = useState(false);

  const [file, setFile] = useState(null);

  const [formData, setFormData] = useState({
    learner_id: "",

    tutor_id: "",

    title: "",

    category: "",

    instructions: "",

    due_date: "",
  });

  // 🔥 Fetch tutor learners
  const fetchLearners = async () => {
    const { data, error } = await supabase
      .from("learners")
      .select("*")
      .eq("tutor_id", user.id)
      .order("name");

    if (!error) {
      setLearners(data || []);
    }
  };

  useEffect(() => {
    if (isOpen && user) {
      fetchLearners();

      setFormData((prev) => ({
        ...prev,
        tutor_id: user.id,
      }));
    }
  }, [isOpen, user]);

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

    if (!file) {
      toast.error("Please upload a file");

      return;
    }

    try {
      setLoading(true);

      // 🔥 Upload file
      const fileExt = file.name.split(".").pop();

      const fileName = `${crypto.randomUUID()}.${fileExt}`;

      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("homework-files")
        .upload(filePath, file);

      if (uploadError) {
        console.log(uploadError);

        toast.error("Failed to upload file");

        setLoading(false);

        return;
      }

      // 🔥 Get path
      const file_url = filePath;

      // 🔥 Insert homework
      const { error } = await supabase.from("homework").insert([
        {
          learner_id: formData.learner_id,

          tutor_id: formData.tutor_id,

          created_by: user.id,

          title: formData.title,

          category: formData.category,

          instructions: formData.instructions,

          due_date: formData.due_date,

          file_url,

          status: "active",
        },
      ]);

      setLoading(false);

      if (error) {
        console.log(error);

        toast.error("Failed to create homework");

        return;
      }

      toast.success("Homework uploaded");

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
            <h2 className="text-xl font-semibold">Upload Homework</h2>

            <p className="text-sm text-gray-400 mt-1">
              Create homework for a learner
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

          {/* FILE */}
          <div>
            <label className="text-sm font-medium">Upload Worksheet</label>

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
                {file ? file.name : "Click to upload file"}
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
              {loading ? "Uploading..." : "Upload Homework"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
