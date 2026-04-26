"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthProvider } from "../../components/auth/AuthProvider";

export default function LogoutPage() {
  const { signOut } = useAuthProvider();
  const router = useRouter();

  useEffect(() => {
    signOut().then(() => {
      router.push("/");
    });
  }, []);

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <p>Logging out...</p>
    </div>
  );
}
