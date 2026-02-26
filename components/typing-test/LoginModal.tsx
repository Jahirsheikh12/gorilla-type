"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Mail, Lock, User, ArrowRight, Github, Keyboard } from "lucide-react";
import { apiFetch } from "@/lib/api-client";

interface LoginModalProps {
  onClose: () => void;
}

export function LoginModal({ onClose }: LoginModalProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      if (mode === "signup") {
        await apiFetch("/api/auth/signup", {
          method: "POST",
          body: JSON.stringify({ email, password, username }),
        });
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        return;
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[400px] overflow-hidden rounded-2xl">
      {/* Left panel - brand (hidden on mobile) */}
      <div className="relative hidden w-52 flex-col items-center justify-center overflow-hidden md:flex" style={{ background: "var(--gt-gradient-subtle)" }}>
        <div className="absolute inset-0 opacity-[0.08]" style={{ background: "var(--gt-gradient-primary)" }} />
        <div className="relative flex flex-col items-center gap-4 px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-gt-accent)]/15 glow-accent">
            <Keyboard className="h-7 w-7 text-[var(--color-gt-accent)]" />
          </div>
          <div>
            <h2 className="font-heading text-lg font-bold">
              <span className="text-[var(--color-gt-accent)]">gorilla</span>
              <span className="text-[var(--color-gt-text)]">type</span>
            </h2>
            <p className="mt-1 text-xs text-[var(--color-gt-untyped)]">
              Unleash your typing speed
            </p>
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 space-y-5 p-6">
        {/* Mode toggle */}
        <div className="flex rounded-xl bg-[var(--color-gt-bg)] p-1">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
              mode === "login"
                ? "bg-[var(--color-gt-accent)]/15 text-[var(--color-gt-accent)]"
                : "text-[var(--color-gt-untyped)] hover:text-[var(--color-gt-text)]"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
              mode === "signup"
                ? "bg-[var(--color-gt-accent)]/15 text-[var(--color-gt-accent)]"
                : "text-[var(--color-gt-untyped)] hover:text-[var(--color-gt-text)]"
            }`}
          >
            Sign up
          </button>
        </div>

        {/* Social login buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => void signIn("google")}
            className="flex items-center justify-center gap-2 rounded-xl border border-[var(--color-gt-untyped)]/15 bg-[var(--color-gt-bg)] py-2.5 text-sm text-[var(--color-gt-text)] transition-all hover:border-[var(--color-gt-untyped)]/25 hover:scale-[1.01]"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>
          <button
            onClick={() => void signIn("github")}
            className="flex items-center justify-center gap-2 rounded-xl border border-[var(--color-gt-untyped)]/15 bg-[var(--color-gt-bg)] py-2.5 text-sm text-[var(--color-gt-text)] transition-all hover:border-[var(--color-gt-untyped)]/25 hover:scale-[1.01]"
          >
            <Github className="h-4 w-4" />
            Continue with GitHub
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-[var(--color-gt-untyped)]/15" />
          <span className="text-xs text-[var(--color-gt-untyped)]">or</span>
          <div className="h-px flex-1 bg-[var(--color-gt-untyped)]/15" />
        </div>

        {/* Form */}
        <div className="space-y-3">
          {mode === "signup" && (
            <div className="flex items-center gap-3 rounded-xl border border-[var(--color-gt-untyped)]/15 bg-[var(--color-gt-bg)] px-3 py-2.5 transition-all focus-within:border-[var(--color-gt-accent)]/30">
              <User className="h-4 w-4 shrink-0 text-[var(--color-gt-untyped)]" />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-transparent font-body text-sm text-[var(--color-gt-text)] placeholder:text-[var(--color-gt-untyped)] focus:outline-none"
              />
            </div>
          )}
          <div className="flex items-center gap-3 rounded-xl border border-[var(--color-gt-untyped)]/15 bg-[var(--color-gt-bg)] px-3 py-2.5 transition-all focus-within:border-[var(--color-gt-accent)]/30">
            <Mail className="h-4 w-4 shrink-0 text-[var(--color-gt-untyped)]" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent font-body text-sm text-[var(--color-gt-text)] placeholder:text-[var(--color-gt-untyped)] focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-[var(--color-gt-untyped)]/15 bg-[var(--color-gt-bg)] px-3 py-2.5 transition-all focus-within:border-[var(--color-gt-accent)]/30">
            <Lock className="h-4 w-4 shrink-0 text-[var(--color-gt-untyped)]" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent font-body text-sm text-[var(--color-gt-text)] placeholder:text-[var(--color-gt-untyped)] focus:outline-none"
            />
          </div>
        </div>

        {/* Gradient submit button */}
        <button
          disabled={submitting}
          onClick={() => void submit()}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-70"
          style={{ background: "linear-gradient(135deg, var(--color-gt-accent), var(--color-gt-accent2))" }}
        >
          {mode === "login" ? "Sign in" : "Create account"}
          <ArrowRight className="h-4 w-4" />
        </button>

        {error && (
          <div className="rounded-xl bg-[var(--color-gt-error)]/10 px-3 py-2 text-xs text-[var(--color-gt-error)]">
            {error}
          </div>
        )}

        {mode === "login" && (
          <button className="w-full text-center text-xs text-[var(--color-gt-untyped)] hover:text-[var(--color-gt-accent)]">
            Forgot password?
          </button>
        )}
      </div>
    </div>
  );
}
