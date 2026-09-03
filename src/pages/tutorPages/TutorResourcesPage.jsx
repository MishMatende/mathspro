import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  FileText,
  Library,
  RefreshCw,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { supabase } from "../../lib/supabase";

export default function TutorResourcesPage() {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("tutor_resources")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) return toast.error("Resources could not be loaded");
    setResources(data || []);
  }, []);

  useEffect(() => {
    const id = window.setTimeout(load, 0);
    return () => clearTimeout(id);
  }, [load]);
  const subjects = [...new Set(resources.map((item) => item.subject))].sort();
  const filtered = useMemo(
    () =>
      resources.filter(
        (item) =>
          `${item.title} ${item.description} ${item.subject} ${item.level || ""}`
            .toLowerCase()
            .includes(query.toLowerCase()) &&
          (subject === "all" || item.subject === subject),
      ),
    [query, resources, subject],
  );

  return (
    <div className="min-h-full space-y-6 bg-linear-to-br from-slate-50 via-white to-orange-50/50 p-4 lg:p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="hidden h-14 w-14 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-200 sm:flex">
            <Library size={25} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Tutor Resources
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Private teaching materials assigned to you.
            </p>
          </div>
        </div>
        <button
          onClick={load}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white/80 p-3 shadow-sm backdrop-blur sm:flex-row">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={16}
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search titles, subjects or levels..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-9 pr-3 outline-none focus:bg-white"
          />
        </div>
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700"
        >
          <option value="all">All subjects</option>
          {subjects.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>
      {loading && !resources.length ? (
        <p className="py-12 text-center text-slate-500">Loading resources...</p>
      ) : filtered.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((resource) => (
            <article
              key={resource.id}
              className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-[0_20px_45px_rgba(249,115,22,0.12)]"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-orange-400 to-amber-300 opacity-0 transition group-hover:opacity-100" />
              <div className="flex gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                  <FileText />
                </div>
                <div className="min-w-0">
                  <h2 className="truncate font-semibold text-slate-900">
                    {resource.title}
                  </h2>
                  <p className="mt-0.5 text-sm font-medium text-orange-600">
                    {resource.subject}
                    {resource.level ? ` · ${resource.level}` : ""}
                  </p>
                </div>
              </div>
              <p className="mt-4 min-h-10 line-clamp-2 text-sm leading-5 text-slate-600">
                {resource.description || "Teaching resource"}
              </p>
              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-xs text-slate-400">
                  Added {new Date(resource.created_at).toLocaleDateString()}
                </span>
                <button
                  onClick={() => navigate(`/tutor-resources/${resource.id}`)}
                  className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
                >
                  Open workspace
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50">
            <BookOpen className="text-orange-400" />
          </div>
          <p className="font-medium text-slate-700">
            No authorized resources found.
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Try another search or ask an administrator about access.
          </p>
        </div>
      )}
    </div>
  );
}
