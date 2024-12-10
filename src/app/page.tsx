"use client";

import React from "react";
import Link from "next/link";

export default function Homepage() {
  return (
    <main className="homepage">
      <header className="header">
        <h1 className="logo">Blind Tasting App</h1>
        <p className="tagline">Explore flavors, aromas, and textures.</p>
      </header>
      <section className="hero">
        <h2>Discover the Art of Blind Tasting</h2>
        <p>
          Dive into the world of wine tasting. Explore flavors, aromas, and
          textures like a pro.
        </p>
        <div className="cta-buttons">
          <Link href="/login">
            <button className="btn primary">Login / Signup</button>
          </Link>
          <Link href="/tastings">
            <button className="btn secondary">Start Blind Tasting</button>
          </Link>
        </div>
      </section>
      <section className="features">
        <h2>Why Use Blind Tasting App?</h2>
        <div className="feature-list">
          <div className="feature-item">
            <img src="/icons/discover.svg" alt="Discover" />
            <p>Discover your palate.</p>
          </div>
          <div className="feature-item">
            <img src="/icons/record.svg" alt="Record" />
            <p>Record and save tastings.</p>
          </div>
          <div className="feature-item">
            <img src="/icons/archive.svg" alt="Archive" />
            <p>Archive your wine experiences.</p>
          </div>
          <div className="feature-item">
            <img src="/icons/start.svg" alt="Start" />
            <p>No account needed to get started.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
