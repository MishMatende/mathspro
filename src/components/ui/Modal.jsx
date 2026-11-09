// src/components/ui/Modal.jsx
//
// Shared modal shell used across the app.
// - Phones: full-width bottom sheet (rounded top, safe-area aware).
// - sm and up: centred card with a size-based max width.
// - Header/footer stay put, body scrolls.
// - Escape closes, page scroll is locked while open, renders in a portal.

import { useEffect, useId } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

const SIZES = {
  sm: "sm:max-w-md", // confirmations
  md: "sm:max-w-lg", // short forms
  lg: "sm:max-w-2xl", // pickers, medium forms
  xl: "sm:max-w-4xl", // long forms
  "2xl": "sm:max-w-6xl", // workspaces (checklist builder, review)
};

// Stack of open modals so Escape only closes the top one.
const stack = [];

export default function Modal({
  onClose,
  size = "md",
  labelledBy,
  className = "",
  children,
}) {
  const token = useId();

  useEffect(() => {
    stack.push(token);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      stack.splice(stack.indexOf(token), 1);
      if (stack.length === 0) document.body.style.overflow = previousOverflow;
    };
  }, [token]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape" && stack[stack.length - 1] === token) {
        onClose?.();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, token]);

  return createPortal(
    <div
      onClick={(e) => {
        // Stop the click reaching parent modals through the React tree.
        e.stopPropagation();
        onClose?.();
      }}
      className="fixed inset-0 z-100 flex items-end justify-center bg-slate-950/45 backdrop-blur-sm sm:items-center sm:p-6"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        onClick={(e) => e.stopPropagation()}
        className={`flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-[0_30px_100px_rgba(15,23,42,0.28)] sm:max-h-[88dvh] sm:rounded-3xl ${SIZES[size] || SIZES.md} ${className}`}
      >
        {/* Mobile grab handle */}
        <div className="mx-auto mt-2.5 h-1.5 w-10 shrink-0 rounded-full bg-slate-200 sm:hidden" />
        {children}
      </div>
    </div>,
    document.body,
  );
}

export function ModalHeader({
  title,
  subtitle,
  eyebrow,
  icon,
  onClose,
  id,
  actions,
}) {
  const fallbackId = useId();
  return (
    <header className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 px-5 pb-4 pt-3 sm:px-7 sm:pt-6">
      <div className="flex min-w-0 items-start gap-3">
        {icon}
        <div className="min-w-0">
          {eyebrow && (
            <div className="mb-1.5 flex items-center gap-1.5 truncate text-xs font-semibold uppercase tracking-wider text-orange-600">
              {eyebrow}
            </div>
          )}
          <h2
            id={id || fallbackId}
            className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl"
          >
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {actions}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </header>
  );
}

export function ModalBody({ className = "", children }) {
  return (
    <div
      className={`min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7 ${className}`}
    >
      {children}
    </div>
  );
}

export function ModalFooter({ className = "", children }) {
  return (
    <footer
      className={`flex shrink-0 flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/70 px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row sm:items-center sm:justify-end sm:gap-3 sm:px-7 ${className}`}
    >
      {children}
    </footer>
  );
}

// Shared form/button styles so every modal looks the same.
export const fieldLabel = "mb-1.5 block text-sm font-medium text-slate-700";
export const fieldInput =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 sm:text-sm";
export const btnSecondary =
  "inline-flex w-full cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto";
export const btnPrimary =
  "inline-flex w-full cursor-pointer items-center justify-center rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto";
export const btnDanger =
  "inline-flex w-full cursor-pointer items-center justify-center rounded-xl bg-red-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto";
