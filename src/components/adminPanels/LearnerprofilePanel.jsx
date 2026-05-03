export default function LearnerProfilePanel({ learner, onClose }) {
  if (!learner) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl p-6 z-50">
      <button onClick={onClose}>Close</button>

      <h2 className="text-lg font-semibold mt-4">
        {learner.first_name} {learner.last_name}
      </h2>

      <p className="text-sm text-gray-500 mt-2">
        {learner.curriculum} • {learner.level}
      </p>

      <div className="mt-4 text-sm">
        <p>Parent: {learner.parent_email}</p>
        <p>Phone: {learner.parent_phone}</p>
      </div>

      <select
        onChange={async (e) => {
          const tutorId = e.target.value;

          await supabase
            .from("profiles")
            .update({ tutor_id: tutorId })
            .eq("id", learner.id);

          toast.success("Tutor assigned");
        }}
      >
        <option>Select Tutor</option>
        {tutors.map((t) => (
          <option key={t.id} value={t.id}>
            {t.first_name} {t.last_name}
          </option>
        ))}
      </select>
    </div>
  );
}
