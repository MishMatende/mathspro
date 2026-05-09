import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { getCache, setCache } from "../../lib/cache";

export default function TutorProfilePanel({ tutor, onClose }) {
  const [students, setStudents] = useState([]);

  const fetchStudents = async () => {
    if (!tutor) return;

    const cacheKey = `tutor_students_${tutor.id}`;

    // 🔥 cache first
    const cachedStudents = getCache(cacheKey);

    if (cachedStudents) {
      setStudents(cachedStudents);
      return;
    }

    // 🔥 fetch only if needed
    const { data, error } = await supabase
      .from("learners")
      .select("*")
      .eq("tutor_id", tutor.id)
      .order("name");

    if (error) {
      console.log(error);
      return;
    }

    setStudents(data);

    setCache(cacheKey, data);
  };

  useEffect(() => {
    fetchStudents();
  }, [tutor]);

  if (!tutor) return null;

  return (
    <div
      className="
        fixed right-0 top-0
        h-full w-full sm:w-96
        bg-white z-50
        shadow-2xl
        overflow-y-auto
      "
    >
      {/* HEADER */}
      <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Tutor Profile</h2>

        <button onClick={onClose} className="text-sm text-gray-500">
          Close
        </button>
      </div>

      <div className="p-5">
        {/* TUTOR INFO */}
        <div>
          <h3 className="text-2xl font-bold">{tutor.name}</h3>

          <p className="text-sm text-gray-500 mt-1">{tutor.teaching_areas}</p>
        </div>

        {/* STUDENTS */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold">Assigned Learners</h4>

            <span
              className="
                text-xs px-2 py-1 rounded-full
                bg-orange-100 text-orange-700
              "
            >
              {students.length}
            </span>
          </div>

          <div className="space-y-3">
            {students.length === 0 && (
              <div
                className="
                  border border-dashed
                  rounded-2xl p-6
                  text-center text-sm text-gray-400
                "
              >
                No learners assigned yet
              </div>
            )}

            {students.map((student) => (
              <div
                key={student.id}
                className="
                  border border-gray-100
                  rounded-2xl p-4
                  bg-gray-50
                "
              >
                <p className="font-medium">{student.name}</p>

                <p className="text-xs text-gray-500 mt-1">
                  {student.curriculum} • {student.level}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
