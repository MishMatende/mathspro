import { motion, AnimatePresence } from "framer-motion";

export default function BottomSheetModal({
  isOpen,
  onClose,
  children,
  maxWidth = "max-w-2xl",
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* BACKDROP */}
          <motion.div
            className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* WRAPPER */}
          <div
            className="
              fixed inset-0 z-50
              flex items-end sm:items-center justify-center
              pointer-events-none
            "
          >
            <motion.div
              className={`
                pointer-events-auto
                relative
                md:w-[30vw]
                w-[96vw]
                ${maxWidth}
                rounded-t-4xl sm:rounded-4xl
                border border-white/60
                bg-white/95
                backdrop-blur-2xl
                shadow-[0_25px_80px_rgba(15,23,42,0.18)]
                max-h-[96vh]
                overflow-y-auto
                p-5 sm:p-7 lg:p-8
              `}
              initial={{ y: "100%", opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: "100%", opacity: 0, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={0.14}
              onDragEnd={(e, info) => {
                if (info.offset.y > 140 || info.velocity.y > 650) onClose();
              }}
              style={{ touchAction: "none" }}
            >
              {/* GLOW */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-linear-to-b from-indigo-100/60 to-transparent" />

              {/* MOBILE HANDLE */}
              <div className="relative z-10 mx-auto mb-5 h-1.5 w-12 rounded-full bg-slate-300/80 sm:hidden" />

              {/* DESKTOP TOP BAR */}
              <div className="relative z-10 mb-6 hidden h-px w-full bg-linear-to-r from-transparent via-slate-200 to-transparent sm:block" />

              {/* CONTENT */}
              <div className="relative z-10">{children}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
