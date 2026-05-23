import React from "react";
import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";

type AuthHeaderProps = {
  contextLink: { href: string; label: string; contextLabel: string };
};

export default function AuthHeader({ contextLink }: AuthHeaderProps) {
  return (
    <header className="auth-header">
      <Link href="/" className="auth-header-logo no-underline">
        The Sommelier<em className="logo-serif">&apos;s</em> Ledger
      </Link>
      <Link href={contextLink.href} className="auth-header-link no-underline">
        <span className="auth-nav-label">{contextLink.contextLabel}</span>
        <span className="auth-nav-action">{contextLink.label}</span>
        <span className="auth-nav-arrow"><IconArrowRight size={12} /></span>
      </Link>
    </header>
  );
}
