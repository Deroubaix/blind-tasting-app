import React from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

export default function Homepage() {
  return (
    <>
      <Header />
      <main className="home-page">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-left">
              <span className="entrance-label">
                <span className="dot">●</span> ENTRANCE EXAM PRACTICE TOOL
              </span>
              <h1>
                Master the Art of
                <br />
                the <em className="italic-accent">Blind Tasting.</em>
              </h1>
              <p className="hero-description">
                A digital companion for your deductive practice. Refine your
                palate with a structured ledger designed for serious sommelier
                candidates.
              </p>
              <div className="hero-cta">
                <Link href="/tastings/start" className="btn-start-tasting">
                  Start a Tasting <span className="arrow">→</span>
                </Link>
                <Link href="/login" className="sign-in-link">
                  SIGN IN
                </Link>
              </div>
            </div>
            <div className="hero-right">
              <div className="hero-image-wrapper">
                <Image
                  src="/images/illustrations/wine-tasting.jpg"
                  alt="Sommelier examining wine"
                  className="sommelier-image"
                  width={400}
                  height={320}
                />
                <div className="active-session-card">
                  <div className="session-left">
                    <span className="session-label">ACTIVE SESSION</span>
                    <span className="session-name">2018 Bordeaux Blend</span>
                  </div>
                  <div className="session-right">
                    <span className="score-label">CONFIDENCE SCORE</span>
                    <span className="score-value">92%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <div className="features-header">
            <h2>Precision over guesswork.</h2>
            <p>The structured framework for analytical wine evaluation.</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <Image src="/images/SVG/eye.svg" alt="" width={24} height={24} />
              </div>
              <h3>Analytical Sight</h3>
              <p>
                Record clarity, color, and concentration using standard
                terminology and rapid selection tools.
              </p>
              <div className="feature-tags">
                <span className="tag">PALE STRAW</span>
                <span className="tag">STAR BRIGHT</span>
              </div>
            </div>
            <div className="feature-card featured">
              <div className="feature-icon">
                <Image src="/images/SVG/air.svg" alt="" width={24} height={24} />
              </div>
              <h3>Aromatic Profiling</h3>
              <p>
                Categorize fruit condition, earth markers, and oak influence
                into precise cluster groups.
              </p>
              <div className="feature-progress">
                <span className="progress-label">FLORAL INTENSITY</span>
                <div className="progress-bar">
                  <div className="progress-fill" />
                </div>
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Image src="/images/SVG/glass.svg" alt="" width={24} height={24} />
              </div>
              <h3>Palate Logic</h3>
              <p>
                Quantify acidity, tannin, and alcohol to generate logical
                conclusions based on your markers.
              </p>
              <div className="feature-metrics">
                <div className="metric">
                  <span className="metric-label">ACID</span>
                  <span className="metric-value">High</span>
                </div>
                <div className="metric">
                  <span className="metric-label">ALCOHOL</span>
                  <span className="metric-value">14.5%</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <p>
            Practice is permanent.{" "}
            <Link href="/signup" className="cta-inline-link">
              Create an account
            </Link>{" "}
            to save your session history and track your progress.
          </p>
          <Link href="/tastings/start" className="btn-private-session">
            Start Private Session
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
