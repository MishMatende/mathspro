// src/components/Footer.jsx
import { Link } from "react-router-dom";
import { SiFacebook, SiInstagram, SiX } from "@icons-pack/react-simple-icons";
import { Mail, Phone, MapPin, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="bg-[#0B1736] text-white mt-24">
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <motion.div
              whileHover={{
                scale: 1.04,
              }}
              whileTap={{
                scale: 0.97,
              }}
              onClick={() => handleNav("/")}
              className="
                flex items-center gap-2
                cursor-pointer
                select-none
              "
            >
              <div
                className="
                  w-10 h-10
                  rounded-2xl
                  bg-linear-to-br
                  from-orange-500
                  to-orange-600
                  flex items-center justify-center
                  shadow-lg shadow-orange-500/20
                "
              >
                <Sparkles size={18} className="text-white" />
              </div>

              <div>
                <h1
                  className="
                    text-lg sm:text-xl
                    font-black
                    tracking-[-0.03em]
                    text-white-900
                  "
                >
                  Maths<span className="text-orange-500">Pro</span>
                </h1>

                <p className="text-[10px] text-gray-400 -mt-1 hidden sm:block">
                  Learn with confidence
                </p>
              </div>
            </motion.div>

            <p className="text-gray-300 leading-relaxed text-sm">
              Personalized math learning built around every learner’s pace,
              strengths, and growth areas.
            </p>

            {/* <div className="flex items-center gap-4 mt-6">
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-orange-500 transition"
              >
                <SiFacebook size={16} />
              </a>

              <a
                href="#"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-orange-500 transition"
              >
                <SiInstagram size={16} />
              </a>

              <a
                href="#"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-orange-500 transition"
              >
                <SiX size={16} />
              </a>
            </div> */}
          </div>

          {/* Navigation */}
          <div className="flex justify-between md:justify-around ">
            <div>
              <h3 className="text-lg font-semibold mb-5">Quick Links</h3>

              <div className="flex flex-col gap-3 text-gray-300 text-sm">
                <Link
                  to="/"
                  className="hover:text-orange-400 transition-colors"
                >
                  Home
                </Link>

                {/* <Link
                  to="/diagnostic-test"
                  className="hover:text-orange-400 transition-colors"
                >
                  Diagnostic Test
                </Link> */}

                <Link
                  to="/how-it-works"
                  className="hover:text-orange-400 transition-colors"
                >
                  How It Works
                </Link>

                <Link
                  to="/reach-out"
                  className="hover:text-orange-400 transition-colors"
                >
                  Contact
                </Link>
              </div>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-lg font-semibold mb-5">Support</h3>

              <div className="flex flex-col gap-3 text-gray-300 text-sm">
                <Link
                  to="/login"
                  className="hover:text-orange-400 transition-colors"
                >
                  Student Login
                </Link>

                <Link
                  to="/privacy-policy"
                  className="hover:text-orange-400 transition-colors"
                >
                  Privacy Policy
                </Link>

                <Link
                  to="/terms"
                  className="hover:text-orange-400 transition-colors"
                >
                  Terms & Conditions
                </Link>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="md:ml-10">
            <h3 className="text-lg font-semibold mb-5">Contact</h3>

            <div className="flex flex-col gap-4 text-sm text-gray-300">
              <div className="flex items-start gap-3">
                <Mail size={18} className="text-orange-400 mt-0.5" />
                <span>support@mathspro.com</span>
              </div>

              <div className="flex items-start gap-3">
                <Phone size={18} className="text-orange-400 mt-0.5" />
                <span>+254 706 260 059</span>
              </div>

              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-orange-400 mt-0.5" />
                <span>Nairobi, Kenya</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} MathsPro. All rights reserved.
          </p>

          <div className="flex items-center gap-6 text-sm text-gray-400">
            <Link
              to="/privacy-policy"
              className="hover:text-orange-400 transition-colors"
            >
              Privacy
            </Link>

            <Link
              to="/terms"
              className="hover:text-orange-400 transition-colors"
            >
              Terms
            </Link>

            <Link
              to="/admin-login"
              className="hover:text-orange-400 transition-colors"
            >
              Admin Center
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
