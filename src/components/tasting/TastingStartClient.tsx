"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { IconGlassFull, IconBottle, IconVolumeOff, IconStopwatch } from "@tabler/icons-react";
import { useToastProvider } from "../../toast/ToastProvider";
import { useTastingContext } from "../../components/tasting/TastingContext";

type TimerDuration = 4 | 7.5;

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
    <main className="tasting-start-main">
      <div className="tasting-start-inner">
        <h1 className="tasting-start-heading">Begin Your Analysis</h1>
        <p className="tasting-start-subtitle">
          Select the varietal category to open a new tasting ledger. Precision is the mark of a master.
        </p>

        <form onSubmit={handleStart}>
          {/* Wine Type Cards */}
          <div className="wine-type-grid" role="radiogroup" aria-label="Wine type">
            <button
              type="button"
              role="radio"
              aria-checked={wineType === "Red"}
              className={`wine-type-card wine-type-card--red ${wineType === "Red" ? "selected" : ""}`}
              onClick={() => setWineType("Red")}
            >
              <div className="wine-type-icon wine-type-icon--red">
                <IconGlassFull size={28} />
              </div>
              <span className="wine-type-name">Red Wine</span>
              <span className="wine-type-tags">Tannin • Structure • Earth</span>
            </button>

            <button
              type="button"
              role="radio"
              aria-checked={wineType === "White"}
              className={`wine-type-card wine-type-card--white ${wineType === "White" ? "selected" : ""}`}
              onClick={() => setWineType("White")}
            >
              <div className="wine-type-icon wine-type-icon--white">
                <IconBottle size={28} />
              </div>
              <span className="wine-type-name">White Wine</span>
              <span className="wine-type-tags">Acidity • Fruit • Terroir</span>
            </button>
          </div>

          {/* Settings Panel */}
          <div className="settings-panel">
            <div className="settings-toggles">
              <div className="toggle-row">
                <IconVolumeOff size={14} className="toggle-icon" />
                <span className="toggle-label">Sound</span>
                <button
                  type="button"
                  className={`toggle-switch ${soundEnabled ? "on" : ""}`}
                  onClick={() => setSoundEnabled((v) => !v)}
                  aria-pressed={soundEnabled}
                  aria-label="Toggle sound"
                >
                  <span className="toggle-knob" />
                </button>
              </div>

              <div className="toggle-row">
                <IconStopwatch size={14} className="toggle-icon" />
                <span className="toggle-label">Timer</span>
                <button
                  type="button"
                  className={`toggle-switch ${timerEnabled ? "on" : ""}`}
                  onClick={() => setTimerEnabled((v) => !v)}
                  aria-pressed={timerEnabled}
                  aria-label="Toggle timer"
                >
                  <span className="toggle-knob" />
                </button>
              </div>
            </div>

            {timerEnabled && (
              <div className="timer-duration-pills" role="radiogroup" aria-label="Timer duration">
                <button
                  type="button"
                  role="radio"
                  aria-checked={timerDuration === 4}
                  className={`duration-pill ${timerDuration === 4 ? "selected" : ""}`}
                  onClick={() => setTimerDuration(4)}
                >
                  4 Minutes <span className="pill-label">Standard</span>
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={timerDuration === 7.5}
                  className={`duration-pill ${timerDuration === 7.5 ? "selected" : ""}`}
                  onClick={() => setTimerDuration(7.5)}
                >
                  7.5 Minutes <span className="pill-label">CMS/WSET</span>
                </button>
              </div>
            )}
          </div>

          {/* Wine Identity */}
          <div className="wine-identity-field">
            <label className="wine-identity-label">Wine Identity (Optional)</label>
            <div className="wine-identity-input-row">
              <span className="wine-identity-prefix">Wine</span>
              <input
                className="wine-identity-input"
                type="text"
                placeholder="e.g., 2016 Barolo DOCG"
                value={wineName}
                onChange={(e) => setWineName(e.target.value)}
                maxLength={50}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className={`start-tasting-btn ${!wineType ? "disabled" : ""}`}
            disabled={!wineType}
          >
            Start Tasting
          </button>
        </form>

        <p className="tasting-methodology-note">
          Professional Tasting Methodology<br />
          Court of Master Sommeliers Standard
        </p>
      </div>
    </main>
  );
}
