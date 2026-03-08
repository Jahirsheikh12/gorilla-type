"use client";

import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Key definitions                                                    */
/* ------------------------------------------------------------------ */

interface KeyboardKeyDef {
  id: string;
  label: string;
  shiftLabel?: string;
  codes: string[];
  flex?: number;
  align?: "center" | "start" | "end";
  /** Row-unit height for tall keys (default 1) */
  h?: number;
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
      label: "backspace",
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
      label: "caps lock",
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
    { id: "space", label: "", codes: ["Space"], flex: 6.4 },
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

/* ------------------------------------------------------------------ */
/*  Mechanical key-cap style generator                                 */
/* ------------------------------------------------------------------ */

function getKeyStyle(
  active: boolean,
  latched: boolean,
  isAccentKey: boolean = false,
): CSSProperties {
  /* ---- Pressed / bottomed-out ---- */
  if (active) {
    const accent = isAccentKey
      ? "var(--color-gt-accent2)"
      : "var(--color-gt-accent)";
    return {
      /* Key pushed down: surface descends, shadow collapses */
      background: `
        linear-gradient(
          180deg,
          color-mix(in srgb, ${accent} 40%, rgba(255,255,255,0.10)) 0%,
          color-mix(in srgb, ${accent} 20%, var(--color-gt-sub)) 100%
        )`,
      borderColor: `color-mix(in srgb, ${accent} 55%, transparent)`,
      boxShadow: `
        0 1px 0 0 rgba(0,0,0,0.95),
        inset 0 2px 6px rgba(0,0,0,0.6),
        inset 0 -1px 1px rgba(255,255,255,0.05),
        0 0 18px -4px color-mix(in srgb, ${accent} 70%, transparent)
      `,
      color: "#ffffff",
      textShadow: `0 0 10px color-mix(in srgb, ${accent} 85%, transparent)`,
      transform: "translateY(4px) scale(0.98)",
    };
  }

  /* ---- Latched (caps-lock) ---- */
  if (latched) {
    return {
      background: `
        linear-gradient(
          180deg,
          color-mix(in srgb, var(--color-gt-accent2) 28%, rgba(255,255,255,0.06)) 0%,
          color-mix(in srgb, var(--color-gt-sub) 82%, black 18%) 100%
        )`,
      borderColor:
        "color-mix(in srgb, var(--color-gt-accent2) 50%, transparent)",
      boxShadow: `
        0 3px 0 0 rgba(0,0,0,0.9),
        0 4px 10px rgba(0,0,0,0.7),
        0 0 0 1px color-mix(in srgb, var(--color-gt-accent2) 30%, transparent),
        inset 0 1px 0 color-mix(in srgb, white 20%, transparent),
        inset 0 -1px 2px rgba(0,0,0,0.3)
      `,
      color: "var(--color-gt-text)",
      textShadow:
        "0 0 10px color-mix(in srgb, var(--color-gt-accent2) 55%, transparent)",
      transform: "translateY(1px)",
    };
  }

  /* ---- Default (raised) ---- */
  return {
    background: `
      linear-gradient(
        180deg,
        color-mix(in srgb, var(--color-gt-sub) 90%, rgba(255,255,255,0.06)) 0%,
        color-mix(in srgb, var(--color-gt-sub) 70%, black 30%) 60%,
        color-mix(in srgb, var(--color-gt-bg) 60%, black 40%) 100%
      )`,
    borderColor: "color-mix(in srgb, var(--color-gt-untyped) 20%, transparent)",
    boxShadow: `
      0 4px 0 0 color-mix(in srgb, var(--color-gt-bg) 50%, black 50%),
      0 5px 8px rgba(0,0,0,0.6),
      0 6px 16px rgba(0,0,0,0.35),
      inset 0 1px 0 rgba(255,255,255,0.07),
      inset 0 -1px 2px rgba(0,0,0,0.25)
    `,
    color: "color-mix(in srgb, var(--color-gt-text) 80%, transparent)",
    transform: "translateY(0)",
  };
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function TypingKeyboard({
  pressedCodes,
  capsLockOn,
}: TypingKeyboardProps) {

  return (
    <section className="mt-8 mb-12 relative [perspective:1200px] w-full max-w-[920px] mx-auto hidden sm:block">
      {/* Ambient glow beneath the board */}
      <div className="absolute inset-0 -z-10 rounded-[48px] bg-[var(--color-gt-accent)]/4 blur-[100px]" />

      {/* ---- Outer case (CNC aluminium look) ---- */}
      <div
        className="relative rounded-[20px] border border-[var(--color-gt-untyped)]/20 p-[6px] sm:p-2 md:p-[10px] w-full"
        style={{
          background: `
            linear-gradient(
              170deg,
              color-mix(in srgb, var(--color-gt-sub) 85%, white 15%) 0%,
              color-mix(in srgb, var(--color-gt-bg) 80%, black 20%) 50%,
              color-mix(in srgb, var(--color-gt-bg) 65%, black 35%) 100%
            )
          `,
          boxShadow: `
            0 50px 100px -30px rgba(0,0,0,0.9),
            0 25px 60px -20px rgba(0,0,0,0.7),
            inset 0 1px 0 rgba(255,255,255,0.08),
            inset 0 -1px 0 rgba(0,0,0,0.3)
          `,
        }}
      >
        {/* Top bezel detail — LED strip / brand area */}
        <div className="flex items-center justify-between px-3 md:px-5 pt-1 pb-1.5 md:pb-2">
          {/* Left: 3 indicator LEDs */}
          <div className="flex gap-1.5 md:gap-2 items-center">
            {/* Caps Lock LED */}
            <div
              className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-all duration-200"
              style={{
                background: capsLockOn
                  ? "var(--color-gt-accent2)"
                  : "rgba(255,255,255,0.06)",
                boxShadow: capsLockOn
                  ? "0 0 6px var(--color-gt-accent2), 0 0 12px color-mix(in srgb, var(--color-gt-accent2) 50%, transparent)"
                  : "inset 0 1px 2px rgba(0,0,0,0.5)",
              }}
            />
            <div
              className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full"
              style={{
                background: "rgba(255,255,255,0.06)",
                boxShadow: "inset 0 1px 2px rgba(0,0,0,0.5)",
              }}
            />
            <div
              className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full"
              style={{
                background: "rgba(255,255,255,0.06)",
                boxShadow: "inset 0 1px 2px rgba(0,0,0,0.5)",
              }}
            />
          </div>
          {/* Right: subtle brand text */}
          <span className="text-[8px] md:text-[9px] uppercase tracking-[0.3em] font-mono opacity-15 text-[var(--color-gt-text)] select-none">
            gorilla type
          </span>
        </div>

        {/* ---- Inner plate (sunken keycap area) ---- */}
        <div
          className="relative rounded-[12px] md:rounded-[14px] border border-black/40 p-1.5 sm:p-2 md:p-2.5"
          style={{
            background: `
              linear-gradient(
                180deg,
                rgba(0,0,0,0.5) 0%,
                rgba(0,0,0,0.25) 40%,
                rgba(0,0,0,0.35) 100%
              )
            `,
            boxShadow: `
              inset 0 2px 12px rgba(0,0,0,0.9),
              inset 0 0 1px rgba(0,0,0,0.5),
              0 1px 0 rgba(255,255,255,0.04)
            `,
          }}
        >
          <div className="w-full space-y-[3px] md:space-y-1">
            {KEYBOARD_ROWS.map((row) => (
              <div
                key={row[0]?.id}
                className="flex gap-[3px] md:gap-1 lg:gap-[5px] w-full"
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
                  const isSpace = keyDef.id === "space";

                  return (
                    <div
                      key={keyDef.id}
                      className={cn(
                        "group relative flex min-w-0 flex-1 select-none border",
                        "rounded-[5px] md:rounded-[7px] lg:rounded-[8px]",
                        "transition-[transform,box-shadow,border-color,background-color,color,text-shadow]",
                        "duration-[35ms] ease-out",
                        isDualLegend
                          ? "h-[34px] md:h-[42px] lg:h-[50px] items-start justify-start px-1.5 md:px-2 pt-1 md:pt-1.5"
                          : isSpace
                            ? "h-[30px] md:h-[36px] lg:h-[42px] items-center justify-center"
                            : "h-[34px] md:h-[42px] lg:h-[50px] items-center px-1 md:px-2",
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
                      {/* Top shine highlight (keycap edge catch) */}
                      <span
                        className="pointer-events-none absolute inset-x-[12%] top-[1px] h-[1px] rounded-full"
                        style={{
                          background: isPressed
                            ? "rgba(255,255,255,0.03)"
                            : "rgba(255,255,255,0.09)",
                        }}
                      />

                      {/* Bottom shadow lip (keycap underside) */}
                      <span
                        className="pointer-events-none absolute inset-x-[8%] bottom-0 h-[1px] rounded-full"
                        style={{
                          background: "rgba(0,0,0,0.3)",
                        }}
                      />

                      {/* ---- Key legend content ---- */}
                      {keyDef.shiftLabel ? (
                        <div className="flex w-full flex-col items-start leading-none opacity-[0.85]">
                          <span className="text-[7px] md:text-[8px] lg:text-[10px] font-semibold uppercase tracking-[0.05em] md:tracking-widest text-current/55">
                            {keyDef.shiftLabel}
                          </span>
                          <span className="mt-auto text-[9px] md:text-[11px] lg:text-[13px] font-bold uppercase tracking-[0.05em] md:tracking-widest text-current mb-0.5">
                            {keyDef.label}
                          </span>
                        </div>
                      ) : isSpace ? (
                        /* Spacebar: clean with subtle texture line */
                        <div className="w-[45%] h-[2px] rounded-full bg-current opacity-[0.06]" />
                      ) : (
                        <div
                          className={cn(
                            "w-full font-bold uppercase text-current opacity-[0.85] font-mono",
                            isLongLabel
                              ? "text-[6px] md:text-[8px] lg:text-[10px] tracking-[0.05em] md:tracking-widest"
                              : "text-[9px] md:text-[11px] lg:text-[13px] tracking-[0.08em] md:tracking-[0.12em]",
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

                      {/* Homing bump (F and J keys) */}
                      {isHomingKey && (
                        <div
                          className={cn(
                            "absolute bottom-[5px] md:bottom-[7px] lg:bottom-[9px] left-1/2 -translate-x-1/2",
                            "h-[1.5px] md:h-[2px] w-[8px] md:w-[10px] lg:w-[12px] rounded-full",
                          )}
                          style={{
                            background: isPressed
                              ? "rgba(255,255,255,0.35)"
                              : "rgba(255,255,255,0.12)",
                            boxShadow: isPressed
                              ? "0 0 4px rgba(255,255,255,0.15)"
                              : "0 1px 1px rgba(0,0,0,0.4)",
                          }}
                        />
                      )}

                      {/* Caps lock active indicator dot */}
                      {keyDef.id === "capslock" && capsLockOn && (
                        <div
                          className="absolute top-1.5 md:top-2 right-2 md:right-3 w-1 h-1 md:w-1.5 md:h-1.5 rounded-full"
                          style={{
                            background: "var(--color-gt-accent2)",
                            boxShadow:
                              "0 0 4px var(--color-gt-accent2), 0 0 8px color-mix(in srgb, var(--color-gt-accent2) 40%, transparent)",
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bezel — rubber feet hints */}
        <div className="flex justify-between px-6 md:px-10 pt-1 md:pt-1.5 pb-0.5">
          <div className="w-6 md:w-8 h-[2px] rounded-full bg-black/20" />
          <div className="w-6 md:w-8 h-[2px] rounded-full bg-black/20" />
        </div>
      </div>
    </section>
  );
}
