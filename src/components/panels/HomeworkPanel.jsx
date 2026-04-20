import { useState } from "react";
import { homework as initialHomework } from "../data/mockData";
import FileUploadModal from "../tutorModals/FileUploadModal";
import { motion } from "framer-motion";
import { Download, Upload, FileText, Plus } from "lucide-react";

const HomeworkPanel = ({ studentId }) => {
  const homeworkList = initialHomework.filter((hw) =>
    hw.submissions.some((sub) => sub.studentId === studentId),
  );

  const [isHomeworkModalOpen, setIsHomeworkModalOpen] = useState(false);
  const [isMarkedModalOpen, setIsMarkedModalOpen] = useState(false);

  const isAnyModalOpen = isHomeworkModalOpen || isMarkedModalOpen;

  return (
    <>
      {/* 👇 Animated Background */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: isAnyModalOpen ? 0.96 : 1,
          filter: isAnyModalOpen ? "blur(6px)" : "blur(0px)",
        }}
        transition={{
          duration: 0.3,
          type: "spring",
          stiffness: 220,
          damping: 25,
        }}
        style={{
          pointerEvents: isAnyModalOpen ? "none" : "auto",
        }}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-5">
          <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
            Homework
          </h3>

          <button
            onClick={() => setIsHomeworkModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-(--color-primary) text-white px-4 py-2.5 rounded-xl text-sm cursor-pointer shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition w-full sm:w-auto"
          >
            <Plus size={16} />
            Upload Homework
          </button>
        </div>

        {/* Homework List */}
        <div className="space-y-5">
          {homeworkList.map((hw) => {
            const studentSubmissions = hw.submissions.filter(
              (sub) => sub.studentId === studentId,
            );

            return (
              <div
                key={hw.id}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
              >
                {/* Assignment Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-gray-100">
                      <FileText size={16} className="text-gray-500" />
                    </div>

                    <div>
                      <p className="font-semibold text-gray-800 text-sm sm:text-base">
                        {hw.title}
                      </p>
                      <p className="text-xs text-gray-400">Assignment</p>
                    </div>
                  </div>

                  <button className="text-xs sm:text-sm text-blue-600 hover:underline">
                    Download PDF
                  </button>
                </div>

                {/* Submissions */}
                <div className="space-y-4">
                  {studentSubmissions.map((sub, index) => {
                    const isMarked = sub.markedFile;

                    return (
                      <div
                        key={index}
                        className="bg-gray-50 rounded-xl p-4 border border-gray-100"
                      >
                        {/* Top */}
                        <div className="flex justify-between items-center mb-3">
                          <p className="text-sm font-medium text-gray-800">
                            {sub.studentName}
                          </p>

                          <span
                            className={`text-xs px-2.5 py-1 rounded-full
                  ${
                    isMarked
                      ? "bg-green-100 text-green-600"
                      : "bg-yellow-100 text-yellow-600"
                  }`}
                          >
                            {isMarked ? "Marked" : "Pending"}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-4 text-sm mb-3">
                          <button className="flex items-center gap-2 text-blue-600 hover:underline">
                            <Download size={14} />
                            Download Submission
                          </button>

                          <button
                            onClick={() => setIsMarkedModalOpen(true)}
                            className="flex items-center gap-2 text-green-600 hover:underline"
                          >
                            <Upload size={14} />
                            Upload Marked
                          </button>
                        </div>

                        {/* Feedback */}
                        <textarea
                          placeholder="Write feedback for the student..."
                          className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary)/30 resize-none"
                        />

                        <button className="mt-3 w-full sm:w-fit flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-(--color-primary) text-white hover:shadow-md hover:scale-[1.01] active:scale-[0.98] transition-all">
                          <Upload size={14} />
                          Save Feedback
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* 👇 Modals OUTSIDE */}
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
    </>
  );
};

export default HomeworkPanel;
