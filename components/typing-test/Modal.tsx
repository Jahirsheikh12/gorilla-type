"use client";

import { useEffect, useCallback } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  wide?: boolean;
  children: React.ReactNode;
}

export function Modal({ open, onClose, title, wide, children }: ModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]">
      {/* Backdrop */}
      <div
        className="modal-overlay absolute inset-0 bg-[var(--color-gt-bg)]/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Content */}
      <div
        className={`modal-content gt-scroll relative max-h-[80vh] overflow-y-auto rounded-2xl border border-[var(--color-gt-untyped)]/10 bg-[var(--color-gt-sub)] shadow-2xl ${
          wide ? "w-full max-w-3xl" : "w-full max-w-lg"
        }`}
      >
        {/* Header */}
        {title && (
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--color-gt-untyped)]/10 bg-[var(--color-gt-sub)] px-6 py-4">
            <h2 className="text-base font-semibold text-[var(--color-gt-text)]">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-[var(--color-gt-untyped)] transition-colors hover:text-[var(--color-gt-text)]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
