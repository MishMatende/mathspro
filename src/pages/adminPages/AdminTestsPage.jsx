// src/pages/admin/AdminTestsPage.jsx

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";
import { Plus, Trash2, RefreshCw, FileText, Pencil } from "lucide-react";
import CreateTestModal from "../../components/adminModals/CreateTestModal";
import EditTestModal from "../../components/adminModals/EditTestModal";

const CACHE_DURATION = 5 * 60 * 1000;

export default function AdminTestsPage() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [deleteTest, setDeleteTest] = useState(null);

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

  const confirmDeleteTest = async () => {
    if (!deleteTest) return;

    try {
      const { error } = await supabase
        .from("tests")
        .delete()
        .eq("id", deleteTest.id);

      if (error) throw error;

      sessionStorage.removeItem("admin_tests");

      toast.success("Test deleted");

      setDeleteTest(null);

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

  const getEditState = (test) => {
    if (test.status === "marked") {
      return {
        canEdit: false,
        reason: "Marked tests cannot be edited",
      };
    }

    if (test.status === "submitted") {
      return {
        canEdit: false,
        reason: "Submitted tests cannot be edited",
      };
    }

    if (!test.due_date) {
      return {
        canEdit: false,
        reason: "No due date",
      };
    }

    const dueDate = new Date(test.due_date);
    dueDate.setHours(23, 59, 59, 999);

    if (dueDate < new Date()) {
      return {
        canEdit: false,
        reason: "Past due date",
      };
    }

    return {
      canEdit: true,
      reason: "Edit test",
    };
  };

  const formatDate = (date) => {
    if (!date) return "No date";

    const d = new Date(date);

    return `${String(d.getDate()).padStart(2, "0")}-${d.toLocaleString(
      "en-GB",
      { month: "long" },
    )}-${d.getFullYear()}`;
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Tests</h1>

        <div className="flex gap-2">
          <button
            onClick={() => {
              sessionStorage.removeItem("admin_tests");
              loadTests(true);
            }}
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
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tests.map((test) => {
            const editState = getEditState(test);

            const canDeleteTest = (test) =>
              test.status !== "submitted" && test.status !== "marked";

            return (
              <div
                key={test.id}
                className="
    bg-white
    rounded-3xl
    border border-slate-200
    shadow-sm
    hover:shadow-lg
    transition-all
    duration-200
    p-5
  "
              >
                {/* HEADER */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="h-11 w-11 rounded-2xl bg-orange-100 flex items-center justify-center shrink-0">
                      <FileText size={20} className="text-orange-600" />
                    </div>

                    <div className="min-w-0">
                      <h2 className="font-semibold text-slate-900 truncate">
                        {test.title}
                      </h2>

                      <p className="text-sm text-slate-500">
                        {test.learners?.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {editState.canEdit ? (
                      <button
                        onClick={() => setSelectedTest(test)}
                        className="
      p-2
      rounded-xl
      text-blue-600
      hover:bg-blue-50
      transition
    "
                        title={editState.reason}
                      >
                        <Pencil size={16} />
                      </button>
                    ) : (
                      <span
                        className="p-2 text-slate-300"
                        title={editState.reason}
                      >
                        <Pencil size={16} />
                      </span>
                    )}

                    <button
                      onClick={() => setDeleteTest(test)}
                      disabled={!canDeleteTest(test)}
                      className={`
    p-2 rounded-xl transition
    ${
      canDeleteTest(test)
        ? "text-red-500 hover:bg-red-50"
        : "text-slate-300 cursor-not-allowed"
    }
  `}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* DETAILS */}
                <div className="mt-5 flex items-center justify-between">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      test.status,
                    )}`}
                  >
                    {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                  </span>

                  <p className="text-xs text-slate-500">
                    Due: {formatDate(test.due_date)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {deleteTest && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={() => setDeleteTest(null)}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="max-w-md bg-white rounded-3xl shadow-2xl p-6">
              <h3 className="text-xl font-semibold text-slate-900">
                Delete Test?
              </h3>

              <p className="text-sm text-slate-500 mt-2">
                Are you sure you want to delete
                <span className="font-medium text-slate-700">
                  {" "}
                  {deleteTest.title}
                </span>
                ? This action cannot be undone.
              </p>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setDeleteTest(null)}
                  className="
              px-4 py-2
              rounded-xl
              border border-slate-200
              hover:bg-slate-50
            "
                >
                  Cancel
                </button>

                <button
                  onClick={confirmDeleteTest}
                  className="
              px-4 py-2
              rounded-xl
              bg-red-500
              text-white
              hover:bg-red-600
            "
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </>
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

      {selectedTest && (
        <EditTestModal
          test={selectedTest}
          onClose={() => setSelectedTest(null)}
          onUpdated={() => {
            sessionStorage.removeItem("admin_tests");
            loadTests(true);
            setSelectedTest(null);
          }}
        />
      )}
    </div>
  );
}
