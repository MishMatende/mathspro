import React from "react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="text-center px-6 py-28">

      {/* Top label */}
      <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-500 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 inline-block"></span>
        Structured • Personalized • Results Driven
      </div>

      {/* Headline */}
      <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6 max-w-3xl mx-auto">
        Personalized Math Learning <br /> That Actually Works
      </h1>

      {/* Description */}
      <p className="text-gray-400 max-w-lg mx-auto mb-10 leading-relaxed">
        Every learner follows a customized path guided by a dedicated tutor.
        Track progress, identify gaps, and improve performance through
        structured lessons, homework, and assessments.
      </p>

      {/* Buttons */}
      <div className="flex justify-center gap-4 flex-wrap mb-16">
        <button
          onClick={() => navigate("/diagnostic")}
          className="bg-(--color-primary) text-white px-7 py-3.5 rounded-full font-medium cursor-pointer transition hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-orange-200"
        >
          Take Diagnostic Test
        </button>
        <button
          onClick={() => navigate("/login")}
          className="border border-black-200 text-gray-700 px-7 py-3.5 rounded-full font-medium cursor-pointer transition hover:border-orange-300 hover:text-orange-500 active:scale-[0.98]"
        >
           Login
        </button>
      </div>

      {/* Stats */}
      <div className="flex justify-center gap-10 flex-wrap text-center">
        <div>
          <p className="text-2xl font-bold text-gray-900">500+</p>
          <p className="text-sm text-gray-400 mt-1">Lessons Available</p>
        </div>
        <div className="w-px bg-gray-100"></div>
        <div>
          <p className="text-2xl font-bold text-gray-900">1k+</p>
          <p className="text-sm text-gray-400 mt-1">Students Enrolled</p>
        </div>
        <div className="w-px bg-gray-100"></div>
        <div>
          <p className="text-2xl font-bold text-gray-900">98%</p>
          <p className="text-sm text-gray-400 mt-1">Satisfaction Rate</p>
        </div>
      </div>

    </section>
  );
};

export default Hero;