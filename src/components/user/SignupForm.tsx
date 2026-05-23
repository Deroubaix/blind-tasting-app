"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { IconArrowRight, IconEye, IconEyeOff } from "@tabler/icons-react";
import ClientAuthService from "../../services/client/ClientAuthService";
import NotificationUtils from "../../utils/NotificationsUtils";
import AuthHeader from "../layout/AuthHeader";
import Footer from "../layout/Footer";
import { useAuthProvider } from "../auth/AuthProvider";

export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("r") || "/archives";
  const { signIn } = useAuthProvider();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setIsSubmitting(true);
      const authService = new ClientAuthService();
      await authService.signup(name, email, password);
      await signIn(email, password);

      NotificationUtils.showSuccess("Account created successfully!", "Welcome to the Ledger");
      router.push(redirectTo);
    } catch (error: any) {
      const isSyntaxError = error instanceof SyntaxError || error?.name === "SyntaxError";
      const displayError = isSyntaxError
        ? new Error("Signup failed: the server returned an unexpected response. Please try again.")
        : error;
      NotificationUtils.showError(displayError, "Signup Failed");
      setError(displayError.message || "Failed to sign up");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <AuthHeader
        contextLink={{ href: "/login", label: "Log in", contextLabel: "Already a member?" }}
      />

      <main className="auth-main">
        <div className="auth-container">

          <header className="auth-card-head">
            <span className="page-eyebrow">Create account</span>
            <h1 className="auth-heading">
              Begin your <em>ledger</em>.
            </h1>
            <p className="auth-subheading">
              <strong>Three fields, thirty seconds.</strong> Save your sessions to review later.
            </p>
          </header>

          <form className="auth-form" onSubmit={handleSignup}>
            {error && <p className="auth-error">{error}</p>}

            <div className="auth-field">
              <label htmlFor="signup-name" className="auth-label">Display Name</label>
              <input
                id="signup-name"
                className="auth-input"
                type="text"
                autoComplete="name"
                placeholder="e.g. Master Vinter"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="signup-email" className="auth-label">Email Address</label>
              <input
                id="signup-email"
                className="auth-input"
                type="email"
                autoComplete="email"
                placeholder="cellar@master.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <div className="auth-label-row">
                <label htmlFor="signup-password" className="auth-label">Password</label>
                <span className="auth-input-hint">8+ characters</span>
              </div>
              <div className="auth-input-wrapper">
                <input
                  id="signup-password"
                  className="auth-input"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  minLength={8}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                </button>
              </div>
            </div>

            <button
              className="auth-submit btn-primary btn-primary--auth"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating account…" : "Sign up"}
              <IconArrowRight size={15} />
            </button>

            <p className="auth-fineprint">
              By signing up you agree to our{" "}
              <Link href="/terms">Terms</Link> and{" "}
              <Link href="/privacy">Privacy Policy</Link>.
            </p>
          </form>

          <p className="auth-switch">
            Already have an account?{" "}
            <Link href="/login" className="auth-switch-link">
              Log in
            </Link>
          </p>

        </div>
      </main>

      <Footer />
    </div>
  );
}
