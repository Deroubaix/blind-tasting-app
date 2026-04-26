"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconX, IconSettings, IconUser } from "@tabler/icons-react";
import useAuthenticatedUser from "../../hooks/UseAuthenticatedUser";

export default function Header() {
  const [showNavbar, setShowNavbar] = useState(false);
  const pathname = usePathname();
  const { user, isInitialLoading } = useAuthenticatedUser();
  const isLoggedIn = !isInitialLoading && !!user;

  const toggleMenu = () => {
    const open = !showNavbar;
    setShowNavbar(open);
    document.body.classList.toggle("menu-open", open);
  };

  const closeMenu = () => {
    setShowNavbar(false);
    document.body.classList.remove("menu-open");
  };

  useEffect(() => {
    closeMenu();
  }, [pathname]);

  return (
    <header className="navbar">
      <Link href="/" className="header-logo no-underline">
        The Sommelier&apos;s Ledger
      </Link>

      <nav className="nav">
        {/* Desktop nav links */}
        <div className="desktop-nav-links">
          <Link href="/" className={`nav-link ${pathname === "/" ? "active" : ""}`}>
            Home
          </Link>
          <Link href="/methodology" className={`nav-link ${pathname === "/methodology" ? "active" : ""}`}>
            Methodology
          </Link>
          {isLoggedIn && (
            <Link href="/archives" className={`nav-link ${pathname === "/archives" ? "active" : ""}`}>
              Archive
            </Link>
          )}
        </div>

        {/* Right side: auth-aware */}
        {!isInitialLoading && (
          isLoggedIn ? (
            <div className="nav-icons">
              <Link href="/account" className="nav-icon-btn" aria-label="Settings">
                <IconSettings size={20} />
              </Link>
              <Link href="/account" className="nav-icon-btn" aria-label="Account">
                <IconUser size={20} />
              </Link>
            </div>
          ) : (
            <div className="nav-auth">
              <Link href="/login" className="nav-link">Login</Link>
              <Link href="/signup" className="nav-signup-btn">Sign Up</Link>
            </div>
          )
        )}

        {/* Hamburger for mobile */}
        <button
          className={`hamburger-menu ${showNavbar ? "hidden" : ""}`}
          onClick={toggleMenu}
          aria-label="Open menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {/* Mobile menu overlay */}
        <div className={`menu-links ${showNavbar ? "show" : ""}`}>
          <div className="close-menu" onClick={closeMenu}>
            <IconX size={28} />
          </div>
          <Link href="/" onClick={closeMenu}>Home</Link>
          <Link href="/methodology" onClick={closeMenu}>Methodology</Link>
          {isLoggedIn && (
            <Link href="/archives" onClick={closeMenu}>Archive</Link>
          )}
          {isLoggedIn ? (
            <Link href="/account" onClick={closeMenu}>Account</Link>
          ) : (
            <>
              <Link href="/login" onClick={closeMenu}>Login</Link>
              <Link href="/signup" onClick={closeMenu}>Sign Up</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
