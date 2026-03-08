"use client";

import { useCallback, useEffect } from "react";
import { Modal } from "./Modal";
import { CommandLine } from "./CommandLine";
import { LoginModal } from "./LoginModal";
import { LanguageModal } from "./LanguageModal";
import { NotificationPanel } from "./NotificationPanel";
import type { ActiveModal } from "./types";
import type { TypingCommandId } from "./command-executor";

interface TypingTestModalsProps {
  modal: ActiveModal;
  onClose: () => void;
  onCommand: (command: TypingCommandId) => void;
  languageCode: string;
  onSelectLanguage: (code: string) => void;
}

function LoginModalWrapper({ open, onClose }: { open: boolean; onClose: () => void }) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="modal-overlay absolute inset-0 bg-[var(--color-gt-bg)]/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="modal-content relative">
        <LoginModal onClose={onClose} />
      </div>
    </div>
  );
}

export function TypingTestModals({
  modal,
  onClose,
  onCommand,
  languageCode,
  onSelectLanguage,
}: TypingTestModalsProps) {
  return (
    <>
      {modal === "command-line" && (
        <CommandLine open={true} onClose={onClose} onCommand={onCommand} />
      )}

      <LoginModalWrapper open={modal === "login"} onClose={onClose} />

      <Modal open={modal === "language"} onClose={onClose} title="Language">
        <LanguageModal
          onClose={onClose}
          selectedLanguageCode={languageCode}
          onSelect={onSelectLanguage}
        />
      </Modal>

      {modal === "notifications" && (
        <div className="fixed inset-0 z-40" onClick={onClose} />
      )}
      {modal === "notifications" && (
        <div className="fixed top-16 right-8 z-50 md:left-64">
          <NotificationPanel onClose={onClose} />
        </div>
      )}
    </>
  );
}
