"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { IconGlassFull, IconBottle, IconVolumeOff, IconStopwatch, IconArrowRight } from "@tabler/icons-react";
import { useToastProvider } from "../../toast/ToastProvider";
import { useTastingContext } from "../../components/tasting/TastingContext";
import { PHASE_TIMER_SECONDS, formatTimerSeconds } from "../../data/timerData";

type TimerDuration = 4 | 7.5;

const PHASE_KEYS: { num: string; name: string; key: string }[] = [
  { num: "01", name: "Sight",   key: "sight" },
  { num: "02", name: "Nose",    key: "nose" },
  { num: "03", name: "Palate",  key: "palate" },
  { num: "04", name: "Initial", key: "initialConclusion" },
  { num: "05", name: "Final",   key: "finalConclusion" },
];

export default function TastingStartClient() {
  const router = useRouter();
  const { showToast } = useToastProvider();
  const { updateTastingData } = useTastingContext();

  const [wineType, setWineType] = useState<"White" | "Red" | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [timerDuration, setTimerDuration] = useState<TimerDuration>(4);
  const [wineName, setWineName] = useState("");

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();

    if (!wineType) {
      showToast({
        title: "Select a wine type",
        children: "Please choose Red or White Wine to continue.",
        color: "error",
      });
      return;
    }

    updateTastingData({
      wineType,
      timerEnabled,
      timerDuration: timerEnabled ? timerDuration : null,
      soundEnabled,
      wineName: wineName.trim() || "",
      conclusion: { initial: {}, final: {} },
    });

    router.push(`/tastings/sight?wineType=${wineType.toLowerCase()}`);
  };

  return (
    <main className="start-main">

      {/* ── Page head ── */}
      <header className="start-head">
        <span className="page-eyebrow">New session</span>
        <h1 className="start-heading">
          Begin your <em>tasting</em>.
        </h1>
        <p className="start-sub">
          Configure the session below. You can practise without an account — sign up later to save it.
        </p>
      </header>

      <form onSubmit={handleStart}>

        {/* ── Step 1: Wine type ── */}
        <section className="start-step">
          <header className="start-step-label">
            <span className="start-step-num">01</span>
            <span className="start-step-name">Wine type</span>
            <span className="start-step-hint">required</span>
          </header>

          <div className="start-wine-grid" role="radiogroup" aria-label="Wine type">
            <button
              type="button"
              role="radio"
              aria-pressed={wineType === "Red"}
              className={`start-wine-card start-wine-card--red${wineType === "Red" ? " start-wine-card--selected" : ""}`}
              onClick={() => setWineType("Red")}
            >
              <div className="start-wine-card__top">
                <div className="start-wine-icon start-wine-icon--red">
                  <IconGlassFull size={22} />
                </div>
                <div className={`start-wine-check${wineType === "Red" ? " start-wine-check--visible" : ""}`}>✓</div>
              </div>
              <div>
                <h3 className="start-wine-name">Red <em>Wine</em></h3>
                <p className="start-wine-tags">Tannin · Structure · Earth</p>
              </div>
            </button>

            <button
              type="button"
              role="radio"
              aria-pressed={wineType === "White"}
              className={`start-wine-card start-wine-card--white${wineType === "White" ? " start-wine-card--selected" : ""}`}
              onClick={() => setWineType("White")}
            >
              <div className="start-wine-card__top">
                <div className="start-wine-icon start-wine-icon--white">
                  <IconBottle size={22} />
                </div>
                <div className={`start-wine-check${wineType === "White" ? " start-wine-check--visible" : ""}`}>✓</div>
              </div>
              <div>
                <h3 className="start-wine-name">White <em>Wine</em></h3>
                <p className="start-wine-tags">Acidity · Fruit · Terroir</p>
              </div>
            </button>
          </div>
        </section>

        {/* ── Step 2: Session settings ── */}
        <section className="start-step">
          <header className="start-step-label">
            <span className="start-step-num">02</span>
            <span className="start-step-name">Session settings</span>
            <span className="start-step-hint">optional</span>
          </header>

          <div className="start-settings">
            <div className="start-setting-row">
              <div className="start-setting-icon"><IconVolumeOff size={18} /></div>
              <div className="start-setting-text">
                <div className="start-setting-name">Sound</div>
                <p className="start-setting-desc">Audible cue when each phase&apos;s timer reaches zero.</p>
              </div>
              <button
                type="button"
                className="start-switch"
                aria-pressed={soundEnabled}
                aria-label="Toggle sound"
                onClick={() => setSoundEnabled((v) => !v)}
              >
                <span className="start-switch__knob" />
              </button>
            </div>

            <div className="start-setting-row">
              <div className="start-setting-icon"><IconStopwatch size={18} /></div>
              <div className="start-setting-text">
                <div className="start-setting-name">Timer</div>
                <p className="start-setting-desc">Run each phase under the deductive clock. Auto-advances when time is up.</p>
              </div>
              <button
                type="button"
                className="start-switch"
                aria-pressed={timerEnabled}
                aria-label="Toggle timer"
                onClick={() => setTimerEnabled((v) => !v)}
              >
                <span className="start-switch__knob" />
              </button>
            </div>

            <div className={`start-setting-row start-setting-row--duration${!timerEnabled ? " start-setting-row--disabled" : ""}`}>
              <div className="start-duration" role="radiogroup" aria-label="Timer duration">
                <button
                  type="button"
                  role="radio"
                  aria-checked={timerDuration === 4}
                  className={`start-duration-pill${timerDuration === 4 ? " start-duration-pill--on" : ""}`}
                  onClick={() => setTimerDuration(4)}
                >
                  <span className="start-duration-pill__time">4:00</span>
                  <span className="start-duration-pill__label">Standard</span>
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={timerDuration === 7.5}
                  className={`start-duration-pill${timerDuration === 7.5 ? " start-duration-pill--on" : ""}`}
                  onClick={() => setTimerDuration(7.5)}
                >
                  <span className="start-duration-pill__time">7:30</span>
                  <span className="start-duration-pill__label">Extended</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── Step 3: Wine identity ── */}
        <section className="start-step">
          <header className="start-step-label">
            <span className="start-step-num">03</span>
            <span className="start-step-name">Wine identity</span>
            <span className="start-step-hint">optional — for your records</span>
          </header>

          <div className="start-identity-wrap">
            <span className="start-identity-prefix">Wine</span>
            <input
              className="start-identity-input"
              type="text"
              placeholder="e.g. 2016 Barolo DOCG"
              maxLength={50}
              value={wineName}
              onChange={(e) => setWineName(e.target.value)}
              aria-label="Wine name (optional)"
            />
            <span className="start-identity-counter">{wineName.length} / 50</span>
          </div>
        </section>

        {/* ── CTA ── */}
        <div className="start-cta">
          <button type="submit" className="btn-primary start-cta__btn" disabled={!wineType}>
            Start tasting
            <IconArrowRight size={16} />
          </button>
          <p className="start-hint">
            <span className="start-hint__accent">Sight</span> begins immediately
          </p>
        </div>

      </form>

      {/* ── Phase preview rail ── */}
      <div className="start-phase-rail" aria-hidden="true">
        {PHASE_KEYS.map((p) => {
          const timerKey = timerEnabled
            ? (timerDuration === 7.5 ? "7.5 min" : "4 min")
            : "4 min";
          const seconds = PHASE_TIMER_SECONDS[p.key][timerKey];
          return (
            <div key={p.num} className="start-phase-chip">
              <span className="start-phase-chip__num">{p.num}</span>
              <span className="start-phase-chip__name">{p.name}</span>
              <span className={`start-phase-chip__time${!timerEnabled ? " start-phase-chip__time--muted" : ""}`}>
                {timerEnabled ? formatTimerSeconds(seconds) : "—"}
              </span>
            </div>
          );
        })}
      </div>

    </main>
  );
}
