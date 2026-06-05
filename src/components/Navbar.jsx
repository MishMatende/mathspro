import React, { useState } from "react";

import { useNavigate, useLocation } from "react-router-dom";

import { motion, AnimatePresence } from "framer-motion";

import { Menu, X, ArrowRight, Sparkles } from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();

  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);

  const handleNav = (path) => {
    navigate(path);

    setMenuOpen(false);
  };

  const navItems = [
    {
      label: "Home",
      path: "/",
    },

    {
      label: "How It Works",
      path: "/how-it-works",
    },

    {
      label: "Reach Out",
      path: "/reach-out",
    },
  ];

  return (
    <>
      <motion.nav
        initial={{
          y: -40,
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        transition={{
          duration: 0.5,
        }}
        className="
          sticky top-0 z-50
          w-full
          px-4 sm:px-6 lg:px-10
          pt-4
        "
      >
        <div
          className="
            max-w-7xl mx-auto
            bg-white/80
            backdrop-blur-xl
            border border-white/60
            shadow-lg shadow-orange-100/40
            rounded-2xl sm:rounded-full
            px-4 sm:px-6
            py-3
          "
        >
          <div className="flex items-center justify-between">
            {/* LOGO */}
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
                    text-gray-900
                  "
                >
                  Maths<span className="text-orange-500">Pro</span>
                </h1>

                <p className="text-[10px] text-gray-400 -mt-1 hidden sm:block">
                  Learn with confidence
                </p>
              </div>
            </motion.div>

            {/* DESKTOP NAV */}
            <div
              className="
                hidden lg:flex
                items-center gap-2
              "
            >
              {navItems.map((item) => {
                const active = location.pathname === item.path;

                return (
                  <motion.button
                    key={item.path}
                    whileHover={{
                      y: -2,
                    }}
                    whileTap={{
                      scale: 0.96,
                    }}
                    onClick={() => handleNav(item.path)}
                    className={`
                      relative
                      px-5 py-2.5
                      rounded-full
                      text-sm
                      font-medium
                      transition-all
                      duration-200
                      ${
                        active
                          ? "text-orange-600"
                          : "text-gray-600 hover:text-gray-900"
                      }
                    `}
                  >
                    {active && (
                      <motion.div
                        layoutId="navbar-pill"
                        transition={{
                          type: "spring",
                          stiffness: 350,
                          damping: 28,
                        }}
                        className="
                          absolute inset-0
                          bg-orange-100
                          rounded-full
                        "
                      />
                    )}

                    <span className="relative z-10">{item.label}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* ACTIONS */}
            <div className="flex items-center gap-3">
              {/* LOGIN */}
              <motion.button
                whileHover={{
                  scale: 1.03,
                }}
                whileTap={{
                  scale: 0.97,
                }}
                onClick={() => navigate("/login")}
                className="
                  hidden sm:flex
                  items-center gap-2
                  px-5 py-2.5
                  rounded-full
                  border border-gray-200
                  bg-white
                  text-sm font-medium
                  text-gray-700
                  hover:border-orange-200
                  hover:text-orange-500
                  hover:shadow-md
                  transition-all
                "
              >
                Login
              </motion.button>

              {/* MOBILE MENU BUTTON */}
              <motion.button
                whileTap={{
                  scale: 0.92,
                }}
                onClick={() => setMenuOpen(!menuOpen)}
                className="
                  lg:hidden
                  w-11 h-11
                  rounded-2xl
                  bg-orange-50
                  text-orange-600
                  flex items-center justify-center
                "
              >
                <AnimatePresence mode="wait">
                  {menuOpen ? (
                    <motion.div
                      key="close"
                      initial={{
                        rotate: -90,
                        opacity: 0,
                      }}
                      animate={{
                        rotate: 0,
                        opacity: 1,
                      }}
                      exit={{
                        rotate: 90,
                        opacity: 0,
                      }}
                      transition={{
                        duration: 0.2,
                      }}
                    >
                      <X size={20} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{
                        rotate: 90,
                        opacity: 0,
                      }}
                      animate={{
                        rotate: 0,
                        opacity: 1,
                      }}
                      exit={{
                        rotate: -90,
                        opacity: 0,
                      }}
                      transition={{
                        duration: 0.2,
                      }}
                    >
                      <Menu size={20} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>

          {/* MOBILE MENU */}
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{
                  opacity: 0,
                  height: 0,
                }}
                animate={{
                  opacity: 1,
                  height: "auto",
                }}
                exit={{
                  opacity: 0,
                  height: 0,
                }}
                transition={{
                  duration: 0.25,
                }}
                className="
                  lg:hidden
                  overflow-hidden
                "
              >
                <div
                  className="
                    pt-5 pb-2
                    flex flex-col gap-2
                  "
                >
                  {navItems.map((item, index) => {
                    const active = location.pathname === item.path;

                    return (
                      <motion.button
                        key={item.path}
                        initial={{
                          opacity: 0,
                          x: -20,
                        }}
                        animate={{
                          opacity: 1,
                          x: 0,
                        }}
                        transition={{
                          delay: index * 0.05,
                        }}
                        whileTap={{
                          scale: 0.98,
                        }}
                        onClick={() => handleNav(item.path)}
                        className={`
                          flex items-center justify-between
                          w-full
                          px-4 py-4
                          rounded-2xl
                          text-left
                          text-sm
                          font-medium
                          transition
                          ${
                            active
                              ? "bg-orange-100 text-orange-600"
                              : "bg-gray-50 text-gray-700"
                          }
                        `}
                      >
                        {item.label}

                        <ArrowRight size={16} />
                      </motion.button>
                    );
                  })}

                  {/* MOBILE LOGIN */}
                  <motion.button
                    initial={{
                      opacity: 0,
                      x: -20,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      delay: 0.2,
                    }}
                    whileTap={{
                      scale: 0.98,
                    }}
                    onClick={() => handleNav("/login")}
                    className="
                      mt-2
                      w-full
                      px-4 py-4
                      rounded-2xl
                      bg-orange-500
                      text-white
                      text-sm
                      font-semibold
                      flex items-center justify-between
                      shadow-lg shadow-orange-500/20
                    "
                  >
                    Login
                    <ArrowRight size={16} />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>
    </>
  );
}
