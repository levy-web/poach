"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/lib/auth-actions";

const initialState: LoginState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);

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
              Please enter your admin credentials to access the portal.
            </p>
          </div>

          <form className="space-y-6" action={formAction}>
            {state.error && (
              <div className="rounded-md border border-error/30 bg-error-container/40 px-4 py-3 font-body-sm text-body-sm text-on-error-container">
                {state.error}
              </div>
            )}

            <div>
              <label htmlFor="phone_number" className="mb-2 block font-label-md text-label-md text-on-surface">
                Phone Number
              </label>
              <input
                id="phone_number"
                name="phone_number"
                type="tel"
                required
                autoComplete="username"
                placeholder="0712345678"
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
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full rounded-md border border-outline-variant bg-surface-cream px-4 py-3 font-body-md text-on-surface transition-all placeholder:text-on-surface-variant/50 focus:border-zest-orange focus:ring-2 focus:ring-zest-orange focus:outline-none"
              />
            </div>

            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
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
              disabled={pending}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-zest-orange px-4 py-3 font-label-md text-label-md text-on-primary shadow-sm transition-colors hover:bg-zest-orange-container focus:ring-2 focus:ring-zest-orange focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "Signing In..." : "Sign In"}
              {!pending && <span className="material-symbols-outlined text-[18px]">login</span>}
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
