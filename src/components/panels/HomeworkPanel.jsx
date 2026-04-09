import { useState } from "react";
import { homework as initialHomework } from "../data/mockData";
import FileUploadModal from "../modals/FileUploadModal";
import { motion } from "framer-motion";
import { Download, Upload } from "lucide-react";

const HomeworkPanel = () => {
  const [homeworkList] = useState(initialHomework);

  const [isHomeworkModalOpen, setIsHomeworkModalOpen] = useState(false);
  const [isMarkedModalOpen, setIsMarkedModalOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
        <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
          Homework
        </h3>

        <button
          onClick={() => setIsHomeworkModalOpen(true)}
          className="bg-(--color-primary) text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm cursor-pointer shadow-sm hover:opacity-90 transition w-full sm:w-auto"
        >
          + Upload Homework
        </button>
      </div>

      {/* Homework List */}
      <div className="space-y-4 sm:space-y-6">
        {homeworkList.map((hw) => (
          <div
            key={hw.id}
            className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-sm"
          >
            {/* Assignment Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-3">
              <div>
                <p className="font-semibold text-gray-800 text-sm sm:text-base">
                  {hw.title}
                </p>
                <p className="text-xs text-gray-400">Assignment</p>
              </div>

              <button className="text-xs sm:text-sm text-blue-600 cursor-pointer hover:underline transition w-fit">
                Download PDF
              </button>
            </div>

            {/* Submissions */}
            <div className="space-y-3 sm:space-y-4">
              {hw.submissions.map((sub, index) => {
                const isMarked = sub.markedFile;

                return (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4"
                  >
                    {/* Top row */}
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-xs sm:text-sm font-medium text-gray-800">
                        {sub.studentName}
                      </p>

                      <span
                        className={`text-[10px] sm:text-xs px-2 py-1 rounded-full
                        ${
                          isMarked
                            ? "bg-green-100 text-green-600"
                            : "bg-yellow-100 text-yellow-600"
                        }`}
                      >
                        {isMarked ? "Marked" : "Pending"}
                      </span>
                    </div>

                    {/* Actions (stack on mobile) */}
                    <button className="flex items-center gap-2 text-xs sm:text-sm text-blue-600 cursor-pointer mt-2">
                      <Download size={14} />
                      Download Submission
                    </button>

                    <button
                      onClick={() => setIsMarkedModalOpen(true)}
                      className="flex items-center gap-2 text-xs sm:text-sm text-green-600 cursor-pointer mt-1"
                    >
                      <Upload size={14} />
                      Upload Marked
                    </button>

                    {/* Remarks */}
                    <textarea
                      placeholder="Write feedback for the student..."
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs sm:text-sm mt-3 mb-3"
                    />

                    <button className="bg-(--color-primary) text-white px-4 py-2 rounded-lg text-xs sm:text-sm cursor-pointer hover:opacity-90 transition w-full sm:w-fit">
                      Save Feedback
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      <FileUploadModal
        isOpen={isHomeworkModalOpen}
        onClose={() => setIsHomeworkModalOpen(false)}
        title="Upload Homework"
      />

      <FileUploadModal
        isOpen={isMarkedModalOpen}
        onClose={() => setIsMarkedModalOpen(false)}
        title="Upload Marked Work"
      />
    </motion.div>
  );
};

export default HomeworkPanel;
