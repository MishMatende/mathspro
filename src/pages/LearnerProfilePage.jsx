import { useParams } from "react-router-dom";
import LearnerProfile from "../components/panels/LearnerProfile";
import { learners } from "../components/data/mockData";

const LearnerProfilePage = () => {
  const { id } = useParams();

  const learner = learners.find((l) => l.id === Number(id));

  return (
    <div className="p-4 lg:p-6">
      <LearnerProfile learner={learner} />
    </div>
  );
};

export default LearnerProfilePage;
