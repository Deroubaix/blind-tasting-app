"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthProvider } from "../../components/auth/AuthProvider";
import FormControl from "../../components/form/FormControl";
import TextInput from "../../components/form/TextInput";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user, signIn, isLoading } = useAuthProvider();

  useEffect(() => {
    if (user) {
      router.push("/tastings"); // Redirect if already logged in
    }
  }, [user, router]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // Signup using API
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to sign up");
      }

      // Auto-login after signup
      await signIn(email, password);
      router.push("/tastings");
    } catch (error: any) {
      setError(error.message || "Failed to sign up");
    }
  };

  return (
    <div className="auth-page">
      <h1>Sign Up</h1>
      {isLoading && <p>Loading...</p>}
      <form onSubmit={handleSignup}>
        {error && <p className="error">{error}</p>}

        <FormControl name="email" label="Email">
          <TextInput
            placeholder="Enter your email"
            value={email}
            onChange={(val) => setEmail(val)}
          />
        </FormControl>

        <FormControl name="password" label="Password">
          <TextInput
            placeholder="Enter your password"
            value={password}
            onChange={(val) => setPassword(val)}
          />
        </FormControl>

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Signing up..." : "Sign Up"}
        </button>
      </form>
      <p>
        Already have an account? <a href="/login">Log in</a>
      </p>
    </div>
  );
}
