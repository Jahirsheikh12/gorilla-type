"use client";

import type { CSSProperties } from "react";

interface CaretProps {
  top: number;
  left: number;
  height: number;
  isTyping: boolean;
  styleVariant?: "off" | "line" | "block" | "outline" | "underline";
  smoothness?: "off" | "slow" | "medium" | "fast";
}

const TRANSITION_MS: Record<NonNullable<CaretProps["smoothness"]>, number> = {
  off: 0,
  slow: 180,
  medium: 90,
  fast: 45,
};

export function Caret({
  top,
  left,
  height,
  isTyping,
  styleVariant = "line",
  smoothness = "medium",
}: CaretProps) {
  if (styleVariant === "off") return null;

  const transitionMs = TRANSITION_MS[smoothness];
  const baseStyle: CSSProperties = {
    top,
    left,
    height,
    transitionDuration: `${transitionMs}ms`,
  };

  if (styleVariant === "underline") {
    return (
      <div
        className={`pointer-events-none absolute z-10 rounded-full ${
          isTyping ? "caret-no-blink" : "caret-blink"
        }`}
        style={{
          ...baseStyle,
          top: top + height - 3,
          height: 3,
          width: Math.max(14, Math.round(height * 0.6)),
          backgroundColor: "var(--color-gt-accent)",
          boxShadow:
            "0 0 8px color-mix(in srgb, var(--color-gt-accent) 60%, transparent), 0 0 20px color-mix(in srgb, var(--color-gt-accent) 15%, transparent)",
        }}
      />
    );
  }

  if (styleVariant === "block") {
    return (
      <div
        className={`pointer-events-none absolute z-10 rounded-sm ${
          isTyping ? "caret-no-blink" : "caret-blink"
        }`}
        style={{
          ...baseStyle,
          width: Math.max(14, Math.round(height * 0.6)),
          backgroundColor:
            "color-mix(in srgb, var(--color-gt-accent) 35%, transparent)",
          border: "1px solid var(--color-gt-accent)",
        }}
      />
    );
  }

  if (styleVariant === "outline") {
    return (
      <div
        className={`pointer-events-none absolute z-10 rounded-sm ${
          isTyping ? "caret-no-blink" : "caret-blink"
        }`}
        style={{
          ...baseStyle,
          width: Math.max(14, Math.round(height * 0.6)),
          backgroundColor: "transparent",
          border: "2px solid var(--color-gt-accent)",
        }}
      />
    );
  }

  return (
    <div
      className={`pointer-events-none absolute z-10 w-[2.5px] rounded-full transition-all duration-75 ${
        isTyping ? "caret-no-blink" : "caret-blink"
      }`}
      style={{
        ...baseStyle,
        backgroundColor: "var(--color-gt-accent)",
        boxShadow: "0 0 8px color-mix(in srgb, var(--color-gt-accent) 60%, transparent), 0 0 20px color-mix(in srgb, var(--color-gt-accent) 15%, transparent)",
      }}
    />
  );
}
