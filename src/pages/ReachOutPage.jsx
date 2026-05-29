// src/pages/public/ReachOutPage.jsx

import { motion } from "framer-motion";
import {
  MessageCircle,
  Send,
  Phone,
  Mail,
  User,
  Sparkles,
  ArrowRight,
  Sigma,
} from "lucide-react";

import { useState } from "react";
import toast from "react-hot-toast";

import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

export default function ReachOutPage() {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,

      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      toast.success("Message sent successfully ✨");

      setFormData({
        name: "",
        email: "",
        whatsapp: "",
        message: "",
      });
    } catch (error) {
      toast.error(error.message || "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] overflow-hidden">
      <Navbar />

      {/* HERO */}
      <section className="relative px-5 sm:px-6 lg:px-16 pt-14 sm:pt-20 lg:pt-24 pb-20 lg:pb-24 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,100,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,100,0,0.03)_1px,transparent_1px)] bg-size-[40px_40px]" />

          <motion.div
            animate={{
              rotate: [0, 8, 0],
              y: [0, -12, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-24 left-4 sm:left-10 text-orange-100"
          >
            <Sigma size={100} strokeWidth={1} />
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
            className="absolute bottom-20 right-4 sm:right-10 text-orange-100"
          >
            <Sigma size={90} strokeWidth={1} />
          </motion.div>

          <div className="absolute top-24 left-10 w-72 h-72 bg-orange-100 rounded-full blur-3xl opacity-40" />

          <div className="absolute bottom-20 right-10 w-80 h-80 bg-orange-200 rounded-full blur-3xl opacity-30" />
        </div>

        <div
          className="
            relative
            max-w-7xl
            mx-auto
            grid
            lg:grid-cols-2
            gap-10 lg:gap-16
            items-center
            min-h-[85vh]
          "
        >
          {/* LEFT */}
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10"
          >
            {/* Badge */}
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
              Reach Out To MathsPro
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="
                text-4xl
                sm:text-5xl
                lg:text-7xl
                font-black
                leading-[1.02]
                tracking-[-0.04em]
                text-gray-900
              "
            >
              Let’s Talk
              <span className="text-orange-500"> Maths.</span>
            </motion.h1>

            {/* Text */}
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
              "
            >
              Fill out the form and we will respond within the shortest time
              possible. Whether you need tutoring, guidance or simply want to
              learn more about MathsPro — we’d love to hear from you.
            </motion.p>

            {/* CONTACT CARDS */}
            <div className="mt-8 sm:mt-10 grid gap-4">
              {/* WhatsApp */}
              <motion.a
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                whileHover={{
                  y: -6,
                  scale: 1.01,
                }}
                href="https://wa.me/254706260059"
                target="_blank"
                rel="noreferrer"
                className="
                  group
                  bg-white/90
                  backdrop-blur-sm
                  border border-gray-100
                  rounded-[28px]
                  p-5
                  flex items-center gap-4
                  shadow-lg shadow-orange-100/30
                  hover:border-green-200
                  hover:shadow-xl
                  transition-all
                "
              >
                <motion.div
                  whileHover={{
                    rotate: 10,
                    scale: 1.08,
                  }}
                  className="
                    w-14 h-14
                    rounded-2xl
                    bg-green-100
                    text-green-600
                    flex items-center justify-center
                    shrink-0
                  "
                >
                  <MessageCircle size={24} />
                </motion.div>

                <div>
                  <p className="font-semibold text-gray-900">WhatsApp</p>

                  <p className="text-sm text-gray-500 mt-1">+254706260059</p>
                </div>

                <ArrowRight
                  size={18}
                  className="
                    ml-auto
                    text-gray-400
                    group-hover:translate-x-1
                    transition
                  "
                />
              </motion.a>

              {/* Email */}
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                whileHover={{
                  y: -6,
                  scale: 1.01,
                }}
                className="
                  bg-white/90
                  backdrop-blur-sm
                  border border-gray-100
                  rounded-[28px]
                  p-5
                  flex items-center gap-4
                  shadow-lg shadow-orange-100/30
                  hover:border-orange-200
                  hover:shadow-xl
                  transition-all
                "
              >
                <motion.div
                  whileHover={{
                    rotate: -10,
                    scale: 1.08,
                  }}
                  className="
                    w-14 h-14
                    rounded-2xl
                    bg-orange-100
                    text-orange-600
                    flex items-center justify-center
                    shrink-0
                  "
                >
                  <Mail size={24} />
                </motion.div>

                <div>
                  <p className="font-semibold text-gray-900">Quick Responses</p>

                  <p className="text-sm text-gray-500 mt-1">
                    We usually reply within a few hours
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* RIGHT */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <motion.div
              animate={{
                y: [0, -8, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="
                bg-white/95
                backdrop-blur-xl
                border border-orange-100
                rounded-[30px] sm:rounded-[36px]
                shadow-2xl shadow-orange-100/40
                p-5 sm:p-8 lg:p-10
                relative
                overflow-hidden
              "
            >
              {/* Glow */}
              <div className="absolute top-0 right-0 w-52 h-52 bg-orange-100 rounded-full blur-3xl opacity-40" />

              {/* FORM */}
              <form onSubmit={handleSubmit} className="relative z-10 space-y-5">
                {/* NAME */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Name
                  </label>

                  <div className="relative group">
                    <User
                      size={18}
                      className="
                        absolute
                        left-4
                        top-1/2
                        -translate-y-1/2
                        text-gray-400
                        group-focus-within:text-orange-500
                        transition
                      "
                    />

                    <input
                      type="text"
                      name="name"
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="
                        w-full
                        h-14
                        rounded-2xl
                        border border-gray-200
                        bg-gray-50/80
                        pl-12 pr-4
                        text-sm
                        outline-none
                        focus:border-orange-400
                        focus:ring-4
                        focus:ring-orange-100
                        focus:bg-white
                        transition-all
                      "
                    />
                  </div>
                </motion.div>

                {/* EMAIL */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Email
                  </label>

                  <div className="relative group">
                    <Mail
                      size={18}
                      className="
                        absolute
                        left-4
                        top-1/2
                        -translate-y-1/2
                        text-gray-400
                        group-focus-within:text-orange-500
                        transition
                      "
                    />

                    <input
                      type="email"
                      name="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="
                        w-full
                        h-14
                        rounded-2xl
                        border border-gray-200
                        bg-gray-50/80
                        pl-12 pr-4
                        text-sm
                        outline-none
                        focus:border-orange-400
                        focus:ring-4
                        focus:ring-orange-100
                        focus:bg-white
                        transition-all
                      "
                    />
                  </div>
                </motion.div>

                {/* WHATSAPP */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    WhatsApp Number
                  </label>

                  <div className="relative group">
                    <Phone
                      size={18}
                      className="
                        absolute
                        left-4
                        top-1/2
                        -translate-y-1/2
                        text-gray-400
                        group-focus-within:text-orange-500
                        transition
                      "
                    />

                    <input
                      type="tel"
                      name="whatsapp"
                      placeholder="+254..."
                      value={formData.whatsapp}
                      onChange={handleChange}
                      required
                      className="
                        w-full
                        h-14
                        rounded-2xl
                        border border-gray-200
                        bg-gray-50/80
                        pl-12 pr-4
                        text-sm
                        outline-none
                        focus:border-orange-400
                        focus:ring-4
                        focus:ring-orange-100
                        focus:bg-white
                        transition-all
                      "
                    />
                  </div>
                </motion.div>

                {/* MESSAGE */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Thanks for reaching out, how can we help you?
                  </label>

                  <textarea
                    name="message"
                    placeholder="Tell us more about what you need help with..."
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    required
                    className="
                      w-full
                      rounded-3xl
                      border border-gray-200
                      bg-gray-50/80
                      px-5 py-4
                      text-sm
                      outline-none
                      resize-none
                      focus:border-orange-400
                      focus:ring-4
                      focus:ring-orange-100
                      focus:bg-white
                      transition-all
                    "
                  />
                </motion.div>

                {/* BUTTON */}
                <motion.button
                  whileHover={{
                    scale: 1.01,
                  }}
                  whileTap={{
                    scale: 0.98,
                  }}
                  type="submit"
                  disabled={loading}
                  className="
                    w-full
                    h-14
                    rounded-2xl
                    bg-orange-500
                    hover:bg-orange-600
                    text-white
                    font-semibold
                    transition-all
                    flex items-center justify-center gap-2
                    shadow-xl shadow-orange-500/25
                  "
                >
                  {loading ? (
                    "Sending..."
                  ) : (
                    <>
                      Send Message
                      <Send size={18} />
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 sm:px-6 lg:px-16 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="
            max-w-6xl
            mx-auto
            bg-linear-to-br
            from-orange-500
            to-orange-600
            rounded-[30px] sm:rounded-[40px]
            px-6 py-12
            sm:px-10 sm:py-16
            lg:px-16
            text-center
            relative
            overflow-hidden
          "
        >
          {/* Background */}
          <div className="absolute inset-0 opacity-10">
            <motion.div
              animate={{
                rotate: [0, 10, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
              }}
              className="absolute top-10 left-10 text-white"
            >
              <Sigma size={100} />
            </motion.div>

            <motion.div
              animate={{
                rotate: [0, -10, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
              }}
              className="absolute bottom-10 right-10 text-white"
            >
              <Sigma size={100} />
            </motion.div>
          </div>

          <div className="relative z-10">
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
                text-white
                leading-tight
              "
            >
              Ready To Start Your Maths Journey?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
              className="
                mt-6
                text-base sm:text-lg
                text-orange-50
                max-w-2xl
                mx-auto
                leading-7 sm:leading-8
              "
            >
              Join the MathsPro family and build confidence, skill and mastery
              in mathematics one step at a time.
            </motion.p>

            <motion.a
              whileHover={{
                scale: 1.03,
              }}
              whileTap={{
                scale: 0.98,
              }}
              href="https://wa.me/254706260059"
              target="_blank"
              rel="noreferrer"
              className="
                mt-10
                inline-flex
                items-center
                gap-2
                px-7 py-4
                rounded-2xl
                bg-white
                text-orange-600
                font-semibold
                shadow-xl
                hover:bg-orange-50
                transition-all
              "
            >
              Chat on WhatsApp
              <MessageCircle size={18} />
            </motion.a>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
