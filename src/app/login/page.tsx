"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthProvider } from "../../components/auth/AuthProvider";
import FormControl from "../../components/form/FormControl";
import TextInput from "../../components/form/TextInput";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user, signIn, isLoading } = useAuthProvider();

  useEffect(() => {
    if (user) {
      router.push("/tastings");
    }
  }, [user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await signIn(email, password);
      router.push("/tastings");
    } catch (error: any) {
      setError(error.message || "Failed to log in");
    }
  };

  return (
    <div className="auth-page">
      <h1>Login</h1>
      {isLoading && <p>Loading...</p>}
      <form onSubmit={handleLogin}>
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
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>
      <p>
        Don't have an account? <a href="/signup">Sign up</a>
      </p>
    </div>
  );
}
