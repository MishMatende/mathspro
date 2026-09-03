import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Archive,
  Eye,
  FileText,
  Library,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

const emptyForm = {
  title: "",
  description: "",
  subject: "",
  level: "",
  access_scope: "all_tutors",
  tutor_ids: [],
};

export default function AdminResourcesPage() {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    const [resourceResult, tutorResult, logResult] = await Promise.all([
      supabase
        .from("tutor_resources")
        .select("*, tutor_resource_assignments(tutor_id)")
        .order("created_at", { ascending: false }),
      supabase.from("tutors").select("id, name, email").order("name"),
      supabase
        .from("tutor_resource_access_logs")
        .select("resource_id, action, accessed_at, user_id")
        .order("accessed_at", { ascending: false })
        .limit(500),
    ]);
    setLoading(false);
    if (resourceResult.error) return toast.error("Failed to load resources");
    setResources(resourceResult.data || []);
    setTutors(tutorResult.data || []);
    setLogs(logResult.data || []);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(load, 0);
    return () => window.clearTimeout(timeoutId);
  }, [load]);

  const filtered = useMemo(
    () =>
      resources.filter((resource) => {
        const text =
          `${resource.title} ${resource.description} ${resource.subject} ${resource.level || ""}`.toLowerCase();
        return (
          text.includes(query.toLowerCase()) &&
          (status === "all" || resource.status === status)
        );
      }),
    [query, resources, status],
  );

  function openCreate() {
    setForm(emptyForm);
    setFile(null);
    setProgress(0);
    setModal({ type: "create" });
  }

  function openEdit(resource) {
    setForm({
      title: resource.title,
      description: resource.description,
      subject: resource.subject,
      level: resource.level || "",
      access_scope: resource.access_scope,
      tutor_ids:
        resource.tutor_resource_assignments?.map((item) => item.tutor_id) || [],
    });
    setFile(null);
    setProgress(0);
    setModal({ type: "edit", resource });
  }

  async function saveAssignments(resourceId) {
    await supabase
      .from("tutor_resource_assignments")
      .delete()
      .eq("resource_id", resourceId);
    if (form.access_scope === "specific_tutors" && form.tutor_ids.length) {
      const { error } = await supabase
        .from("tutor_resource_assignments")
        .insert(
          form.tutor_ids.map((tutorId) => ({
            resource_id: resourceId,
            tutor_id: tutorId,
          })),
        );
      if (error) throw error;
    }
  }

  async function handleSave(event) {
    event.preventDefault();
    if (!form.title.trim() || !form.subject.trim())
      return toast.error("Title and subject are required");
    if (modal.type === "create" && !file)
      return toast.error("Choose a PDF file");
    if (
      file &&
      (file.type !== "application/pdf" || file.size > 25 * 1024 * 1024)
    )
      return toast.error("Choose a PDF no larger than 25 MB");
    setSaving(true);
    try {
      if (modal.type === "create") {
        const id = crypto.randomUUID();
        const storagePath = `resources/${id}/original.pdf`;
        setProgress(15);
        const { error: rowError } = await supabase
          .from("tutor_resources")
          .insert({
            id,
            ...form,
            tutor_ids: undefined,
            storage_path: storagePath,
            file_size: file.size,
            created_by: user.id,
          });
        if (rowError) throw rowError;
        setProgress(45);
        const { error: uploadError } = await supabase.storage
          .from("tutor-resources")
          .upload(storagePath, file, {
            contentType: "application/pdf",
            upsert: false,
          });
        if (uploadError) {
          await supabase.from("tutor_resources").delete().eq("id", id);
          throw uploadError;
        }
        await saveAssignments(id);
      } else {
        const resource = modal.resource;
        const { error } = await supabase
          .from("tutor_resources")
          .update({
            title: form.title,
            description: form.description,
            subject: form.subject,
            level: form.level || null,
            access_scope: form.access_scope,
            ...(file ? { file_size: file.size } : {}),
          })
          .eq("id", resource.id);
        if (error) throw error;
        if (file) {
          setProgress(50);
          const { error: uploadError } = await supabase.storage
            .from("tutor-resources")
            .update(resource.storage_path, file, {
              contentType: "application/pdf",
              upsert: true,
            });
          if (uploadError) throw uploadError;
        }
        await saveAssignments(resource.id);
      }
      setProgress(100);
      toast.success("Resource saved");
      setModal(null);
      load();
    } catch (error) {
      console.error(error);
      toast.error("Resource could not be saved");
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(resource) {
    const next = resource.status === "active" ? "archived" : "active";
    const { error } = await supabase
      .from("tutor_resources")
      .update({ status: next })
      .eq("id", resource.id);
    if (error) return toast.error("Could not update resource");
    toast.success(
      next === "archived" ? "Resource archived" : "Resource restored",
    );
    load();
  }

  async function removeResource(resource) {
    if (!window.confirm(`Permanently delete “${resource.title}”?`)) return;
    const { error: storageError } = await supabase.storage
      .from("tutor-resources")
      .remove([resource.storage_path]);
    if (storageError) return toast.error("Could not delete the private file");
    const { error } = await supabase
      .from("tutor_resources")
      .delete()
      .eq("id", resource.id);
    if (error) return toast.error("Could not delete resource record");
    toast.success("Resource deleted");
    load();
  }

  return (
    <div className="min-h-full space-y-6 bg-linear-to-br from-slate-50 via-white to-orange-50/40 p-4 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="hidden h-14 w-14 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-200 sm:flex">
            <Library size={25} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Tutor Resources
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Securely manage teaching PDFs and tutor access.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={load}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm hover:bg-orange-50 hover:text-orange-600"
          >
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-orange-200 transition hover:bg-orange-600"
          >
            <Plus size={17} /> Upload resource
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white/80 p-3 shadow-sm sm:flex-row">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={16}
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search resources..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-9 pr-3 outline-none focus:bg-white"
          />
        </div>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
      </div>
      {loading && resources.length === 0 ? (
        <p className="py-12 text-center text-slate-500">Loading resources...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((resource) => {
            const resourceLogs = logs.filter(
              (log) => log.resource_id === resource.id,
            );
            return (
              <article
                key={resource.id}
                className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-[0_18px_45px_rgba(249,115,22,0.1)]"
              >
                <div className="flex gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
                    <FileText size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold truncate">{resource.title}</h2>
                    <p className="text-sm text-slate-500">
                      {resource.subject}
                      {resource.level ? ` · ${resource.level}` : ""}
                    </p>
                  </div>
                  <span
                    className={`h-fit rounded-full px-2.5 py-1 text-xs ${resource.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                  >
                    {resource.status}
                  </span>
                </div>
                <p className="mt-4 line-clamp-2 min-h-10 text-sm text-slate-600">
                  {resource.description || "No description"}
                </p>
                <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                  <span>
                    {resource.access_scope === "all_tutors"
                      ? "All tutors"
                      : `${resource.tutor_resource_assignments?.length || 0} tutors`}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye size={13} />{" "}
                    {resourceLogs.filter((log) => log.action === "view").length}{" "}
                    views
                  </span>
                </div>
                <div className="mt-4 flex justify-end gap-1 border-t border-slate-100 pt-3">
                  <button
                    onClick={() => openEdit(resource)}
                    title="Edit"
                    className="rounded-xl p-2 text-slate-500 hover:bg-orange-50 hover:text-orange-600"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => changeStatus(resource)}
                    title={resource.status === "active" ? "Archive" : "Restore"}
                    className="rounded-xl p-2 text-amber-600 hover:bg-amber-50"
                  >
                    <Archive size={15} />
                  </button>
                  <button
                    onClick={() => removeResource(resource)}
                    title="Delete"
                    className="rounded-xl p-2 text-red-500 hover:bg-red-50"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="sticky top-0 bg-white border-b px-6 py-5 flex justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  {modal.type === "create"
                    ? "Upload resource"
                    : "Edit resource"}
                </h2>
                <p className="text-sm text-slate-500">
                  PDFs remain in private storage.
                </p>
              </div>
              <button
                onClick={() => setModal(null)}
                className="h-9 w-9 flex items-center justify-center rounded-xl hover:bg-slate-100"
              >
                <X size={17} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Resource title *"
                className="w-full rounded-xl border p-3"
              />
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Description"
                rows={3}
                className="w-full rounded-xl border p-3"
              />
              <div className="grid sm:grid-cols-2 gap-3">
                <input
                  value={form.subject}
                  onChange={(e) =>
                    setForm({ ...form, subject: e.target.value })
                  }
                  placeholder="Subject/category *"
                  className="rounded-xl border p-3"
                />
                <input
                  value={form.level}
                  onChange={(e) => setForm({ ...form, level: e.target.value })}
                  placeholder="Class/form/level"
                  className="rounded-xl border p-3"
                />
              </div>
              <select
                value={form.access_scope}
                onChange={(e) =>
                  setForm({
                    ...form,
                    access_scope: e.target.value,
                    tutor_ids: [],
                  })
                }
                className="w-full rounded-xl border p-3"
              >
                <option value="all_tutors">All tutors</option>
                <option value="specific_tutors">Specific tutors</option>
              </select>
              {form.access_scope === "specific_tutors" && (
                <div className="max-h-36 overflow-y-auto rounded-xl border p-2">
                  {tutors.map((tutor) => (
                    <label key={tutor.id} className="flex gap-2 p-2 text-sm">
                      <input
                        type="checkbox"
                        checked={form.tutor_ids.includes(tutor.id)}
                        onChange={() =>
                          setForm({
                            ...form,
                            tutor_ids: form.tutor_ids.includes(tutor.id)
                              ? form.tutor_ids.filter((id) => id !== tutor.id)
                              : [...form.tutor_ids, tutor.id],
                          })
                        }
                      />{" "}
                      {tutor.name || tutor.email}
                    </label>
                  ))}
                </div>
              )}
              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-dashed border-orange-200 bg-orange-50/40 p-4">
                <Upload className="text-orange-500" />
                <span className="text-sm text-slate-600">
                  {file?.name ||
                    (modal.type === "create"
                      ? "Choose PDF (max 25 MB)"
                      : "Replace PDF (optional)")}
                </span>
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
              {saving && (
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full bg-orange-500 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
              <button
                disabled={saving}
                className="w-full rounded-xl bg-orange-500 py-3 font-semibold text-white disabled:opacity-50"
              >
                {saving ? "Saving securely..." : "Save resource"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
