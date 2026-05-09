import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";

import { getCache, setCache } from "../../lib/cache";

export default function LearnerProfilePanel({ learner, onClose }) {
  const [tutors, setTutors] = useState([]);
  const [selectedTutorId, setSelectedTutorId] = useState("");
  const [assigning, setAssigning] = useState(false);

  // 🔥 Sync assigned tutor from learner
  useEffect(() => {
    if (learner?.tutor_id) {
      setSelectedTutorId(learner.tutor_id);
    } else {
      setSelectedTutorId("");
    }
  }, [learner]);

  // 🔥 Fetch tutors
  const fetchTutors = async () => {
    const cachedTutors = getCache("all_tutors");

    // 🔥 Use cache immediately
    if (cachedTutors) {
      setTutors(cachedTutors);
      return;
    }

    // 🔥 Only fetch if no cache
    const { data, error } = await supabase
      .from("tutors")
      .select("*")
      .order("name");

    if (error) {
      console.log(error);
      return;
    }

    setTutors(data);

    setCache("all_tutors", data);
  };

  useEffect(() => {
    if (learner) {
      fetchTutors();
    }
  }, [learner]);

  // 🔥 Assign tutor
  const assignTutor = async (tutorId) => {
    setAssigning(true);

    setSelectedTutorId(tutorId);

    const { error } = await supabase
      .from("learners")
      .update({
        tutor_id: tutorId || null,
      })
      .eq("id", learner.id);

    setAssigning(false);

    if (error) {
      toast.error("Failed to assign tutor");
      setSelectedTutorId(learner.tutor_id || "");
      return;
    }

    // 🔥 update learners cache
    const cachedLearners = getCache("admin_learners");

    if (cachedLearners) {
      const updated = cachedLearners.map((l) =>
        l.id === learner.id
          ? {
              ...l,
              tutor_id: tutorId,
            }
          : l,
      );

      setCache("admin_learners", updated);
    }

    toast.success("Tutor assigned");
  };

  if (!learner) return null;

  return (
    <div
      className="
    fixed right-0 top-0 h-full
    w-full sm:w-96
    bg-white z-50
    shadow-2xl
    overflow-y-auto
    flex flex-col
  "
    >
      {/* HEADER */}
      <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Learner Profile</h2>

        <button
          onClick={onClose}
          className="
        text-sm font-medium
        text-gray-500
        hover:text-black
        transition
      "
        >
          Close
        </button>
      </div>

      {/* CONTENT */}
      <div className="flex-1 px-5 py-5">
        {/* PROFILE */}
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div
            className="
          w-14 h-14 rounded-2xl
          bg-orange-100
          flex items-center justify-center
          text-orange-600
          font-bold text-lg
          shrink-0
        "
          >
            {learner.name?.charAt(0)}
          </div>

          <div className="min-w-0">
            <h3 className="text-2xl font-bold text-gray-900 leading-tight">
              {learner.name}
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              {learner.curriculum} • {learner.level}
            </p>
          </div>
        </div>

        {/* INFO CARDS */}
        <div className="mt-7 space-y-3">
          {/* Student Email */}
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-1">
              Student Email
            </p>

            <p className="text-sm font-medium text-gray-900 wrap-break-word">
              {learner.email || "-"}
            </p>
          </div>

          {/* Student Phone */}
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-1">
              Student Phone
            </p>

            <p className="text-sm font-medium text-gray-900">
              {learner.phone || "-"}
            </p>
          </div>

          {/* Parent Email 1 */}
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-1">
              Parent Email 1
            </p>

            <p className="text-sm font-medium text-gray-900 wrap-break-word">
              {learner.parent_email_1 || "-"}
            </p>
          </div>

          {/* Parent Email 2 */}
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-1">
              Parent Email 2
            </p>

            <p className="text-sm font-medium text-gray-900 wrap-break-word">
              {learner.parent_email_2 || "-"}
            </p>
          </div>
        </div>

        {/* ASSIGN TUTOR */}
        <div className="mt-8">
          <label className="block text-sm font-semibold text-gray-800 mb-3">
            Assign Tutor
          </label>

          <select
            disabled={assigning}
            value={selectedTutorId}
            onChange={(e) => assignTutor(e.target.value)}
            className="
          w-full h-13
          bg-gray-50
          border border-gray-200
          rounded-2xl
          px-4
          text-sm
          focus:outline-none
          focus:ring-4
          focus:ring-orange-500/10
          focus:border-orange-400
          transition
        "
          >
            <option value="">Select Tutor</option>

            {tutors.map((tutor) => (
              <option key={tutor.id} value={tutor.id}>
                {tutor.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
