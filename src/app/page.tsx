import React from "react";
import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { wineColors } from "../components/sight/sightData";

const PHASES = [
  {
    num: "01",
    prefix: "The",
    name: "Sight",
    desc: "Clarity, brightness, colour, concentration, viscosity. Selectable options.",
    input: "Selectable",
    time: "0:30",
  },
  {
    num: "02",
    prefix: "The",
    name: "Nose",
    desc: "Fruit, floral, herbs, earth, wood. Selectable options plus free-text custom notes. Varies by wine type.",
    input: "Mixed",
    time: "2:00",
  },
  {
    num: "03",
    prefix: "The",
    name: "Palate",
    desc: "Sweetness, tannin, acid, alcohol, body, finish. Selectable scales.",
    input: "Selectable",
    time: "0:30",
  },
  {
    num: "04",
    prefix: "Initial",
    name: "call",
    desc: "Old/New World, climate, age range, possible grape varieties and countries.",
    input: "Mixed",
    time: "0:30",
  },
  {
    num: "05",
    prefix: "Final",
    name: "conclusion",
    desc: "Grape, country, region, quality tier, vintage. Free text.",
    input: "Free text",
    time: "0:30",
  },
];

const SWATCHES = wineColors.red.spectrum.map((s, i) => ({ ...s, selected: i === 2 }));

export default function Homepage() {
  return (
    <>
      <Header />
      <main className="home-page">

        {/* ── Hero ── */}
        <section className="hp-hero">
          <div className="hp-hero__left">
            <span className="hp-eyebrow">Built on the CMS deductive tasting method</span>

            <h1 className="hp-hero__h1">
              The deductive<br />
              tasting sheet,<br />
              <em className="hp-hero__italic">digitised</em>
            </h1>

            <p className="hp-hero__lede">
              A practice ledger for sommelier students. Walk the five phases of
              the deductive method, with optional timers, and save your sessions
              to review later.
            </p>

            <div className="hp-hero__ctas">
              <Link href="/tastings/start" className="btn-primary no-underline">
                Start a Tasting <IconArrowRight size={16} />
              </Link>
              <Link href="/login" className="hp-link-quiet no-underline">
                Log in <span className="hp-link-quiet__arrow"><IconArrowRight size={12} /></span>
              </Link>
            </div>
          </div>

          <div className="hp-hero__right">

            {/* Main preview card — tasting in progress */}
            <article className="hp-preview hp-preview--main">
              <header className="hp-preview__head">
                <div className="hp-preview__phase">
                  <span className="hp-phase-pip">01</span>
                  <div>
                    <span className="hp-phase-title">Sight</span>
                    <span className="hp-phase-sub">analytical pass</span>
                  </div>
                </div>
                <div className="hp-preview__timer">
                  <span className="hp-timer__label">Time</span>
                  <span className="hp-timer__value">00:24</span>
                </div>
              </header>

              <div className="hp-preview__field">
                <div className="hp-field-q">
                  <span>Core hue</span>
                  <span className="hp-field-q__hint">Single select</span>
                </div>
                <div className="hp-swatch-grid">
                  {SWATCHES.map(({ hex, name, selected }) => (
                    <div
                      key={name}
                      className={`hp-swatch${selected ? " hp-swatch--selected" : ""}`}
                      style={{ background: hex }}
                    >
                      {selected && <span className="hp-swatch__check">✓</span>}
                      <span className="hp-swatch__name">{name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="hp-preview__field">
                <div className="hp-field-q">
                  <span>Concentration</span>
                  <span className="hp-field-q__hint">Single select</span>
                </div>
                <div className="hp-pill-row">
                  {["Pale", "Medium−", "Medium", "Medium+", "Deep"].map((label) => (
                    <span key={label} className={`hp-pill${label === "Medium" ? " hp-pill--on" : ""}`}>
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="hp-preview__field">
                <div className="hp-field-q">
                  <span>Rim variation</span>
                  <span className="hp-field-q__hint">Single select</span>
                </div>
                <div className="hp-pill-row">
                  {["Distinct", "Slight", "None"].map((label) => (
                    <span key={label} className={`hp-pill${label === "Distinct" ? " hp-pill--on" : ""}`}>
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              <footer className="hp-preview__foot">
                <div className="hp-progress">
                  <div className="hp-progress__bar" />
                  <span className="hp-progress__pct">3 / 6</span>
                </div>
                <span className="hp-next-cue">Next · Nose</span>
              </footer>
            </article>

            {/* Secondary card — a saved past tasting */}
            <article className="hp-preview hp-preview--ledger">
              <header className="hp-ledger__head">
                <span className="hp-ledger__badge">White · Saved</span>
                <span className="hp-ledger__when">2 days ago</span>
              </header>
              <p className="hp-ledger__title">Sauvignon Blanc, Marlborough</p>
              <p className="hp-ledger__sub">2022 · Cool climate · New World</p>
              <div className="hp-ledger__result">
                <span className="hp-ledger__result-label">Session length</span>
                <span className="hp-ledger__result-value">04:00</span>
              </div>
            </article>

          </div>
        </section>

        {/* ── The Method ── */}
        <section className="hp-method">
          <header className="hp-method__head">
            <div className="hp-method__head-left">
              <span className="hp-eyebrow">The Method</span>
              <h2 className="hp-method__h2">
                Five phases.<br />
                One <em className="hp-method__italic">tasting</em>.
              </h2>
            </div>
            <p className="hp-method__desc">
              Each session walks the five phases of the deductive tasting method
              in order. Optional timer for each. Reach the end, add notes, and save.
            </p>
          </header>

          <div className="hp-phase-grid">
            {PHASES.map(({ num, prefix, name, desc, input, time }) => (
              <article key={num} className="hp-phase-cell">
                <span className="hp-phase-cell__num">{num}</span>
                <h3 className="hp-phase-cell__name">
                  {prefix} <em>{name}</em>
                </h3>
                <p className="hp-phase-cell__desc">{desc}</p>
                <div className="hp-phase-cell__foot">
                  <span>{input}</span>
                  <span className="hp-phase-cell__time">{time}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
