"use client";

import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface KeyboardKeyDef {
  id: string;
  label: string;
  shiftLabel?: string;
  codes: string[];
  flex?: number;
  align?: "center" | "start" | "end";
}

interface TypingKeyboardProps {
  pressedCodes: ReadonlySet<string>;
  capsLockOn: boolean;
}

const KEYBOARD_ROWS: KeyboardKeyDef[][] = [
  [
    { id: "escape", label: "esc", codes: ["Escape"], flex: 1.1 },
    { id: "backquote", label: "`", shiftLabel: "~", codes: ["Backquote"] },
    { id: "digit1", label: "1", shiftLabel: "!", codes: ["Digit1"] },
    { id: "digit2", label: "2", shiftLabel: "@", codes: ["Digit2"] },
    { id: "digit3", label: "3", shiftLabel: "#", codes: ["Digit3"] },
    { id: "digit4", label: "4", shiftLabel: "$", codes: ["Digit4"] },
    { id: "digit5", label: "5", shiftLabel: "%", codes: ["Digit5"] },
    { id: "digit6", label: "6", shiftLabel: "^", codes: ["Digit6"] },
    { id: "digit7", label: "7", shiftLabel: "&", codes: ["Digit7"] },
    { id: "digit8", label: "8", shiftLabel: "*", codes: ["Digit8"] },
    { id: "digit9", label: "9", shiftLabel: "(", codes: ["Digit9"] },
    { id: "digit0", label: "0", shiftLabel: ")", codes: ["Digit0"] },
    { id: "minus", label: "-", shiftLabel: "_", codes: ["Minus"] },
    { id: "equal", label: "=", shiftLabel: "+", codes: ["Equal"] },
    {
      id: "backspace",
      label: "bksp",
      codes: ["Backspace"],
      flex: 2.3,
      align: "end",
    },
  ],
  [
    { id: "tab", label: "tab", codes: ["Tab"], flex: 1.7, align: "start" },
    { id: "keyq", label: "q", codes: ["KeyQ"] },
    { id: "keyw", label: "w", codes: ["KeyW"] },
    { id: "keye", label: "e", codes: ["KeyE"] },
    { id: "keyr", label: "r", codes: ["KeyR"] },
    { id: "keyt", label: "t", codes: ["KeyT"] },
    { id: "keyy", label: "y", codes: ["KeyY"] },
    { id: "keyu", label: "u", codes: ["KeyU"] },
    { id: "keyi", label: "i", codes: ["KeyI"] },
    { id: "keyo", label: "o", codes: ["KeyO"] },
    { id: "keyp", label: "p", codes: ["KeyP"] },
    { id: "bracketleft", label: "[", shiftLabel: "{", codes: ["BracketLeft"] },
    {
      id: "bracketright",
      label: "]",
      shiftLabel: "}",
      codes: ["BracketRight"],
    },
    {
      id: "backslash",
      label: "\\",
      shiftLabel: "|",
      codes: ["Backslash"],
      flex: 1.7,
      align: "end",
    },
  ],
  [
    {
      id: "capslock",
      label: "caps",
      codes: ["CapsLock"],
      flex: 2.1,
      align: "start",
    },
    { id: "keya", label: "a", codes: ["KeyA"] },
    { id: "keys", label: "s", codes: ["KeyS"] },
    { id: "keyd", label: "d", codes: ["KeyD"] },
    { id: "keyf", label: "f", codes: ["KeyF"] },
    { id: "keyg", label: "g", codes: ["KeyG"] },
    { id: "keyh", label: "h", codes: ["KeyH"] },
    { id: "keyj", label: "j", codes: ["KeyJ"] },
    { id: "keyk", label: "k", codes: ["KeyK"] },
    { id: "keyl", label: "l", codes: ["KeyL"] },
    { id: "semicolon", label: ";", shiftLabel: ":", codes: ["Semicolon"] },
    { id: "quote", label: "'", shiftLabel: '"', codes: ["Quote"] },
    { id: "enter", label: "enter", codes: ["Enter"], flex: 2.3, align: "end" },
  ],
  [
    {
      id: "shiftleft",
      label: "shift",
      codes: ["ShiftLeft"],
      flex: 2.65,
      align: "start",
    },
    { id: "keyz", label: "z", codes: ["KeyZ"] },
    { id: "keyx", label: "x", codes: ["KeyX"] },
    { id: "keyc", label: "c", codes: ["KeyC"] },
    { id: "keyv", label: "v", codes: ["KeyV"] },
    { id: "keyb", label: "b", codes: ["KeyB"] },
    { id: "keyn", label: "n", codes: ["KeyN"] },
    { id: "keym", label: "m", codes: ["KeyM"] },
    { id: "comma", label: ",", shiftLabel: "<", codes: ["Comma"] },
    { id: "period", label: ".", shiftLabel: ">", codes: ["Period"] },
    { id: "slash", label: "/", shiftLabel: "?", codes: ["Slash"] },
    {
      id: "shiftright",
      label: "shift",
      codes: ["ShiftRight"],
      flex: 2.95,
      align: "end",
    },
  ],
  [
    {
      id: "controlleft",
      label: "ctrl",
      codes: ["ControlLeft"],
      flex: 1.4,
      align: "start",
    },
    { id: "metaleft", label: "meta", codes: ["MetaLeft"], flex: 1.45 },
    { id: "altleft", label: "alt", codes: ["AltLeft"], flex: 1.25 },
    { id: "space", label: "space", codes: ["Space"], flex: 6.4 },
    { id: "altright", label: "alt", codes: ["AltRight"], flex: 1.25 },
    { id: "metaright", label: "meta", codes: ["MetaRight"], flex: 1.45 },
    {
      id: "controlright",
      label: "ctrl",
      codes: ["ControlRight"],
      flex: 1.4,
      align: "end",
    },
  ],
];

const ACCENT_KEYS = new Set(["escape", "enter", "backspace"]);

function getKeyStyle(
  active: boolean,
  latched: boolean,
  isAccentKey: boolean = false,
): CSSProperties {
  if (active) {
    const accentColor = isAccentKey
      ? "var(--color-gt-accent2)"
      : "var(--color-gt-accent)";
    return {
      background: `linear-gradient(180deg, color-mix(in srgb, ${accentColor} 32%, rgba(255,255,255,0.15) 68%), color-mix(in srgb, ${accentColor} 16%, var(--color-gt-sub) 84%))`,
      borderColor: `color-mix(in srgb, ${accentColor} 60%, transparent)`,
      boxShadow: `0 0 0 1px color-mix(in srgb, ${accentColor} 45%, transparent), inset 0 2px 8px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.2), 0 8px 32px -6px color-mix(in srgb, ${accentColor} 80%, transparent)`,
      color: "#ffffff",
      textShadow: `0 0 16px color-mix(in srgb, ${accentColor} 90%, transparent)`,
      transform: "translateY(5px)",
    };
  }

  if (latched) {
    return {
      background:
        "linear-gradient(180deg, color-mix(in srgb, var(--color-gt-accent2) 24%, rgba(255,255,255,0.08) 76%), color-mix(in srgb, var(--color-gt-sub) 86%, black 14%))",
      borderColor:
        "color-mix(in srgb, var(--color-gt-accent2) 45%, transparent)",
      boxShadow:
        "0 4px 0 rgba(0,0,0,0.9), 0 5px 14px rgba(0,0,0,0.8), 0 0 0 1px color-mix(in srgb, var(--color-gt-accent2) 25%, transparent), inset 0 1px 0 color-mix(in srgb, white 25%, transparent)",
      color: "var(--color-gt-text)",
      textShadow:
        "0 0 12px color-mix(in srgb, var(--color-gt-accent2) 60%, transparent)",
      transform: "translateY(1px)",
    };
  }

  return {
    background:
      "linear-gradient(180deg, color-mix(in srgb, var(--color-gt-sub) 92%, rgba(255,255,255,0.04) 8%), color-mix(in srgb, var(--color-gt-bg) 70%, black 30%))",
    borderColor: "color-mix(in srgb, var(--color-gt-untyped) 25%, transparent)",
    boxShadow:
      "0 5px 0 rgba(0,0,0,0.95), 0 6px 14px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.08)",
    color: "color-mix(in srgb, var(--color-gt-text) 85%, transparent)",
    transform: "translateY(0)",
  };
}

export function TypingKeyboard({
  pressedCodes,
  capsLockOn,
}: TypingKeyboardProps) {
  return (
    <section className="mt-8 mb-12 relative [perspective:1200px] w-full max-w-[900px] mx-auto hidden sm:block">
      <div className="absolute inset-0 -z-10 rounded-[40px] bg-[var(--color-gt-accent)]/5 blur-[80px]" />

      <div className="relative rounded-[24px] border-b-[3px] border-r border-t border-[var(--color-gt-untyped)]/30 bg-[linear-gradient(165deg,color-mix(in_srgb,var(--color-gt-sub)_88%,white_12%),color-mix(in_srgb,var(--color-gt-bg)_75%,black_25%))] p-2 sm:p-3 md:p-4 shadow-[0_45px_100px_-30px_rgba(0,0,0,1),inset_0_4px_16px_rgba(0,0,0,0.9)] w-full">
        <div className="relative rounded-[16px] md:rounded-[20px] border border-black/50 bg-[linear-gradient(180deg,rgba(0,0,0,0.45),rgba(0,0,0,0.15))] p-2 sm:p-3 md:p-4 shadow-[inset_0_0_24px_rgba(0,0,0,0.95)]">
          <div className="w-full space-y-1.5 md:space-y-2">
            {KEYBOARD_ROWS.map((row) => (
              <div
                key={row[0]?.id}
                className="flex gap-1 md:gap-1.5 lg:gap-2 w-full"
              >
                {row.map((keyDef) => {
                  const isPressed = keyDef.codes.some((code) =>
                    pressedCodes.has(code),
                  );
                  const isLatched = keyDef.id === "capslock" && capsLockOn;
                  const isDualLegend = Boolean(keyDef.shiftLabel);
                  const isWideKey = (keyDef.flex ?? 1) > 1.45;
                  const isLongLabel = keyDef.label.length > 5;
                  const isHomingKey =
                    keyDef.id === "keyf" || keyDef.id === "keyj";
                  const isAccentKey = ACCENT_KEYS.has(keyDef.id);

                  return (
                    <div
                      key={keyDef.id}
                      className={cn(
                        "relative flex min-w-0 flex-1 select-none rounded-[6px] md:rounded-[8px] lg:rounded-[10px] border px-1 md:px-2 py-1 md:py-2 transition-[transform,box-shadow,border-color,background-color,color,text-shadow] duration-[40ms] ease-out mb-1",
                        isDualLegend
                          ? "h-[36px] md:h-[44px] lg:h-[52px] items-start justify-start"
                          : "h-[34px] md:h-[40px] lg:h-[48px] items-center",
                        keyDef.align === "start" && "justify-start",
                        keyDef.align === "center" && "justify-center",
                        keyDef.align === "end" && "justify-end",
                      )}
                      style={{
                        ...getKeyStyle(isPressed, isLatched, isAccentKey),
                        flexGrow: keyDef.flex ?? 1,
                        flexBasis: 0,
                      }}
                    >
                      <span className="pointer-events-none absolute inset-x-[15%] top-[1px] h-[0.5px] md:h-px rounded-full bg-white/10" />

                      {keyDef.shiftLabel ? (
                        <div className="flex w-full flex-col items-start leading-none opacity-[0.85]">
                          <span className="text-[7px] md:text-[8px] lg:text-[10px] font-semibold uppercase tracking-[0.05em] md:tracking-widest text-current/60">
                            {keyDef.shiftLabel}
                          </span>
                          <span className="mt-auto text-[9px] md:text-[11px] lg:text-[13px] font-bold uppercase tracking-[0.05em] md:tracking-widest text-current">
                            {keyDef.label}
                          </span>
                        </div>
                      ) : (
                        <div
                          className={cn(
                            "w-full font-bold uppercase text-current opacity-[0.85]",
                            isLongLabel
                              ? "text-[7px] md:text-[9px] lg:text-[11px] tracking-[0.05em] md:tracking-widest"
                              : "text-[9px] md:text-[11px] lg:text-[13px] tracking-[0.1em] md:tracking-[0.15em]",
                            keyDef.align === "start" &&
                              "text-left pl-0.5 md:pl-1",
                            keyDef.align === "center" && "text-center",
                            keyDef.align === "end" &&
                              "text-right pr-0.5 md:pr-1",
                            !isWideKey &&
                              keyDef.align !== "start" &&
                              keyDef.align !== "end" &&
                              "text-center",
                          )}
                        >
                          {keyDef.label}
                        </div>
                      )}

                      {isHomingKey && (
                        <div
                          className={cn(
                            "absolute bottom-1 md:bottom-1.5 lg:bottom-2 left-1/2 h-[2px] md:h-[3px] w-[8px] md:w-[12px] lg:w-[14px] -translate-x-1/2 rounded-full shadow-[0_1px_1px_rgba(255,255,255,0.15)]",
                            isPressed ? "bg-white/40" : "bg-black/50",
                          )}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
