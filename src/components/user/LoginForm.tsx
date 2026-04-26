"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import NotificationUtils from "../../utils/NotificationsUtils";
import ClientAuthService from "../../services/client/ClientAuthService";
import AuthHeader from "../layout/AuthHeader";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchParams = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      const authService = new ClientAuthService();
      const loggedInUser = await authService.login(email, password);

      if (!loggedInUser) {
        NotificationUtils.showError(
          new Error("Please check your credentials and try again."),
          "Incorrect email and/or password."
        );
        return;
      }

      NotificationUtils.showSuccess("Redirecting you now...", "Login successful", 3000);

      setTimeout(() => {
        const redirectUrl = searchParams.get("r") ?? "/archives";
        window.location.href = redirectUrl;
      }, 1000);
    } catch (error: any) {
      NotificationUtils.showError(error, "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <AuthHeader contextLink={{ href: "/signup", label: "Sign Up" }} />

      <main className="auth-main">
        <div className="auth-container">
          <h1 className="auth-heading">Welcome Back</h1>
          <p className="auth-subheading">
            <em>Enter your credentials to access the private cellar.</em>
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label className="auth-label">Email Address</label>
              <input
                className="auth-input"
                type="email"
                placeholder="sommelier@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <div className="auth-label-row">
                <label className="auth-label">Password</label>
                <Link href="/forgot-password" className="auth-forgot">
                  Forgot Credentials?
                </Link>
              </div>
              <input
                className="auth-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button className="auth-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Logging in..." : "Login →"}
            </button>
          </form>

          <p className="auth-switch">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="auth-switch-link">
              Sign Up
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
