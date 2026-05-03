import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function TutorProfilePanel({ tutor, onClose }) {
  const [learners, setLearners] = useState([]);

  useEffect(() => {
    if (!tutor) return;

    const fetchLearners = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("tutor_id", tutor.id);

      setLearners(data || []);
    };

    fetchLearners();
  }, [tutor]);

  if (!tutor) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl p-6 z-50 overflow-y-auto">
      <button onClick={onClose} className="text-sm text-gray-400">
        Close
      </button>

      <h2 className="text-lg font-semibold mt-4">
        {tutor.first_name} {tutor.last_name}
      </h2>

      <p className="text-sm text-gray-500 mt-1">{tutor.email}</p>
      <p className="text-sm text-gray-500">{tutor.phone}</p>

      {/* 🔥 Assigned learners */}
      <div className="mt-6">
        <h3 className="text-sm font-medium mb-2">Assigned Learners</h3>

        {learners.length === 0 ? (
          <p className="text-xs text-gray-400">No learners assigned</p>
        ) : (
          <div className="space-y-2">
            {learners.map((l) => (
              <div
                key={l.id}
                className="bg-gray-50 px-3 py-2 rounded-lg text-sm"
              >
                {l.first_name} {l.last_name}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
