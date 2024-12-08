import React from "react";
import Link from "next/link";

export default function Header() {
  return (
    <header className="header">
      <div className="container">
        <h1 className="logo">
          <Link href="/">Blind Tasting App</Link>
        </h1>
        <nav className="nav">
          <ul className="nav-list">
            <li>
              <Link href="/features">Features</Link>
            </li>
            <li>
              <Link href="/about">About</Link>
            </li>
            <li>
              <Link href="/contact">Contact</Link>
            </li>
            <li>
              <Link href="/login">
                <button className="btn primary">Login</button>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
