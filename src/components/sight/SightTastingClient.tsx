"use client";

import { useRouter } from "next/navigation";
import { useTastingContext } from "../tasting/TastingContext";
import { useEffect, useState } from "react";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import LeftSidebar from "../tasting/LeftSideBar";
import TastingPageHeader from "../layout/TastingPageHeader";
import TastingFooter from "../layout/TastingFooter";

// ─── Wine colour data (logic, not styling) ────────────────────────────────────
const wineColors = {
  red: {
    spectrum: [
      {
        name: "Purple",
        hex: "#4E0D3A",
        desc: "Deep blue-red, youthful wines. Malbec, young Syrah, Petite Sirah.",
      },
      {
        name: "Ruby",
        hex: "#9B1B30",
        desc: "Bright clear red, most common red wine color. Young Cabernet, Merlot, Sangiovese.",
      },
      {
        name: "Garnet",
        hex: "#6E2B3A",
        desc: "Red with brownish-orange hints, indicates age. Aged Pinot Noir, Nebbiolo, older Rioja.",
      },
    ],
    hue: [
      {
        name: "Blue",
        hex: "#5C2D6E",
        desc: "Cool blue-purple tint at rim. Indicates youth, low pH, high acidity.",
      },
      {
        name: "Pink",
        hex: "#B8566E",
        desc: "Pinkish-red rim. Mid-age wine, moderate development.",
      },
      {
        name: "Garnet",
        hex: "#8B4A3A",
        desc: "Orange-brown rim. Indicates significant age and evolution.",
      },
    ],
    tip: "Look for the rim of the wine against white paper. In red wines, a blue rim indicates youth, while brick-orange hints suggest maturity. Concentration can indicate the grape variety and winemaking style.",
  },
  white: {
    spectrum: [
      {
        name: "Straw",
        hex: "#E8D8A0",
        desc: "Very pale yellow, almost watery. Young Pinot Grigio, Muscadet, Albariño.",
      },
      {
        name: "Gold",
        hex: "#DAA520",
        desc: "Rich golden yellow. Oaked Chardonnay, aged Riesling, Viognier.",
      },
      {
        name: "Amber",
        hex: "#B87820",
        desc: "Deep honey-brown gold. Aged whites, Sauternes, oxidative styles, Sherry.",
      },
    ],
    hue: [
      {
        name: "Greenish",
        hex: "#C8D8A0",
        desc: "Slight green tint. Very young, high acidity. Sauvignon Blanc, Grüner Veltliner.",
      },
      {
        name: "Yellow",
        hex: "#E0C860",
        desc: "Standard yellow hue. Most white wines in their prime drinking window.",
      },
      {
        name: "Bronze",
        hex: "#C49A48",
        desc: "Golden-brown tint. Aged whites, some skin-contact wines.",
      },
    ],
    tip: "Evaluate the physical appearance of the white wine against a neutral background. Observe clarity, intensity, and secondary hues.",
  },
};

const progressSteps = [
  { label: "Sight", done: true },
  { label: "Nose", done: false },
  { label: "Palate", done: false },
  { label: "Initial Conclusion", done: false },
  { label: "Final Conclusion", done: false },
];

export default function SightTastingClient({
  wineType,
}: {
  wineType: "red" | "white";
}) {
  const router = useRouter();
  const { tastingData, updateTastingData } = useTastingContext();

  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string | null>
  >(tastingData.sight || {});
  const [tipOpen, setTipOpen] = useState(false);
  const [hoveredSwatch, setHoveredSwatch] = useState<string | null>(null);

  useEffect(() => {
    if (tastingData.sight) setSelectedOptions(tastingData.sight);
  }, [tastingData]);

  const handleOptionSelect = (category: string, option: string) => {
    setSelectedOptions((prev) => ({ ...prev, [category]: option }));
  };

  const handleNextPhase = () => {
    updateTastingData({ sight: selectedOptions as Record<string, string> });
    router.push(`/tastings/nose?wineType=${wineType}`);
  };

  const handleReset = () => setSelectedOptions({});

  const colors = wineColors[wineType];

  // Completion %
  const mainFields =
    wineType === "red"
      ? ["Clarity", "Brightness", "Concentration", "Viscosity", "Color", "Hue"]
      : ["Clarity", "Brightness", "Viscosity", "Tears", "Color", "Hue"];
  const pct = Math.round(
    (mainFields.filter((f) => selectedOptions[f] != null).length /
      mainFields.length) *
      100,
  );

  // ─── Sub-renderers ───────────────────────────────────────────────────────────

  const renderOptions = (category: string, options: string[]) => (
    <div className="sight-options">
      {options.map((opt) => {
        const selected = selectedOptions[category] === opt;
        return (
          <button
            key={opt}
            className={`sight-option${selected ? " sight-option--selected" : ""}`}
            onClick={() => handleOptionSelect(category, opt)}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );

  const renderToggle = (category: string, options: [string, string]) => (
    <div className="sight-toggle-group">
      {options.map((opt) => {
        const selected = selectedOptions[category] === opt;
        return (
          <button
            key={opt}
            className={`sight-toggle-btn${selected ? " sight-toggle-btn--selected" : ""}`}
            onClick={() => handleOptionSelect(category, opt)}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );

  const renderSwatches = (category: string, items: typeof colors.spectrum) => (
    <div className="sight-swatches">
      {items.map((item) => {
        const key = `${category}-${item.name}`;
        const selected = selectedOptions[category] === item.name;
        return (
          <div
            key={item.name}
            className="sight-swatch-item"
            onMouseEnter={() => setHoveredSwatch(key)}
            onMouseLeave={() => setHoveredSwatch(null)}
          >
            {/* Tooltip: shown via JS hover state — no touch equivalent */}
            {hoveredSwatch === key && (
              <div className="sight-tooltip">{item.desc}</div>
            )}
            {/* background is dynamic (wine hex value) — only this one inline style */}
            <div
              className={`sight-swatch-rect${selected ? " sight-swatch-rect--selected" : ""}`}
              style={{ backgroundColor: item.hex }}
              onClick={() => handleOptionSelect(category, item.name)}
            />
            <div
              className={`sight-swatch-label${selected ? " sight-swatch-label--selected" : ""}`}
            >
              {item.name}
            </div>
          </div>
        );
      })}
    </div>
  );

  // ─── Markup ───────────────────────────────────────────────────────────────────
  return (
    <div className="tasting-phase-page">
      {/* ── Top bar ── */}
      <TastingPageHeader wineType={wineType} />

      {/* ── Body ── */}
      <div className="tasting-phase-body">
        {/* ── Left nav sidebar ── */}
        <LeftSidebar wineType={wineType} progress={pct} />

        {/* ── Main content ── */}
        <main className="tasting-phase-main">
          <div className="tasting-phase-content">
            {/* Page heading */}
            <div className="phase-label">Phase 01</div>
            <h1 className="phase-heading">The Sight</h1>
            <p className="phase-description">
              {wineType === "red"
                ? "Examine the wine against a neutral white background under consistent lighting conditions."
                : "Evaluate the physical appearance of the white wine against a neutral background. Observe clarity, intensity, and secondary hues."}
            </p>

            {/*
              Three-column assessment grid
              ┌──────────────┬──────────────┬───────────────────────────┐
              │ Clarity      │ Brightness   │ Physical Evidence (×2 rows│
              ├──────────────┼──────────────┤                           │
              │ Conc/Visc    │ Visc/Tears   │                           │
              ├──────────────┴──────────────┼───────────────────────────┤
              │ Color Spectrum (span 2 cols)│ Master Tip                │
              ├──────────────────────────────┼───────────────────────────┤
              │ Hue Rim       (span 2 cols) │ Exam Progress             │
              └──────────────────────────────┴───────────────────────────┘
            */}
            <div className="sight-grid">
              {/* Row 1, Col 1 — Clarity */}
              <div className="sight-card">
                <div className="sight-card__label">Clarity</div>
                {renderOptions(
                  "Clarity",
                  wineType === "red"
                    ? ["Clear", "Slightly Cloudy"]
                    : ["Clear", "Hazy"],
                )}
              </div>

              {/* Row 1, Col 2 — Brightness */}
              <div className="sight-card">
                <div className="sight-card__label">Brightness</div>
                {renderOptions(
                  "Brightness",
                  wineType === "red"
                    ? ["Hazy", "Day Bright", "Star Bright"]
                    : ["Dull", "Bright"],
                )}
              </div>

              {/* Col 3, Rows 1–2 — Physical Evidence */}
              <div className="sight-card sight-card--evidence">
                <div className="sight-card__label">Physical Evidence</div>
                <div className="sight-evidence-fields">
                  {wineType === "red" && (
                    <div className="sight-evidence-field">
                      <span className="sight-evidence-field__label">
                        Stained Tears
                      </span>
                      {renderToggle("StainedTears", ["No", "Yes"])}
                    </div>
                  )}
                  <div className="sight-evidence-field">
                    <span className="sight-evidence-field__label">
                      Gas Evidence
                    </span>
                    {renderToggle("GasEvidence", ["No", "Yes"])}
                  </div>
                  <div className="sight-evidence-field">
                    <span className="sight-evidence-field__label">
                      Sediment/Particles
                    </span>
                    {wineType === "red"
                      ? renderToggle("SedimentParticles", ["No", "Yes"])
                      : renderToggle("SedimentParticles", ["None", "Present"])}
                  </div>
                </div>
              </div>

              {/* Row 2, Col 1 — Concentration (red) or Viscosity (white) */}
              {wineType === "red" ? (
                <div className="sight-card">
                  <div className="sight-card__label">Concentration</div>
                  {renderOptions("Concentration", ["Pale", "Moderate", "Deep"])}
                </div>
              ) : (
                <div className="sight-card">
                  <div className="sight-card__label">Viscosity</div>
                  {renderOptions("Viscosity", ["Low", "Medium", "High"])}
                </div>
              )}

              {/* Row 2, Col 2 — Viscosity (red) or Tears (white) */}
              {wineType === "red" ? (
                <div className="sight-card">
                  <div className="sight-card__label">Viscosity</div>
                  {renderOptions("Viscosity", ["Low", "Medium", "High"])}
                </div>
              ) : (
                <div className="sight-card">
                  <div className="sight-card__label">Tears</div>
                  {renderOptions("Tears", ["Slow", "Fast"])}
                </div>
              )}

              {/* Row 3, Cols 1–2 — Color Spectrum */}
              <div className="sight-card sight-card--span-cols">
                <div className="sight-card__header">
                  <div className="sight-card__label">Color Spectrum</div>
                  <span className="sight-card__sublabel">Core Color</span>
                </div>
                {renderSwatches("Color", colors.spectrum)}
              </div>

              {/* Rows 3–4, Col 3 — Master Tip + Exam Progress stacked */}
              <div className="sight-col3-stack">
                {/* Master Tip */}
                <div className="sight-card sight-card--tip">
                  <button
                    className="sight-tip-toggle"
                    onClick={() => setTipOpen((o) => !o)}
                  >
                    <span className="sight-tip-toggle__label">Master Tip</span>
                    {tipOpen ? (
                      <IconChevronUp size={14} />
                    ) : (
                      <IconChevronDown size={14} />
                    )}
                  </button>
                  {tipOpen ? (
                    <p className="sight-tip-body">&ldquo;{colors.tip}&rdquo;</p>
                  ) : (
                    <p className="sight-tip-placeholder">
                      Sommelier guidance for this phase.
                    </p>
                  )}
                </div>

                {/* Exam Progress */}
                <div className="sight-card">
                  <div className="sight-card__label">Exam Progress</div>
                  <div className="sight-progress__meta">
                    <span className="sight-progress__stat-label">Sight</span>
                    <span className="sight-progress__pct">{pct}%</span>
                  </div>
                  <div className="sight-progress__bar-track">
                    {/* width is dynamic — the only necessary inline style */}
                    <div
                      className="sight-progress__bar-fill"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="sight-progress__steps">
                    {progressSteps.map(({ label, done }) => (
                      <div key={label} className="sight-progress__step">
                        <span
                          className={`sight-progress__step-dot${done ? " sight-progress__step-dot--done" : ""}`}
                        >
                          {done ? "●" : "○"}
                        </span>
                        <span
                          className={`sight-progress__step-name${done ? " sight-progress__step-name--done" : ""}`}
                        >
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 4, Cols 1–2 — Hue Rim / Secondary Hue */}
              <div className="sight-card sight-card--span-cols">
                <div className="sight-card__header">
                  <div className="sight-card__label">
                    {wineType === "red" ? "Hue Rim" : "Secondary Hue"}
                  </div>
                  <span className="sight-card__sublabel">Rim Quality</span>
                </div>
                {renderSwatches("Hue", colors.hue)}
              </div>
            </div>
            {/* end .sight-grid */}
          </div>
          {/* end .tasting-phase-content */}
        </main>
      </div>
      {/* end .tasting-phase-body */}

      {/* ── Sticky bottom bar ── */}
      <TastingFooter
        onReset={handleReset}
        backHref={`/tastings/start?wineType=${wineType}`}
        backLabel="← Back to Setup"
        nextLabel="Next: The Nose →"
        onNext={handleNextPhase}
      />
    </div>
  );
}
