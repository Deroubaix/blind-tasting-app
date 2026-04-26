"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import ClientAuthService from "../../services/client/ClientAuthService";
import NotificationUtils from "../../utils/NotificationsUtils";
import AuthHeader from "../layout/AuthHeader";

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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setIsSubmitting(true);
      const authService = new ClientAuthService();
      await authService.signup(name, email, password);

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
      <AuthHeader contextLink={{ href: "/login", label: "Login" }} />

      <main className="auth-main">
        <div className="auth-container">
          <h1 className="auth-heading">Begin Your Ledger</h1>
          <p className="auth-subheading">
            Join the inner circle of the Court. Document every vintage, master the blind tasting.
          </p>

          <form className="auth-form" onSubmit={handleSignup}>
            {error && <p className="auth-error">{error}</p>}

            <div className="auth-field">
              <label className="auth-label">Display Name</label>
              <input
                className="auth-input"
                type="text"
                placeholder="E.g. Master Vinter"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">Email Address</label>
              <input
                className="auth-input"
                type="email"
                placeholder="cellar@master.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">Secure Password</label>
              <div className="auth-input-wrapper">
                <input
                  className="auth-input"
                  type={showPassword ? "text" : "password"}
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

            <button className="auth-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{" "}
            <Link href="/login" className="auth-switch-link">
              Log In
            </Link>
          </p>
        </div>
      </main>

      <footer className="auth-footer-bar">
        <span>The Sommelier&apos;s Ledger • Practice Tool</span>
        <span>V. 0.8.2 | Beta Access</span>
      </footer>
    </div>
  );
}
