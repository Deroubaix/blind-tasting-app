import React from "react";
import Link from "next/link";

type AuthHeaderProps = {
  contextLink: { href: string; label: string };
};

export default function AuthHeader({ contextLink }: AuthHeaderProps) {
  return (
    <header className="auth-header">
      <Link href="/" className="auth-header-logo no-underline">
        The Sommelier&apos;s Ledger
      </Link>
      <Link href={contextLink.href} className="auth-header-link no-underline">
        {contextLink.label}
      </Link>
    </header>
  );
}
