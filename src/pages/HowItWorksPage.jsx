// src/pages/public/HowItWorksPage.jsx

import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import {
  Brain,
  Target,
  BookOpen,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Sigma,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function HowItWorksPage() {
  const steps = [
    {
      icon: <Target size={24} />,
      title: "We Identify Your Level",
      text: "We start by understanding where you are, your strengths, weaknesses, and the areas that need attention.",
    },

    {
      icon: <BookOpen size={24} />,
      title: "We Build a Personalized Plan",
      text: "Every learner receives a structured roadmap designed specifically for their goals and learning style.",
    },

    {
      icon: <Brain size={24} />,
      title: "We Develop Strong Conceptual Understanding",
      text: "Beyond exam prep, we focus on understanding foundational concepts and building long-term confidence.",
    },

    {
      icon: <Sparkles size={24} />,
      title: "We Solve Complex Problems",
      text: "Through engaging activities and challenging problems, students develop strong analytical thinking skills.",
    },
  ];

  const values = [
    "Personalized learning plans",

    "Strong conceptual understanding",

    "Confidence building",

    "Real problem-solving skills",

    // "Interactive maths activities",
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] overflow-hidden">
      <Navbar />

      {/* HERO */}
      <section className="relative px-4 sm:px-6 lg:px-16 pt-10 sm:pt-16 pb-20 lg:pb-28">
        {/* Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              rotate: [0, 8, 0],
              y: [0, -10, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-20 left-4 sm:left-10 text-orange-100"
          >
            <Sigma size={90} strokeWidth={1} />
          </motion.div>

          <motion.div
            animate={{
              rotate: [0, -8, 0],
              y: [0, 10, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute bottom-20 right-4 sm:right-10 text-orange-100 rotate-12"
          >
            <Sigma size={80} strokeWidth={1} />
          </motion.div>

          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,100,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,100,0,0.03)_1px,transparent_1px)] bg-size-[40px_40px]" />
        </div>

        <div
          className="
            relative
            max-w-7xl
            mx-auto
            grid
            lg:grid-cols-2
            gap-12 lg:gap-16
            items-center
          "
        >
          {/* LEFT */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="
                inline-flex items-center gap-2
                bg-orange-100
                text-orange-700
                px-4 py-2
                rounded-full
                text-xs sm:text-sm
                font-medium
                mb-6
              "
            >
              <Sparkles size={16} />
              How MathsPro Works
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="
                text-4xl
                sm:text-5xl
                lg:text-7xl
                font-black
                leading-[1.05]
                tracking-[-0.04em]
                text-gray-900
              "
            >
              Learn Maths
              <span className="text-orange-500"> With Confidence.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="
                mt-6 sm:mt-8
                text-base sm:text-lg
                leading-7 sm:leading-8
                text-gray-600
                max-w-2xl
                mx-auto lg:mx-0
              "
            >
              MathsPro brings years of experience helping students understand,
              master and become confident in their maths skills. Our focus goes
              beyond exam preparation — we help learners build real mathematical
              thinking that lasts for life.
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="
                flex flex-wrap
                gap-4
                mt-8 sm:mt-10
                justify-center lg:justify-start
              "
            >
              <Link
                to="/reach-out"
                className="
                  px-7 py-4
                  rounded-2xl
                  bg-orange-500
                  text-white
                  font-semibold
                  shadow-lg shadow-orange-500/20
                  hover:bg-orange-600
                  hover:scale-[1.03]
                  active:scale-[0.98]
                  transition
                  flex items-center gap-2
                "
              >
                Get Started
                <ArrowRight size={18} />
              </Link>
            </motion.div>
          </motion.div>

          {/* RIGHT */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: [0, -10, 0],
            }}
            transition={{
              opacity: { duration: 0.7 },
              scale: { duration: 0.7 },

              y: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
            className="relative"
          >
            <div
              className="
                bg-white
                rounded-[28px] sm:rounded-[36px]
                p-4 sm:p-8
                shadow-2xl
                border border-orange-100
                relative
                overflow-hidden
              "
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-orange-100 rounded-full blur-3xl opacity-40" />

              <img
                src="/Thesis-pana.svg"
                alt="Math learning"
                className="relative z-10 w-full"
              />
            </div>

            {/* SCROLL INDICATOR */}
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
                y: [0, 10, 0],
              }}
              transition={{
                opacity: {
                  delay: 1.2,
                  duration: 0.8,
                },
                y: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
              className="
                hidden lg:flex
                flex-col items-center
                absolute
                -left-17.5
                top-1/2
                -translate-y-1/2
                z-30
              "
            >
              <span
                className="
                  text-[11px]
                  tracking-[0.35em]
                  uppercase
                  text-orange-500
                  font-semibold
                  mb-3
                  rotate-90
                "
              >
                Scroll
              </span>

              <div
                className="
                  mt-10
                  w-8 h-14
                  rounded-full
                  border-2 border-orange-400
                  bg-white/95
                  backdrop-blur-sm
                  flex justify-center
                  pt-2
                  shadow-2xl shadow-orange-200/80
                "
              >
                <motion.div
                  animate={{
                    y: [0, 16, 0],
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="
                    w-2.5 h-2.5
                    rounded-full
                    bg-orange-500
                  "
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* INTRO */}
      <section className="px-4 sm:px-6 lg:px-16 py-16 sm:py-20">
        <div className="max-w-5xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="
              text-3xl
              sm:text-4xl
              lg:text-5xl
              font-black
              tracking-[-0.03em]
              text-gray-900
            "
          >
            More Than Just Exam Preparation
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.1,
              duration: 0.8,
            }}
            viewport={{ once: true }}
            className="
              mt-6 sm:mt-8
              text-base sm:text-lg
              leading-7 sm:leading-8
              text-gray-600
            "
          >
            At MathsPro, we focus on growth — from mastering foundational
            concepts to solving complex mathematical problems. Using a
            structured and personalized plan, we help learners gain the skills,
            confidence and mindset needed to truly excel in maths.
          </motion.p>
        </div>
      </section>

      {/* STEPS */}
      <section className="px-4 sm:px-6 lg:px-16 py-8 sm:py-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{
                  y: -8,
                  scale: 1.02,
                }}
                className="
                  bg-white
                  rounded-[30px]
                  p-6 sm:p-8
                  border border-gray-100
                  shadow-sm
                  hover:shadow-2xl
                  hover:shadow-orange-100/60
                  transition-all
                  duration-300
                  relative
                  overflow-hidden
                "
              >
                <motion.div
                  whileHover={{
                    rotate: 8,
                    scale: 1.1,
                  }}
                  className="
                    w-14 h-14
                    rounded-2xl
                    bg-orange-100
                    text-orange-600
                    flex items-center justify-center
                    mb-6
                  "
                >
                  {step.icon}
                </motion.div>

                <div
                  className="
                    absolute
                    top-6
                    right-6
                    text-5xl
                    font-black
                    text-orange-50
                  "
                >
                  0{index + 1}
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {step.title}
                </h3>

                <p className="text-gray-600 leading-7 text-sm">{step.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* COMMUNITY */}
      <section className="px-4 sm:px-6 lg:px-16 py-20 sm:py-24">
        <div
          className="
            max-w-7xl
            mx-auto
            bg-linear-to-br
            from-orange-500
            to-orange-600
            rounded-[30px] sm:rounded-[40px]
            overflow-hidden
            relative
          "
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 text-white">
              <Sigma size={120} />
            </div>

            <div className="absolute bottom-10 right-10 text-white">
              <Sigma size={120} />
            </div>
          </div>

          <div
            className="
              relative
              grid
              lg:grid-cols-2
              gap-10 lg:gap-14
              p-6 sm:p-10 lg:p-16
              items-center
            "
          >
            {/* LEFT */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div
                className="
                  inline-flex items-center gap-2
                  bg-white/15
                  backdrop-blur-sm
                  text-white
                  px-4 py-2
                  rounded-full
                  text-sm
                  font-medium
                  mb-6
                "
              >
                <Brain size={16} />A Community of Maths Lovers
              </div>

              <h2
                className="
                  text-3xl
                  sm:text-4xl
                  lg:text-5xl
                  font-black
                  tracking-[-0.03em]
                  text-white
                  leading-tight
                "
              >
                Exploring The World Through Mathematical Eyes
              </h2>

              <p className="mt-6 sm:mt-8 text-orange-50 text-base sm:text-lg leading-7 sm:leading-8">
                MathsPro is more than tutoring — it’s a community where passion
                for maths is shared. We ask what, why and how as we explore
                mathematical concepts and solve real-world problems together.
              </p>
            </motion.div>

            {/* RIGHT */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="
                bg-white/10
                backdrop-blur-lg
                rounded-4xl
                p-5 sm:p-8
                border border-white/20
              "
            >
              <div className="grid gap-4">
                {values.map((value, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 25 }}
                    whileInView={{
                      opacity: 1,
                      x: 0,
                    }}
                    whileHover={{
                      x: 6,
                      scale: 1.02,
                    }}
                    transition={{ delay: index * 0.08 }}
                    viewport={{ once: true }}
                    className="
                      flex items-center gap-4
                      bg-white/10
                      rounded-2xl
                      px-5 py-4
                    "
                  >
                    <CheckCircle2 size={22} className="text-white shrink-0" />

                    <span className="text-white font-medium">{value}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-4 sm:px-6 lg:px-16 py-20 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2
            className="
              text-3xl
              sm:text-4xl
              lg:text-6xl
              font-black
              tracking-[-0.04em]
              text-gray-900
              leading-tight
            "
          >
            Welcome To The
            <span className="text-orange-500"> MathsPro Family.</span>
          </h2>

          <p
            className="
              mt-6 sm:mt-8
              text-base sm:text-lg
              leading-7 sm:leading-8
              text-gray-600
            "
          >
            When you join MathsPro, we help you identify where you are, what you
            need to work on, and together we create a plan that helps you become
            confident, skilled and successful in mathematics.
          </p>

          <Link
            to="/reach-out"
            className="
              mt-10
              px-8 py-4
              rounded-2xl
              bg-orange-500
              text-white
              font-semibold
              shadow-xl shadow-orange-500/20
              hover:bg-orange-600
              transition hover:scale-[1.04]
              active:scale-[0.98]
              inline-flex items-center gap-2
            "
          >
            Join MathsPro
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
