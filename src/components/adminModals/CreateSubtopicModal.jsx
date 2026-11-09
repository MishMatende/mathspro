// src/components/adminModals/CreateSubtopicModal.jsx
//
// Adds subtopics to an EXISTING checklist topic without touching the ones
// already there, so learner progress on existing subtopics is preserved.
// Subtopics can be picked from the topic library and/or typed in manually.

import { useEffect, useMemo, useState } from "react";
import { Check, CheckCircle2, Plus, X, BookOpen } from "lucide-react";
import Modal, {
  ModalBody,
  ModalFooter,
  ModalHeader,
  btnPrimary,
  btnSecondary,
  fieldInput,
} from "../ui/Modal";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";

const normalize = (value = "") => value.trim().toLowerCase().replace(/\s+/g, " ");

export default function CreateSubtopicModal({ topic, onClose, onCreated }) {
  const existing = useMemo(() => topic.checklist_subtopics || [], [topic]);
  const existingTitles = useMemo(
    () => new Set(existing.map((s) => normalize(s.title))),
    [existing],
  );

  const [libraryTopics, setLibraryTopics] = useState([]);
  const [libraryTopicId, setLibraryTopicId] = useState("");
  const [loadingLibrary, setLoadingLibrary] = useState(true);
  const [selectedLibraryIds, setSelectedLibraryIds] = useState([]);

  const [customTitle, setCustomTitle] = useState("");
  const [customTitles, setCustomTitles] = useState([]);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadLibrary() {
      const { data, error } = await supabase
        .from("topic_library_topics")
        .select(
          "id, title, sort_order, topic_library_subtopics(id, title, sort_order)",
        )
        .order("sort_order")
        .order("title");

      setLoadingLibrary(false);

      if (error) {
        console.error(error);
        return; // Manual entry still works without the library.
      }

      const list = data || [];
      setLibraryTopics(list);

      // Pre-select the library topic this checklist topic came from.
      const match =
        list.find((t) => topic.library_topic_id && t.id === topic.library_topic_id) ||
        list.find((t) => normalize(t.title) === normalize(topic.title));

      if (match) setLibraryTopicId(match.id);
    }

    loadLibrary();
  }, [topic]);

  const librarySubtopics = useMemo(() => {
    const libTopic = libraryTopics.find((t) => t.id === libraryTopicId);
    return [...(libTopic?.topic_library_subtopics || [])].sort(
      (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
    );
  }, [libraryTopics, libraryTopicId]);

  const availableLibrarySubtopics = librarySubtopics.filter(
    (s) => !existingTitles.has(normalize(s.title)),
  );

  function changeLibraryTopic(id) {
    setLibraryTopicId(id);
    setSelectedLibraryIds([]);
  }

  function toggleLibrarySubtopic(id) {
    setSelectedLibraryIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  function toggleAllLibrary() {
    setSelectedLibraryIds(
      selectedLibraryIds.length === availableLibrarySubtopics.length
        ? []
        : availableLibrarySubtopics.map((s) => s.id),
    );
  }

  function addCustom() {
    const title = customTitle.trim().replace(/\s+/g, " ");
    if (!title) return;

    const key = normalize(title);
    const selectedLibraryTitles = librarySubtopics
      .filter((s) => selectedLibraryIds.includes(s.id))
      .map((s) => normalize(s.title));

    if (
      existingTitles.has(key) ||
      customTitles.some((t) => normalize(t) === key) ||
      selectedLibraryTitles.includes(key)
    ) {
      toast.error("That subtopic is already on the list");
      return;
    }

    setCustomTitles((current) => [...current, title]);
    setCustomTitle("");
  }

  function removeCustom(title) {
    setCustomTitles((current) => current.filter((t) => t !== title));
  }

  const titlesToAdd = useMemo(() => {
    const fromLibrary = librarySubtopics
      .filter((s) => selectedLibraryIds.includes(s.id))
      .map((s) => s.title);

    const seen = new Set();
    return [...fromLibrary, ...customTitles].filter((title) => {
      const key = normalize(title);
      if (seen.has(key) || existingTitles.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [librarySubtopics, selectedLibraryIds, customTitles, existingTitles]);

  async function handleSubmit() {
    if (titlesToAdd.length === 0) return;

    try {
      setSaving(true);

      // Append after the current subtopics so existing order is untouched.
      const maxOrder = existing.reduce(
        (max, s) => Math.max(max, s.sort_order ?? 0),
        0,
      );

      const rows = titlesToAdd.map((title, index) => ({
        topic_id: topic.id,
        title,
        sort_order: maxOrder + index + 1,
      }));

      const { error } = await supabase.from("checklist_subtopics").insert(rows);
      if (error) throw error;

      toast.success(
        rows.length === 1 ? "Subtopic added" : `${rows.length} subtopics added`,
      );
      onCreated();
    } catch (error) {
      console.error(error);
      toast.error("Failed to add subtopics");
    } finally {
      setSaving(false);
    }
  }

  const allLibrarySelected =
    availableLibrarySubtopics.length > 0 &&
    selectedLibraryIds.length === availableLibrarySubtopics.length;

  return (
    <Modal onClose={onClose} size="lg" labelledBy="add-subtopics-title">
      <ModalHeader
        id="add-subtopics-title"
        eyebrow={
          <>
            <CheckCircle2 size={15} className="shrink-0" />
            <span className="truncate">{topic.title}</span>
          </>
        }
        title="Add subtopics"
        subtitle="New subtopics are added to this topic. Existing subtopics and their progress stay as they are."
        onClose={onClose}
      />

        {/* Body */}
        <ModalBody className="space-y-6">
          {/* From library */}
          <section>
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <BookOpen size={16} className="text-orange-500" />
                From topic library
              </h3>

              {libraryTopics.length > 0 && (
                <select
                  value={libraryTopicId}
                  onChange={(e) => changeLibraryTopic(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-base sm:w-64 sm:text-sm text-slate-700 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                >
                  <option value="">Choose a library topic…</option>
                  {libraryTopics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {loadingLibrary ? (
              <p className="rounded-2xl bg-slate-50 py-6 text-center text-sm text-slate-500">
                Loading library…
              </p>
            ) : !libraryTopicId ? (
              <p className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                {libraryTopics.length
                  ? "Pick a library topic to see its subtopics, or add your own below."
                  : "Topic library unavailable. Add subtopics manually below."}
              </p>
            ) : librarySubtopics.length === 0 ? (
              <p className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                This library topic has no subtopics.
              </p>
            ) : (
              <>
                <div className="flex items-center justify-between gap-3 rounded-2xl bg-orange-50 px-4 py-3">
                  <p className="text-xs text-slate-600">
                    {selectedLibraryIds.length} of{" "}
                    {availableLibrarySubtopics.length} new selected
                    {librarySubtopics.length > availableLibrarySubtopics.length &&
                      ` · ${librarySubtopics.length - availableLibrarySubtopics.length} already added`}
                  </p>
                  {availableLibrarySubtopics.length > 0 && (
                    <button
                      type="button"
                      onClick={toggleAllLibrary}
                      className="shrink-0 cursor-pointer text-sm font-semibold text-orange-600"
                    >
                      {allLibrarySelected ? "Clear all" : "Select all"}
                    </button>
                  )}
                </div>

                <div className="mt-3 space-y-2">
                  {librarySubtopics.map((subtopic) => {
                    const alreadyAdded = existingTitles.has(
                      normalize(subtopic.title),
                    );
                    const checked =
                      alreadyAdded || selectedLibraryIds.includes(subtopic.id);

                    return (
                      <button
                        key={subtopic.id}
                        type="button"
                        disabled={alreadyAdded}
                        onClick={() => toggleLibrarySubtopic(subtopic.id)}
                        className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${
                          alreadyAdded
                            ? "cursor-default border-slate-100 bg-slate-50 text-slate-400"
                            : checked
                              ? "border-orange-300 bg-orange-50/50 text-slate-900"
                              : "cursor-pointer border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                            alreadyAdded
                              ? "border-slate-300 bg-slate-300 text-white"
                              : checked
                                ? "border-orange-500 bg-orange-500 text-white"
                                : "border-slate-300 bg-white"
                          }`}
                        >
                          {checked && <Check size={13} strokeWidth={3} />}
                        </span>
                        <span className="flex-1">{subtopic.title}</span>
                        {alreadyAdded && (
                          <span className="shrink-0 text-xs font-medium">
                            Already added
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </section>

          {/* Custom */}
          <section>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Plus size={16} className="text-orange-500" />
              Add your own
            </h3>

            <div className="flex gap-2">
              <input
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustom();
                  }
                }}
                placeholder="e.g. Conditional probability"
                className={`min-w-0 flex-1 ${fieldInput}`}
              />
              <button
                type="button"
                onClick={addCustom}
                disabled={!customTitle.trim()}
                className="shrink-0 cursor-pointer rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
              >
                Add
              </button>
            </div>

            {customTitles.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {customTitles.map((title) => (
                  <span
                    key={title}
                    className="flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 py-1.5 pl-3 pr-1.5 text-sm text-slate-800"
                  >
                    {title}
                    <button
                      type="button"
                      onClick={() => removeCustom(title)}
                      aria-label={`Remove ${title}`}
                      className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-full text-slate-500 hover:bg-orange-100 hover:text-slate-900"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </section>
        </ModalBody>

      <ModalFooter>
        <button type="button" onClick={onClose} className={btnSecondary}>
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving || titlesToAdd.length === 0}
          className={btnPrimary}
        >
          {saving
            ? "Adding…"
            : titlesToAdd.length === 1
              ? "Add 1 subtopic"
              : `Add ${titlesToAdd.length} subtopics`}
        </button>
      </ModalFooter>
    </Modal>
  );
}
