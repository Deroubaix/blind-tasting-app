import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand">
          <Link href="/" className="footer-logo no-underline">
            The Sommelier&apos;s Ledger
          </Link>
          <p className="footer-tagline">
            The personal practice ledger for candidates pursuing CMS, WSET, and IM certifications.
          </p>
        </div>

        <div className="footer-links">
          <div className="footer-col">
            <h4>Resources</h4>
            <Link href="/deductive-grid">Deductive Grid 101</Link>
            <Link href="/study-guides">Study Guides</Link>
            <Link href="/flashcards">Flashcards</Link>
          </div>
          <div className="footer-col">
            <h4>Tools</h4>
            <Link href="/archives">My Ledger</Link>
            <Link href="/account">Settings</Link>
            <Link href="/login">Sign In</Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2024 The Sommelier&apos;s Ledger.</span>
        <div className="footer-legal">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
