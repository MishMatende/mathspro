import { supabase } from "./supabase";
import { clearCache } from "./cache";

export async function fetchLearnerChecklist(learnerId) {
  if (!learnerId) return null;

  const { data, error } = await supabase
    .from("checklist_levels")
    .select("*")
    .eq("learner_id", learnerId)
    .maybeSingle();

  if (error) throw error;

  return data || null;
}

export async function getOrCreateLearnerChecklist(learner) {
  if (!learner?.id) return null;

  const existing = await fetchLearnerChecklist(learner.id);

  if (existing) return existing;

  const checklistName = learner.name
    ? `${learner.name} Checklist`
    : "Learner Checklist";

  const { data: checklist, error: checklistError } = await supabase
    .from("checklist_levels")
    .insert({
      learner_id: learner.id,
      name: checklistName,
      sort_order: 0,
    })
    .select("*")
    .single();

  if (checklistError) throw checklistError;

  const { error: assignmentError } = await supabase
    .from("learner_checklists")
    .upsert(
      {
        learner_id: learner.id,
        level_id: checklist.id,
      },
      {
        onConflict: "learner_id",
      },
    );

  if (assignmentError) throw assignmentError;

  clearLearnerChecklistCache(learner.id);

  return checklist;
}

export function clearLearnerChecklistCache(learnerId) {
  clearCache(`learner_checklist_${learnerId}`);
  clearCache(`learner_checklist_panel_${learnerId}`);
}
