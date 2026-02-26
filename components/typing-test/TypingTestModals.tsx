"use client";

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

      <Modal open={modal === "login"} onClose={onClose} title="Account">
        <LoginModal onClose={onClose} />
      </Modal>

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
