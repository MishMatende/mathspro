import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { X } from "lucide-react";

// Phones: full-width bottom sheet, drag the handle down to dismiss.
// sm and up: centred card. `maxWidth` is a Tailwind max-w-* class applied from sm up.
const WIDTHS = {
  "max-w-md": "sm:max-w-md",
  "max-w-lg": "sm:max-w-lg",
  "max-w-xl": "sm:max-w-xl",
  "max-w-2xl": "sm:max-w-2xl",
  "max-w-3xl": "sm:max-w-3xl",
  "max-w-4xl": "sm:max-w-4xl",
};

export default function BottomSheetModal({
  isOpen,
  onClose,
  children,
  maxWidth = "max-w-2xl",
}) {
  const dragControls = useDragControls();

  useEffect(() => {
    if (!isOpen) return undefined;

    function onKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* BACKDROP */}
          <motion.div
            className="fixed inset-0 z-90 bg-slate-900/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* WRAPPER */}
          <div className="pointer-events-none fixed inset-0 z-90 flex items-end justify-center sm:items-center sm:p-6">
            <motion.div
              role="dialog"
              aria-modal="true"
              className={`
                pointer-events-auto relative flex w-full flex-col
                ${WIDTHS[maxWidth] || "sm:max-w-2xl"}
                max-h-[92dvh] sm:max-h-[88dvh]
                overflow-hidden rounded-t-3xl sm:rounded-3xl
                border border-white/60 bg-white
                shadow-[0_25px_80px_rgba(15,23,42,0.18)]
              `}
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              drag="y"
              dragListener={false}
              dragControls={dragControls}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.6 }}
              onDragEnd={(e, info) => {
                if (info.offset.y > 120 || info.velocity.y > 600) onClose();
              }}
            >
              {/* GLOW */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-linear-to-b from-indigo-100/60 to-transparent" />

              {/* MOBILE HANDLE (drag to dismiss) */}
              <div
                onPointerDown={(e) => dragControls.start(e)}
                className="relative z-10 flex shrink-0 cursor-grab touch-none justify-center pb-2 pt-3 active:cursor-grabbing sm:hidden"
              >
                <div className="h-1.5 w-12 rounded-full bg-slate-300/80" />
              </div>

              {/* CLOSE */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="absolute right-4 top-4 z-20 hidden h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white/80 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 sm:flex"
              >
                <X size={18} />
              </button>

              {/* CONTENT */}
              <div className="relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:p-7 lg:p-8">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
