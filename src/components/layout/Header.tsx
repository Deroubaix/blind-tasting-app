"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { IconX, IconUser, IconArrowRight } from "@tabler/icons-react";
import useAuthenticatedUser from "../../hooks/UseAuthenticatedUser";
import { useAuthProvider } from "../auth/AuthProvider";

export default function Header() {
  const [showNavbar, setShowNavbar] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { user, isInitialLoading } = useAuthenticatedUser();
  const { signOut } = useAuthProvider();
  const router = useRouter();
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
    setDropdownOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  const handleLogout = async () => {
    setDropdownOpen(false);
    closeMenu();
    await signOut();
    router.push("/");
  };

  return (
    <header className="navbar">
      <Link href="/" className="header-logo no-underline">
        The Sommelier<em className="logo-serif">&apos;s</em> Ledger
      </Link>

      <nav className="nav">
        {/* Desktop nav links */}
        <div className="desktop-nav-links">
          {isLoggedIn && (
            <Link
              href="/archives"
              className={`nav-link ${pathname === "/archives" ? "active" : ""}`}
            >
              archive
            </Link>
          )}
        </div>

        {/* Right side: auth-aware */}
        {!isInitialLoading &&
          (isLoggedIn ? (
            <div className="nav-user" ref={dropdownRef}>
              <button
                className="nav-icon-btn"
                onClick={() => setDropdownOpen((o) => !o)}
                aria-label="Account menu"
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                <IconUser size={20} />
              </button>
              {dropdownOpen && (
                <div className="nav-dropdown" role="menu">
                  <div className="nav-dropdown__profile">
                    <span className="nav-dropdown__name">{user.displayName}</span>
                    <span className="nav-dropdown__email">{user.email}</span>
                  </div>
                  <div className="nav-dropdown__divider" />
                  <Link
                    href="/change-password"
                    className="nav-dropdown__item"
                    role="menuitem"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Change Password
                  </Link>
                  <button
                    className="nav-dropdown__item nav-dropdown__item--logout"
                    role="menuitem"
                    onClick={handleLogout}
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="nav-auth">
              <Link href="/login" className="nav-link">
                Log in
              </Link>
              <Link href="/tastings/start" className="nav-signup-btn btn-primary no-underline">
                Start a Tasting <IconArrowRight size={16} />
              </Link>
            </div>
          ))}

        {/* Hamburger for mobile */}
        <button
          className={`hamburger-menu ${showNavbar ? "hidden" : ""}`}
          onClick={toggleMenu}
          aria-label="Open menu"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
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
            <button className="menu-logout-btn" onClick={handleLogout}>
              Log Out
            </button>
          ) : (
            <>
              <Link href="/login" onClick={closeMenu}>Log in</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
