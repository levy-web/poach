"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    // TODO: wire up to the real admin auth endpoint once it exists.
    setTimeout(() => {
      setSubmitting(false);
      router.push("/");
    }, 400);
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface-container-low">
      <header className="flex w-full items-center justify-between px-margin-page py-stack-md">
        <span className="font-headline-md text-headline-md font-bold text-zest-orange">
          Zest Admin
        </span>
      </header>

      <main className="flex flex-grow items-center justify-center p-6">
        <div className="w-full max-w-md rounded-xl border border-surface-container-highest bg-surface-container-lowest p-10 shadow-standard">
          <div className="mb-8 text-center">
            <h1 className="mb-2 font-headline-lg text-headline-lg text-on-surface">Welcome Back</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Please enter your credentials to access the admin portal.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="mb-2 block font-label-md text-label-md text-on-surface">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="username"
                placeholder="admin@zest.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-md border border-outline-variant bg-surface-cream px-4 py-3 font-body-md text-on-surface transition-all placeholder:text-on-surface-variant/50 focus:border-zest-orange focus:ring-2 focus:ring-zest-orange focus:outline-none"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="password" className="block font-label-md text-label-md text-on-surface">
                  Password
                </label>
                <a
                  href="#"
                  className="font-label-sm text-label-sm text-zest-orange transition-colors hover:text-zest-orange-container"
                >
                  Forgot Password?
                </a>
              </div>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-md border border-outline-variant bg-surface-cream px-4 py-3 font-body-md text-on-surface transition-all placeholder:text-on-surface-variant/50 focus:border-zest-orange focus:ring-2 focus:ring-zest-orange focus:outline-none"
              />
            </div>

            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                className="h-5 w-5 cursor-pointer rounded border-outline-variant bg-surface-cream text-zest-orange focus:ring-zest-orange"
              />
              <label
                htmlFor="remember"
                className="ml-2 block cursor-pointer font-body-sm text-body-sm text-on-surface-variant"
              >
                Keep me logged in
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-zest-orange px-4 py-3 font-label-md text-label-md text-on-primary shadow-sm transition-colors hover:bg-zest-orange-container focus:ring-2 focus:ring-zest-orange focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Signing In..." : "Sign In"}
              {!submitting && <span className="material-symbols-outlined text-[18px]">login</span>}
            </button>
          </form>
        </div>
      </main>

      <footer className="flex w-full items-center justify-center gap-gutter py-stack-lg">
        <div className="flex flex-col items-center gap-4 text-center md:flex-row">
          <span className="font-body-sm text-body-sm text-secondary">
            © 2026 Zest Operations. All rights reserved.
          </span>
          <div className="flex gap-4">
            <a href="#" className="font-body-sm text-body-sm text-secondary underline transition-all hover:text-zest-orange">
              Privacy Policy
            </a>
            <a href="#" className="font-body-sm text-body-sm text-secondary underline transition-all hover:text-zest-orange">
              Terms of Service
            </a>
            <a href="#" className="font-body-sm text-body-sm text-secondary underline transition-all hover:text-zest-orange">
              Security Center
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
