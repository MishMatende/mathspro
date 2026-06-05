import {
  UserRound,
  Target,
  BookOpen,
  BarChart3,
  GraduationCap,
  FileText,
} from "lucide-react";

const features = [
  {
    icon: UserRound,
    title: "Dedicated Tutor",
    description:
      "Every learner is guided by a tutor who understands their strengths, challenges, and goals.",
  },
  {
    icon: Target,
    title: "Personalized Lessons",
    description:
      "Lessons are tailored to each student's pace and learning needs for maximum progress.",
  },
  {
    icon: BookOpen,
    title: "Homework Support",
    description:
      "Structured assignments reinforce learning and build confidence between lessons.",
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    description:
      "Monitor improvement through assessments, reports, and performance insights.",
  },
  {
    icon: GraduationCap,
    title: "Exam Preparation",
    description:
      "Targeted revision strategies and practice tests help learners excel in examinations.",
  },
  {
    icon: FileText,
    title: "Parent Reports",
    description:
      "Parents receive clear updates on achievements, challenges, and next learning goals.",
  },
];

export default function Features() {
  return (
    <section className="relative px-6 py-24 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.15),transparent_60%)]" />
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything learners need to succeed
          </h2>

          <p className="max-w-2xl mx-auto text-gray-500 mb-2">
            A complete learning system designed to improve understanding,
            confidence, and mathematical performance.
          </p>

          <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-500 text-xs md:text-sm font-medium px-4 py-1.5 rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
            Why Parents Choose MathsPro
          </div>
        </div>

        {/* Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <div
                key={index}
                className="
                  group
                  bg-white
                  border border-gray-100
                  rounded-3xl
                  p-7
                  shadow-sm
                  hover:shadow-xl
                  hover:-translate-y-1
                  transition-all
                  duration-300
                "
              >
                <div
                  className="
                    w-14 h-14
                    rounded-2xl
                    bg-orange-50
                    flex items-center justify-center
                    mb-5
                    group-hover:bg-orange-100
                    transition
                  "
                >
                  <Icon size={26} className="text-orange-500" />
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>

                <p className="text-gray-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
