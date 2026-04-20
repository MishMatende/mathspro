import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Download, Search, Plus, Info } from "lucide-react";
import { homework as initialHomework } from "../../components/data/mockData";
import UploadHomeworkModal from "../../components/tutorModals/UploadHomeworkModal";

const categories = ["All", "Algebra", "Geometry", "Fractions"];

const HomeworkPage = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredHomework = initialHomework.filter((hw) => {
    const matchesSearch = hw.title.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      activeCategory === "All" || hw.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <>
      {/* 👇 Animated Background Content */}
      <motion.div
        animate={{
          scale: isModalOpen ? 0.96 : 1,
          filter: isModalOpen ? "blur(6px)" : "blur(0px)",
        }}
        transition={{
          type: "spring",
          stiffness: 220,
          damping: 25,
        }}
        className="p-4 lg:p-6"
      >
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between gap-4 mb-6">
          {/* Title */}
          <div className="flex items-center gap-2">
            <FileText size={20} />
            <h1 className="text-lg font-semibold">Homework Bank</h1>
          </div>

          <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs sm:text-sm rounded-lg px-3 py-2 mb-4">
            <Info size={20} className="mt-0.5" />
            <p>
              Use this page to see the list of homeworks and upload any new
              homework.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search homework..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary)/30"
              />
            </div>

            {/* Upload Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-(--color-primary) text-white px-4 py-2 rounded-lg text-sm cursor-pointer hover:opacity-90 transition"
            >
              <Plus size={16} />
              Upload Homework
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 text-sm rounded-full whitespace-nowrap cursor-pointer
              ${
                activeCategory === cat
                  ? "bg-(--color-primary) text-white"
                  : "bg-gray-100 text-gray-600"
              }
            `}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Homework List */}
        <div className="space-y-4">
          {filteredHomework.length === 0 ? (
            <p className="text-sm text-gray-400">No homework found</p>
          ) : (
            filteredHomework.map((hw) => (
              <div
                key={hw.id}
                className="bg-white rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
              >
                <div>
                  <p className="font-medium">{hw.title}</p>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {hw.category}
                    </span>

                    <span className="text-xs text-gray-400">
                      {hw.submissions.length} submissions
                    </span>
                  </div>
                </div>

                <button className="flex items-center gap-2 text-sm text-blue-600 cursor-pointer hover:underline">
                  <Download size={16} />
                  Download
                </button>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* Modal */}
      <UploadHomeworkModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default HomeworkPage;
