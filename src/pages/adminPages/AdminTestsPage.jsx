// src/pages/admin/AdminTestsPage.jsx

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";
import { Plus, Trash2, RefreshCw, FileText } from "lucide-react";
import CreateTestModal from "../../components/adminModals/CreateTestModal";

const CACHE_DURATION = 5 * 60 * 1000;

export default function AdminTestsPage() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async (forceRefresh = false) => {
    try {
      setLoading(true);

      const cacheKey = "admin_tests";

      if (!forceRefresh) {
        const cached = sessionStorage.getItem(cacheKey);

        if (cached) {
          const parsed = JSON.parse(cached);

          if (Date.now() - parsed.timestamp < CACHE_DURATION) {
            setTests(parsed.data);
            setLoading(false);
            return;
          }
        }
      }

      const { data, error } = await supabase
        .from("tests")
        .select(
          `
          *,
          learners (
            name
          )
        `,
        )
        .order("created_at", {
          ascending: false,
        });

      if (error) throw error;

      sessionStorage.setItem(
        cacheKey,
        JSON.stringify({
          timestamp: Date.now(),
          data,
        }),
      );

      setTests(data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load tests");
    } finally {
      setLoading(false);
    }
  };

  const deleteTest = async (id) => {
    if (!confirm("Delete this test?")) return;

    try {
      const { error } = await supabase.from("tests").delete().eq("id", id);

      if (error) throw error;

      sessionStorage.removeItem("admin_tests");

      toast.success("Test deleted");

      loadTests(true);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete test");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-orange-100 text-orange-700";

      case "submitted":
        return "bg-blue-100 text-blue-700";

      case "marked":
        return "bg-green-100 text-green-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Tests</h1>

        <div className="flex gap-2">
          <button
            onClick={() => loadTests(true)}
            className="border px-3 py-2 rounded-lg"
          >
            <RefreshCw size={16} />
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : tests.length === 0 ? (
        <div className="bg-white rounded-3xl border border-orange-100 p-10 text-center shadow-sm">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-orange-100 flex items-center justify-center mb-4">
            <FileText size={28} className="text-orange-600" />
          </div>

          <h3 className="font-semibold text-slate-800">No Tests Found</h3>

          <p className="text-sm text-slate-500 mt-2">
            Create your first test assignment.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {tests.map((test) => (
            <div
              key={test.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                    <FileText size={18} className="text-orange-600" />
                  </div>

                  <div className="min-w-0">
                    <h2 className="font-semibold text-slate-900 truncate">
                      {test.title}
                    </h2>

                    <p className="text-sm text-slate-500 truncate">
                      {test.learners?.name}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-slate-400">Due:</span>

                      <span className="text-xs font-medium text-slate-600">
                        {test.due_date
                          ? new Date(test.due_date).toLocaleDateString()
                          : "No due date"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      test.status,
                    )}`}
                  >
                    {test.status}
                  </span>

                  <button
                    onClick={() => deleteTest(test.id)}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateTestModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            sessionStorage.removeItem("admin_tests");
            loadTests(true);
          }}
        />
      )}
    </div>
  );
}
