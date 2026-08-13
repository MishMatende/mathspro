import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";
import { clearCache, getCache, setCache } from "../../lib/cache";
import { useAuth } from "../../context/AuthContext";
import { Mail, Loader2 } from "lucide-react";
import {
  clearLearnerChecklistCache,
  fetchLearnerChecklist,
  getOrCreateLearnerChecklist,
} from "../../lib/learnerChecklist";
import ChecklistBuilderModal from "../adminModals/ChecklistBuilderModal";

export default function LearnerProfilePanel({ learner, onClose, onUpdated }) {
  const [tutors, setTutors] = useState([]);
  const [selectedTutorId, setSelectedTutorId] = useState("");
  const [assigning, setAssigning] = useState(false);
  const { sendAdminPasswordResetLink } = useAuth();
  const [sendingReset, setSendingReset] = useState(false);
  const [checklists, setChecklists] = useState([]);
  const [selectedChecklistId, setSelectedChecklistId] = useState("");
  const [assigningChecklist, setAssigningChecklist] = useState(false);
  const [personalChecklist, setPersonalChecklist] = useState(null);
  const [openingChecklist, setOpeningChecklist] = useState(false);
  const [hasPersonalChecklist, setHasPersonalChecklist] = useState(false);

  // 🔥 Sync assigned tutor from learner
  useEffect(() => {
    setPersonalChecklist(null);
    setHasPersonalChecklist(false);

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
      fetchChecklists();
    }
  }, [learner]);

  // Fetch CheckList
  async function fetchChecklists() {
    const cached = getCache("checklist_level_templates");

    if (cached) {
      setChecklists(cached);
      return;
    }

    const { data, error } = await supabase
      .from("checklist_levels")
      .select("*")
      .is("learner_id", null)
      .order("sort_order");

    if (error) {
      console.error(error);
      return;
    }

    setChecklists(data || []);

    setCache("checklist_level_templates", data || []);
  }

  // 🔥 Assign tutor
  const assignTutor = async (tutorId) => {
    if (!learner?.id) return;

    const previousTutorId = learner.tutor_id || "";
    const nextTutorId = tutorId || null;

    setAssigning(true);

    setSelectedTutorId(tutorId);

    let updatedLearner = null;

    const profileResult = await supabase
      .from("profiles")
      .update({
        id: nextTutorId,
      })
      .eq("id", learner.id)
      .select("*")
      .maybeSingle();

    if (!profileResult.error && profileResult.data) {
      updatedLearner = profileResult.data;
    } else {
      const learnerResult = await supabase
        .from("learners")
        .update({
          tutor_id: nextTutorId,
        })
        .eq("id", learner.id)
        .select("*")
        .maybeSingle();

      if (learnerResult.error || !learnerResult.data) {
        console.log(profileResult.error || learnerResult.error);

        setAssigning(false);

        toast.error("Failed to assign tutor");

        setSelectedTutorId(previousTutorId);

        return;
      }

      updatedLearner = learnerResult.data;
    }

    setAssigning(false);

    setSelectedTutorId(updatedLearner.tutor_id || "");

    // 🔥 update learners cache
    const cachedLearners = getCache("admin_learners");

    if (cachedLearners) {
      const updated = cachedLearners.map((l) =>
        l.id === learner.id
          ? {
              ...l,
              tutor_id: updatedLearner.tutor_id,
            }
          : l,
      );

      setCache("admin_learners", updated);
    }

    clearCache(`tutor_learners_${previousTutorId}`);
    clearCache(`tutor_learners_${updatedLearner.tutor_id}`);
    clearCache(`tutor_students_${previousTutorId}`);
    clearCache(`tutor_students_${updatedLearner.tutor_id}`);

    onUpdated?.(updatedLearner);

    toast.success("Tutor assigned");
  };

  const handleSendReset = async () => {
    if (!learner.email) {
      toast.error("No email found");
      return;
    }

    setSendingReset(true);

    const result = await sendAdminPasswordResetLink(learner.email);

    setSendingReset(false);

    if (!result.success) {
      toast.error(result.error || "Failed to send email");
      return;
    }

    toast.success("Password reset email sent");
  };

  // Assigning CheckList
  async function assignChecklist(levelId) {
    if (!learner?.id) return;

    setAssigningChecklist(true);

    try {
      if (!levelId) {
        const { error } = await supabase
          .from("learner_checklists")
          .delete()
          .eq("learner_id", learner.id);

        if (error) throw error;

        setSelectedChecklistId("");
        clearLearnerChecklistCache(learner.id);

        toast.success("Checklist removed");

        return;
      }

      const { error } = await supabase.from("learner_checklists").upsert(
        {
          learner_id: learner.id,
          level_id: levelId,
        },
        {
          onConflict: "learner_id",
        },
      );

      if (error) throw error;

      setSelectedChecklistId(levelId);
      setCache(`learner_checklist_${learner.id}`, levelId);
      clearCache(`learner_checklist_panel_${learner.id}`);

      toast.success("Checklist assigned");
    } catch (error) {
      console.error(error);

      toast.error("Failed to update checklist");
    } finally {
      setAssigningChecklist(false);
    }
  }

  useEffect(() => {
    async function loadChecklistAssignment() {
      if (!learner?.id) return;

      const cacheKey = `learner_checklist_${learner.id}`;

      const cached = getCache(cacheKey);

      if (cached !== null) {
        setSelectedChecklistId(cached);
        return;
      }

      const { data, error } = await supabase
        .from("learner_checklists")
        .select("level_id")
        .eq("learner_id", learner.id)
        .maybeSingle();

      if (error) {
        console.error(error);
        return;
      }

      const levelId = data?.level_id || "";

      setSelectedChecklistId(levelId);

      setCache(cacheKey, levelId);
    }

    loadChecklistAssignment();
  }, [learner]);

  useEffect(() => {
    async function loadPersonalChecklist() {
      if (!learner?.id) return;

      try {
        const checklist = await fetchLearnerChecklist(learner.id);

        setHasPersonalChecklist(!!checklist);
      } catch (error) {
        console.error(error);
        setHasPersonalChecklist(false);
      }
    }

    loadPersonalChecklist();
  }, [learner]);

  async function openLearnerChecklist() {
    if (!learner?.id) return;

    try {
      setOpeningChecklist(true);

      const checklist = await getOrCreateLearnerChecklist(learner);

      setPersonalChecklist(checklist);
      setHasPersonalChecklist(true);
      setSelectedChecklistId(checklist.id);
      setCache(`learner_checklist_${learner.id}`, checklist.id);
    } catch (error) {
      console.error(error);
      toast.error("Failed to open learner checklist");
    } finally {
      setOpeningChecklist(false);
    }
  }

  if (!learner) return null;

  return (
    <div
      className="
    fixed inset-0 z-50
    bg-black/20 backdrop-blur-[2px]
    flex justify-end
  "
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="
      h-full w-full sm:w-96
      bg-white
      shadow-2xl
      overflow-y-auto
      flex flex-col
    "
      >
        {/* HEADER */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Learner Profile
          </h2>

          <button
            onClick={onClose}
            className="
        text-sm font-medium
        text-gray-500
        hover:text-black
        transition
        cursor-pointer
      "
          >
            Close
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
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
          {/* <div className="mt-8">
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Assign Checklist
            </label>

            <select
              disabled={assigningChecklist}
              value={selectedChecklistId}
              onChange={(e) => assignChecklist(e.target.value)}
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
              <option value="">Select Checklist</option>

              {selectedChecklistId &&
                !checklists.some(
                  (checklist) => checklist.id === selectedChecklistId,
                ) && (
                  <option value={selectedChecklistId}>
                    Personal learner checklist
                  </option>
                )}

              {checklists.map((checklist) => (
                <option key={checklist.id} value={checklist.id}>
                  {checklist.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4">
            <button
              onClick={openLearnerChecklist}
              disabled={openingChecklist}
              className="
                w-full h-12
                rounded-2xl
                bg-orange-500
                hover:bg-orange-600
                text-white
                font-medium text-sm
                transition
                disabled:opacity-50
              "
            >
              {openingChecklist
                ? "Opening Checklist..."
                : hasPersonalChecklist
                  ? "Edit Learner Checklist"
                  : "Create Learner Checklist"}
            </button>
          </div> */}
        </div>

        {/* FOOTER ACTIONS */}
        <div
          className="
    sticky bottom-0
    bg-white/95
    backdrop-blur
    border-t border-gray-100
    p-5
  "
        >
          <button
            onClick={handleSendReset}
            disabled={sendingReset}
            className="
      w-full
      flex items-center justify-center gap-2
      h-12
      rounded-2xl
      border border-orange-200
      bg-orange-50
      hover:bg-orange-100
      text-orange-700
      font-medium text-sm
      transition-all
      disabled:opacity-50
      disabled:cursor-not-allowed
    "
          >
            {sendingReset ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Sending Email...
              </>
            ) : (
              <>
                <Mail size={16} />
                Send Password Reset Email
              </>
            )}
          </button>

          <p className="text-xs text-gray-400 text-center mt-3 leading-relaxed">
            Sends a secure password reset link to the user's email.
          </p>
        </div>
      </div>
      {personalChecklist && (
        <ChecklistBuilderModal
          level={personalChecklist}
          onClose={() => {
            clearLearnerChecklistCache(learner.id);
            setPersonalChecklist(null);
          }}
        />
      )}
    </div>
  );
}
