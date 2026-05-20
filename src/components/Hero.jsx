import React from "react";
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";

export default function Hero() {
  const navigate = useNavigate();

  return (
    <>
      <section className="text-center px-6 py-16 md:py-28">
        {/* Top label */}
        <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-500 text-xs md:text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 inline-block"></span>
          Structured • Personalized • Results Driven
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6 max-w-3xl mx-auto">
          Personalized math learning built around
          <br className="hidden sm:block" />
          every learner’s pace, strengths, and growth areas.
        </h1>

        {/* Description */}
        <p className="text-gray-400 text-sm md:text-base max-w-lg mx-auto mb-10 leading-relaxed px-2">
          Every learner follows a customized path guided by a dedicated tutor.
          Track progress, identify gaps, and improve performance through
          structured lessons, homework, and assessments.
        </p>

        {/* Buttons */}
        {/* 
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 mb-12 md:mb-16">
          <button
            onClick={() => navigate("/diagnostic")}
            className="w-full sm:w-auto bg-(--color-primary) text-white px-7 py-3.5 rounded-full font-medium cursor-pointer transition hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-orange-200"
          >
            Take Diagnostic Test
          </button>

          <button
            onClick={() => navigate("/login")}
            className="w-full sm:w-auto border border-black-200 text-gray-700 px-7 py-3.5 rounded-full font-medium cursor-pointer transition hover:border-orange-300 hover:text-orange-500 active:scale-[0.98]"
          >
            Login
          </button>
        </div> 
        */}

        {/* Reviews */}
        <div className="flex flex-col items-center justify-center">
          {/* Avatars */}
          <div className="flex -space-x-3 mb-4">
            <img
              src="https://i.pravatar.cc/100?img=12"
              alt=""
              className="w-11 h-11 rounded-full border-3 border-white object-cover shadow-sm"
            />

            <img
              src="https://i.pravatar.cc/100?img=32"
              alt=""
              className="w-11 h-11 rounded-full border-3 border-white object-cover shadow-sm"
            />

            <img
              src="https://i.pravatar.cc/100?img=15"
              alt=""
              className="w-11 h-11 rounded-full border-3 border-white object-cover shadow-sm"
            />

            <div className="w-11 h-11 rounded-full border-3 border-white bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center text-xs font-semibold shadow-sm">
              +10
            </div>
          </div>

          {/* Stars */}
          <div className="flex items-center gap-1 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={18}
                className="fill-orange-400 text-orange-400"
              />
            ))}
          </div>

          {/* Review Text */}
          <p className="text-sm sm:text-base text-gray-700 font-medium">
            Trusted by{" "}
            <span className="text-gray-900 font-semibold">100+ students</span>
          </p>

          <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-md leading-relaxed">
            Personalized learning experiences with outstanding academic growth
            and real confidence in mathematics.
          </p>
        </div>
      </section>
    </>
  );
}
