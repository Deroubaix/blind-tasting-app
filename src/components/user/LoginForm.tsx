"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { IconArrowRight, IconEye, IconEyeOff } from "@tabler/icons-react";
import NotificationUtils from "../../utils/NotificationsUtils";
import AuthHeader from "../layout/AuthHeader";
import Footer from "../layout/Footer";
import { useAuthProvider } from "../auth/AuthProvider";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useAuthProvider();
  const redirectTo = searchParams.get("r") ?? "/archives";
  const signupHref = `/signup?r=${encodeURIComponent(redirectTo)}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      await signIn(email, password);
      NotificationUtils.showSuccess("Login successful", "Welcome back");
      router.push(redirectTo);
    } catch (error: any) {
      NotificationUtils.showError(error, "Incorrect email and/or password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <AuthHeader
        contextLink={{ href: signupHref, label: "Sign up", contextLabel: "New here?" }}
      />

      <main className="auth-main">
        <div className="auth-container">

          <header className="auth-card-head">
            <span className="page-eyebrow">Welcome back</span>
            <h1 className="auth-heading">
              Open the <em>ledger</em>.
            </h1>
            <p className="auth-subheading">
              Log in to access your saved tastings.
            </p>
          </header>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="login-email" className="auth-label">Email Address</label>
              <input
                id="login-email"
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
                <label htmlFor="login-password" className="auth-label">Password</label>
                <Link href="/forgot-password" className="auth-forgot">
                  Forgot?
                </Link>
              </div>
              <div className="auth-input-wrapper">
                <input
                  id="login-password"
                  className="auth-input"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
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
              {isSubmitting ? "Logging in…" : "Log in"}
              <IconArrowRight size={15} />
            </button>
          </form>

          <p className="auth-switch">
            New to the Ledger?{" "}
            <Link href={signupHref} className="auth-switch-link">
              Sign up
            </Link>
          </p>

        </div>
      </main>

      <Footer />
    </div>
  );
}
