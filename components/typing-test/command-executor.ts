import type { TestConfig } from "@/hooks/useTypingTest";
import type { ActiveModal, ActiveView } from "./types";

const DEFAULT_QUOTE_TEXT =
  "Typing speed is not magic. It is rhythm, accuracy, and calm repetition.";
const DEFAULT_CUSTOM_TEXT =
  "custom typing mode lets you practice exactly the text you care about";

interface CommandContext {
  restart: () => void;
  setView: (view: ActiveView) => void;
  setModal: (modal: ActiveModal) => void;
  setConfig: (payload: Partial<TestConfig>) => void;
  setThemeById: (id: string) => void;
  punctuationEnabled: boolean;
  numbersEnabled: boolean;
}

const commandHandlers = {
  restart: (ctx: CommandContext) => {
    ctx.restart();
    ctx.setView("test");
  },
  "mode-time": (ctx: CommandContext) => {
    ctx.setConfig({ mode: "time" });
    ctx.setView("test");
  },
  "mode-words": (ctx: CommandContext) => {
    ctx.setConfig({ mode: "words" });
    ctx.setView("test");
  },
  "mode-quote": (ctx: CommandContext) => {
    ctx.setConfig({
      mode: "quote",
      quoteText: DEFAULT_QUOTE_TEXT,
    });
    ctx.setView("test");
  },
  "mode-zen": (ctx: CommandContext) => {
    ctx.setConfig({ mode: "zen" });
    ctx.setView("test");
  },
  "mode-custom": (ctx: CommandContext) => {
    ctx.setConfig({
      mode: "custom",
      customText: DEFAULT_CUSTOM_TEXT,
    });
    ctx.setView("test");
  },
  "toggle-punctuation": (ctx: CommandContext) => {
    ctx.setConfig({ punctuation: !ctx.punctuationEnabled });
  },
  "toggle-numbers": (ctx: CommandContext) => {
    ctx.setConfig({ numbers: !ctx.numbersEnabled });
  },
  "time-15": (ctx: CommandContext) => {
    ctx.setConfig({ mode: "time", timeDuration: 15 });
    ctx.setView("test");
  },
  "time-30": (ctx: CommandContext) => {
    ctx.setConfig({ mode: "time", timeDuration: 30 });
    ctx.setView("test");
  },
  "time-60": (ctx: CommandContext) => {
    ctx.setConfig({ mode: "time", timeDuration: 60 });
    ctx.setView("test");
  },
  "time-120": (ctx: CommandContext) => {
    ctx.setConfig({ mode: "time", timeDuration: 120 });
    ctx.setView("test");
  },
  "open-settings": (ctx: CommandContext) => {
    ctx.setView("settings");
  },
  "open-themes": (ctx: CommandContext) => {
    ctx.setView("themes");
  },
  "open-language": (ctx: CommandContext) => {
    ctx.setModal("language");
  },
  "open-leaderboard": (ctx: CommandContext) => {
    ctx.setView("leaderboard");
  },
  "open-profile": (ctx: CommandContext) => {
    ctx.setView("profile");
  },
  "open-about": (ctx: CommandContext) => {
    ctx.setView("about");
  },
  "toggle-dark": (ctx: CommandContext) => {
    ctx.setThemeById("jungle-core");
  },
  "toggle-light": (ctx: CommandContext) => {
    ctx.setThemeById("daybreak");
  },
} as const;

export type TypingCommandId = keyof typeof commandHandlers;

export function executeTypingCommand(command: TypingCommandId, context: CommandContext) {
  commandHandlers[command](context);
}
