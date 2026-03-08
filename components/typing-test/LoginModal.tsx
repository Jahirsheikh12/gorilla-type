"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Mail, Lock, User, ArrowRight, Github, Keyboard, Eye, EyeOff } from "lucide-react";
import { apiFetch } from "@/lib/api-client";

interface LoginModalProps {
  onClose: () => void;
}

export function LoginModal({ onClose }: LoginModalProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !submitting) {
      void submit();
    }
  };

  return (
    <div className="w-full max-w-[420px] overflow-hidden rounded-2xl border border-[var(--color-gt-untyped)]/10 bg-[var(--color-gt-sub)] shadow-2xl">
      {/* Header */}
      <div className="flex flex-col items-center gap-3 px-8 pt-8 pb-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-gt-accent)]/10">
          <Keyboard className="h-6 w-6 text-[var(--color-gt-accent)]" />
        </div>
        <div className="text-center">
          <h2 className="font-heading text-xl font-bold">
            <span className="text-[var(--color-gt-accent)]">gorilla</span>
            <span className="text-[var(--color-gt-text)]">type</span>
          </h2>
          <p className="mt-1 text-xs text-[var(--color-gt-untyped)]">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </p>
        </div>
      </div>

      <div className="space-y-4 px-8 pt-4 pb-8" onKeyDown={handleKeyDown}>
        {/* Mode toggle */}
        <div className="flex rounded-xl bg-[var(--color-gt-bg)] p-1">
          <button
            onClick={() => { setMode("login"); setError(null); }}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
              mode === "login"
                ? "bg-[var(--color-gt-accent)]/12 text-[var(--color-gt-accent)]"
                : "text-[var(--color-gt-untyped)] hover:text-[var(--color-gt-text)]"
            }`}
          >
            Sign in
          </button>
          <button
            onClick={() => { setMode("signup"); setError(null); }}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
              mode === "signup"
                ? "bg-[var(--color-gt-accent)]/12 text-[var(--color-gt-accent)]"
                : "text-[var(--color-gt-untyped)] hover:text-[var(--color-gt-text)]"
            }`}
          >
            Sign up
          </button>
        </div>

        {/* Social login */}
        <div className="flex gap-2">
          <button
            onClick={() => void signIn("google")}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--color-gt-untyped)]/12 bg-[var(--color-gt-bg)] py-2.5 text-sm text-[var(--color-gt-text)] transition-all hover:border-[var(--color-gt-untyped)]/25 hover:bg-[var(--color-gt-bg)]/80"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </button>
          <button
            onClick={() => void signIn("github")}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--color-gt-untyped)]/12 bg-[var(--color-gt-bg)] py-2.5 text-sm text-[var(--color-gt-text)] transition-all hover:border-[var(--color-gt-untyped)]/25 hover:bg-[var(--color-gt-bg)]/80"
          >
            <Github className="h-4 w-4" />
            GitHub
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-[var(--color-gt-untyped)]/12" />
          <span className="text-[11px] text-[var(--color-gt-untyped)]">or continue with email</span>
          <div className="h-px flex-1 bg-[var(--color-gt-untyped)]/12" />
        </div>

        {/* Form fields */}
        <div className="space-y-2.5">
          {mode === "signup" && (
            <div className="group flex items-center gap-3 rounded-xl border border-[var(--color-gt-untyped)]/12 bg-[var(--color-gt-bg)] px-3.5 py-2.5 transition-all focus-within:border-[var(--color-gt-accent)]/30 focus-within:ring-1 focus-within:ring-[var(--color-gt-accent)]/10">
              <User className="h-4 w-4 shrink-0 text-[var(--color-gt-untyped)] transition-colors group-focus-within:text-[var(--color-gt-accent)]" />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-transparent font-body text-sm text-[var(--color-gt-text)] placeholder:text-[var(--color-gt-untyped)]/60 focus:outline-none"
              />
            </div>
          )}
          <div className="group flex items-center gap-3 rounded-xl border border-[var(--color-gt-untyped)]/12 bg-[var(--color-gt-bg)] px-3.5 py-2.5 transition-all focus-within:border-[var(--color-gt-accent)]/30 focus-within:ring-1 focus-within:ring-[var(--color-gt-accent)]/10">
            <Mail className="h-4 w-4 shrink-0 text-[var(--color-gt-untyped)] transition-colors group-focus-within:text-[var(--color-gt-accent)]" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent font-body text-sm text-[var(--color-gt-text)] placeholder:text-[var(--color-gt-untyped)]/60 focus:outline-none"
            />
          </div>
          <div className="group flex items-center gap-3 rounded-xl border border-[var(--color-gt-untyped)]/12 bg-[var(--color-gt-bg)] px-3.5 py-2.5 transition-all focus-within:border-[var(--color-gt-accent)]/30 focus-within:ring-1 focus-within:ring-[var(--color-gt-accent)]/10">
            <Lock className="h-4 w-4 shrink-0 text-[var(--color-gt-untyped)] transition-colors group-focus-within:text-[var(--color-gt-accent)]" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent font-body text-sm text-[var(--color-gt-text)] placeholder:text-[var(--color-gt-untyped)]/60 focus:outline-none"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword(!showPassword)}
              className="shrink-0 text-[var(--color-gt-untyped)] transition-colors hover:text-[var(--color-gt-text)]"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-[var(--color-gt-error)]/15 bg-[var(--color-gt-error)]/8 px-3.5 py-2.5 text-xs text-[var(--color-gt-error)]">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          disabled={submitting}
          onClick={() => void submit()}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-gt-accent)] py-2.5 text-sm font-semibold text-[var(--color-gt-bg)] transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-60"
        >
          {submitting ? (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-gt-bg)]/30 border-t-[var(--color-gt-bg)]" />
          ) : (
            <>
              {mode === "login" ? "Sign in" : "Create account"}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        {/* Footer link */}
        {mode === "login" && (
          <button className="w-full text-center text-xs text-[var(--color-gt-untyped)] transition-colors hover:text-[var(--color-gt-accent)]">
            Forgot password?
          </button>
        )}
      </div>
    </div>
  );
}
