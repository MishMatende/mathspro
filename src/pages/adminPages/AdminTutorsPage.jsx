import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Users, Search, Plus, Trash2, RefreshCw, User } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import CreateUserModal from "../../components/adminModals/CreateUserModal";
import EditTutorModal from "../../components/adminModals/EditTutormodal";
import { getCache, setCache, clearCache } from "../../lib/cache";
import TutorProfilePanel from "../../components/adminPanels/TutorProfilePanel";

export default function AdminTutorsPage() {
  const [tutors, setTutors] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [profileTutor, setProfileTutor] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const fetchTutors = async (forceRefresh = false) => {
    // 🔥 Use cache unless force refresh
    if (!forceRefresh) {
      const cachedTutors = getCache("admin_tutors");

      if (cachedTutors) {
        setTutors(cachedTutors);
        return; // ✅ STOP HERE
      }
    }

    // 🔥 Fetch from DB
    const { data, error } = await supabase
      .from("tutors")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    setTutors(data);

    setCache("admin_tutors", data);
  };

  useEffect(() => {
    fetchTutors();
  }, []);

  const filtered = tutors.filter((t) =>
    `${t.first_name} ${t.last_name}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  // 🔥 DELETE
  const deleteTutor = async (id) => {
    const confirmDelete = confirm("Delete this tutor?");
    if (!confirmDelete) return;

    const loading = toast.loading("Deleting...");

    const { error } = await supabase.from("profiles").delete().eq("id", id);

    toast.dismiss(loading);

    if (error) toast.error("Failed to delete");
    else {
      toast.success("Tutor deleted");

      clearCache("admin_tutors");

      fetchTutors();
    }
  };

  return (
    <>
      <motion.div
        animate={{
          scale: selectedTutor || profileTutor ? 0.96 : 1,
          filter: selectedTutor || profileTutor ? "blur(6px)" : "blur(0px)",
        }}
        className="p-4 lg:p-6"
      >
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Users size={20} />
            <h1 className="text-lg font-semibold">Tutors</h1>
          </div>

          <div className="flex gap-3 flex-wrap">
            <div className="relative sm:w-64">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                placeholder="Search tutors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
              />
            </div>

            <button
              onClick={() => {
                clearCache("admin_tutors");
                fetchTutors(true);
              }}
              className="flex items-center justify-center h-10 w-10 border border-slate-200 rounded-xl hover:bg-slate-50 transition"
            >
              <RefreshCw size={16} />
            </button>

            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-2 bg-(--color-primary) text-white px-4 py-2 rounded-lg text-sm"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* GRID */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((tutor) => (
            <motion.div
              key={tutor.id}
              onClick={() => setProfileTutor(tutor)}
              whileHover={{
                y: -3,
              }}
              className="group cursor-pointer bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-all overflow-hidden"
            >
              {/* HEADER */}
              <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-white px-4 py-4 border-b border-orange-100">
                <div className="flex items-center justify-between">
                  <div className="flex gap-3 items-center">
                    <div className="h-11 w-11 rounded-2xl bg-orange-100 flex items-center justify-center">
                      <User size={20} className="text-orange-600" />
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {tutor.name}
                      </h3>

                      <p className="text-xs text-slate-500">Tutor Profile</p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTutor(tutor.id);
                    }}
                    className="h-9 w-9 rounded-xl flex items-center justify-center text-red-500 hover:bg-red-50 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* BODY */}
              <div className="p-4">
                <div className="flex flex-wrap gap-2 mb-4">
                  {tutor.teaching_areas ? (
                    <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-medium">
                      {tutor.teaching_areas}
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs">
                      No teaching areas
                    </span>
                  )}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTutor(tutor);
                  }}
                  className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition text-sm font-medium"
                >
                  Edit Tutor
                </button>
              </div>
            </motion.div>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="bg-white rounded-3xl border border-orange-100 p-10 text-center shadow-sm">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-orange-100 flex items-center justify-center mb-4">
              <Users size={28} className="text-orange-600" />
            </div>

            <h3 className="font-semibold text-slate-800">No Tutors Found</h3>

            <p className="text-sm text-slate-500 mt-2">
              Create a tutor or adjust your search.
            </p>
          </div>
        )}
      </motion.div>

      {/* MODALS */}
      <CreateUserModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        initialRole="tutor"
      />

      <EditTutorModal
        tutor={selectedTutor}
        onClose={() => setSelectedTutor(null)}
        onUpdated={() => {
          clearCache("admin_tutors");
          fetchTutors(true);
        }}
      />

      <TutorProfilePanel
        tutor={profileTutor}
        onClose={() => setProfileTutor(null)}
      />
    </>
  );
}
