import { useState } from "react";
import BottomSheetModal from "./BottomSheetModal";
import { X, CheckCircle2, AlertCircle } from "lucide-react";

const LessonReviewModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    achieved: "yes",
    struggles: "",
    nextAction: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = () => {
    let status = "pending";

    if (formData.achieved === "yes") {
      status = "completed";
    } else if (formData.achieved === "no") {
      status = "needs_attention";
    }

    console.log({
      ...formData,
      status,
    });

    onClose();
  };

  const isAchieved = formData.achieved === "yes";

  return (
    <BottomSheetModal isOpen={isOpen} onClose={onClose}>
      {/* Drag Handle */}
      <div className="w-10 h-1.5 bg-gray-300/70 rounded-full mx-auto mb-5" />

      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Lesson Review</h2>
          <p className="text-xs text-gray-500">Evaluate how the lesson went</p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-5">
        {/* Achieved Toggle (Upgraded UI) */}
        <div>
          <label className="text-xs text-gray-500 mb-2 block">
            Was the objective achieved?
          </label>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, achieved: "yes" })}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm transition
                ${
                  isAchieved
                    ? "bg-green-50 text-green-600 border border-green-200"
                    : "bg-gray-100 text-gray-500"
                }
              `}
            >
              <CheckCircle2 size={16} />
              Yes
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, achieved: "no" })}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm transition
                ${
                  !isAchieved
                    ? "bg-red-50 text-red-600 border border-red-200"
                    : "bg-gray-100 text-gray-500"
                }
              `}
            >
              <AlertCircle size={16} />
              No
            </button>
          </div>
        </div>

        {/* Struggles */}
        {!isAchieved && (
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              Student Struggles
            </label>
            <textarea
              name="struggles"
              placeholder="Where did the student struggle?"
              value={formData.struggles}
              onChange={handleChange}
              rows={3}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary)/30 focus:bg-white transition resize-none"
            />
          </div>
        )}

        {/* Next Action */}
        <div>
          <label className="text-xs text-gray-500 mb-1 block">
            Next Action
          </label>
          <textarea
            name="nextAction"
            placeholder="What should happen next?"
            value={formData.nextAction}
            onChange={handleChange}
            rows={3}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary)/30 focus:bg-white transition resize-none"
          />
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        className="w-full mt-6 py-3 rounded-xl text-sm font-medium text-white bg-(--color-primary) hover:shadow-lg hover:scale-[1.01] active:scale-[0.98] transition-all"
      >
        Save Review
      </button>
    </BottomSheetModal>
  );
};

export default LessonReviewModal;
