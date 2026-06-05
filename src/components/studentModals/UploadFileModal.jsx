import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { Upload, X, FileText, UploadCloud } from "lucide-react";

export default function UploadFileModal({ onClose, onUploaded }) {
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Enter a title");
      return;
    }

    if (!selectedFile) {
      toast.error("Select a file");
      return;
    }

    if (selectedFile.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }

    try {
      setLoading(true);

      const fileName = `${crypto.randomUUID()}-${selectedFile.name}`;

      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("files")
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      const { data: learner } = await supabase
        .from("learners")
        .select("tutor_id")
        .eq("id", user.id)
        .single();

      const { error } = await supabase.from("files").insert({
        title,
        file_url: filePath,
        learner_id: user.id,
        tutor_id: learner.tutor_id,
      });

      if (error) throw error;

      toast.success("File uploaded");

      onUploaded?.();
      onClose?.();
    } catch (error) {
      console.log(error);

      toast.error(error.message || "Failed to upload file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="
          fixed inset-0
          bg-black/40
          backdrop-blur-sm
          z-40
        "
        onClick={onClose}
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
          md:w-[30vw]
          w-[90vw]
            max-w-lg
            bg-white
            rounded-3xl
            shadow-2xl
          "
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div className="flex gap-3">
                <div
                  className="
                    h-12 w-12
                    rounded-2xl
                    bg-orange-100
                    text-orange-600
                    flex items-center justify-center
                  "
                >
                  <FileText size={20} />
                </div>

                <div>
                  <h2 className="text-xl font-semibold">Upload File</h2>

                  <p className="text-sm text-gray-500">
                    Share a file with your tutor
                  </p>
                </div>
              </div>

              <button onClick={onClose}>
                <X size={18} />
              </button>
            </div>
          </div>

          <form onSubmit={handleUpload} className="p-6 space-y-5">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                File Title
              </label>

              <input
                type="text"
                placeholder="e.g. Mathematics Revision Notes"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="
      w-full
      rounded-2xl
      border border-slate-200
      px-4 py-3
      focus:outline-none
      focus:ring-2
      focus:ring-orange-200
      focus:border-orange-400
    "
              />
            </div>

            <label
              className="
    border-2 border-dashed border-orange-200
    rounded-2xl
    p-8
    flex flex-col items-center justify-center
    text-center
    cursor-pointer
    hover:border-orange-400
    hover:bg-orange-50/50
    transition
  "
            >
              <UploadCloud size={34} className="text-orange-500 mb-3" />

              <p className="font-medium text-slate-800">Upload File</p>

              <p className="text-sm text-slate-500 mt-1">
                Drag and drop or click to browse
              </p>

              <p className="text-xs text-slate-400 mt-2">PDF</p>

              <input
                hidden
                type="file"
                accept="application/pdf,.pdf"
                onChange={(e) => setSelectedFile(e.target.files[0])}
              />
            </label>

            {selectedFile && (
              <div
                className="
      flex items-center justify-between
      p-4
      rounded-2xl
      bg-slate-50
      border border-slate-100
    "
              >
                <div className="flex items-center gap-3">
                  <FileText size={18} className="text-orange-500" />

                  <div>
                    <p className="font-medium text-sm">{selectedFile.name}</p>

                    <p className="text-xs text-slate-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div
              className="
    flex justify-end gap-3
    border-t border-slate-100
    pt-5 mt-6
  "
            >
              <button
                type="button"
                onClick={onClose}
                className="
                  px-4 py-2
                  border rounded-xl
                "
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="
                  px-5 py-2
                  rounded-xl
                  bg-orange-500
                  text-white
                "
              >
                {loading ? "Uploading..." : "Upload File"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
