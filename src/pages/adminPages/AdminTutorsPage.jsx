import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Users, Search, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import CreateUserModal from "../../components/adminModals/CreateUserModal";
import EditTutorModal from "../../components/adminModals/EditTutormodal";
import TutorProfilePanel from "../../components/adminModals/TutorProfileModal";

export default function AdminTutorsPage() {
  const [tutors, setTutors] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [profileTutor, setProfileTutor] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const fetchTutors = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "tutor")
      .order("created_at", { ascending: false });

    if (!error) setTutors(data);
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
            <div className="relative w-full sm:w-64">
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
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-2 bg-(--color-primary) text-white px-4 py-2 rounded-lg text-sm"
            >
              <Plus size={16} />
              Add Tutor
            </button>
          </div>
        </div>

        {/* GRID */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((tutor) => (
            <motion.div
              key={tutor.id}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl p-4 border shadow-sm"
            >
              <div
                onClick={() => setProfileTutor(tutor)}
                className="cursor-pointer"
              >
                <p className="font-medium">
                  {tutor.first_name} {tutor.last_name}
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  {tutor.phone || "No phone"}
                </p>
              </div>

              <div className="flex justify-between mt-4">
                <button
                  onClick={() => setSelectedTutor(tutor)}
                  className="text-sm text-blue-600"
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteTutor(tutor.id)}
                  className="text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* MODALS */}
      <CreateUserModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      <EditTutorModal
        tutor={selectedTutor}
        onClose={() => setSelectedTutor(null)}
        onUpdated={fetchTutors}
      />

      <TutorProfilePanel
        tutor={profileTutor}
        onClose={() => setProfileTutor(null)}
      />
    </>
  );
}
