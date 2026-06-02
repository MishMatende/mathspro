import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import LearnerProfile from "../../components/panels/LearnerProfile";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const LearnerProfilePage = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [learner, setLearner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLearner = async () => {
      if (!id || !user?.id) return;

      setLoading(true);

      const { data, error } = await supabase
        .from("learners")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      setLoading(false);

      if (error) {
        console.log(error);
        toast.error("Failed to load learner");
        return;
      }

      setLearner(data);
    };

    fetchLearner();
  }, [id, user?.id]);

  if (loading) {
    return (
      <div className="p-4 lg:p-6 text-sm text-gray-400">
        Loading learner profile...
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      <LearnerProfile learner={learner} />
    </div>
  );
};

export default LearnerProfilePage;
