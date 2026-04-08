import { useState } from "react";
import Sidebar from "../components/dashboard/Sidebar";
import Header from "../components/dashboard/Header";
import LearnersList from "../components/panels/LearnersList";
import LearnerProfile from "../components/panels/LearnerProfile";

const TutorDashboard = () => {
  const [selectedLearner, setSelectedLearner] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col">
        <Header open={sidebarOpen} setOpen={setSidebarOpen} />

        {/* MOBILE LOGIC */}
        <div className="flex flex-1 p-4 lg:p-6">
          {/* Learners (show if none selected OR desktop) */}
          <div
            className={`w-full lg:w-[320px] bg-white rounded-2xl shadow-sm overflow-hidden
            ${selectedLearner ? "hidden lg:block" : "block"}
            `}
          >
            <LearnersList onSelect={setSelectedLearner} />
          </div>

          {/* Profile */}
          <div
            className={`flex-1 bg-white rounded-2xl shadow-sm overflow-hidden
            ${!selectedLearner ? "hidden lg:block" : "block"}
            `}
          >
            <LearnerProfile
              learner={selectedLearner}
              onBack={() => setSelectedLearner(null)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorDashboard;
