import { motion, AnimatePresence } from "framer-motion";

const BottomSheetModal = ({ isOpen, onClose, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ✨ BACKDROP */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* ✨ WRAPPER */}
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-3 sm:px-6 pointer-events-none">
            <motion.div
              className="
  pointer-events-auto
  w-full
  sm:w-auto
  sm:max-w-xl
  lg:max-w-2xl

  bg-white
  rounded-t-3xl sm:rounded-2xl

  shadow-[0_20px_60px_rgba(0,0,0,0.15)]
  ring-1 ring-black/5

  p-5 sm:p-6 lg:p-7
  max-h-[92vh] overflow-y-auto
"
              initial={{ y: "100%", opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: "100%", opacity: 0, scale: 0.96 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 24,
              }}
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={0.18}
              onDragEnd={(e, info) => {
                if (info.offset.y > 120 || info.velocity.y > 500) {
                  onClose();
                }
              }}
              style={{ touchAction: "none" }}
            >
              {/* ✨ DRAG HANDLE */}
              <div className="w-10 h-1.5 bg-gray-300/80 rounded-full mx-auto mb-4 sm:hidden" />

              {/* ✨ TOP DIVIDER (desktop subtle detail) */}
              <div className="hidden sm:block h-px w-full bg-gray-100 mb-5" />

              {children}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BottomSheetModal;
