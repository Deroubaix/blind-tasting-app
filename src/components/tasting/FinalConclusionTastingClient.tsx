"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  IconSearch,
  IconMapPin,
  IconMap,
  IconCalendar,
  IconChevronDown,
} from "@tabler/icons-react";
import { useTastingContext } from "../tasting/TastingContext";
import LeftSidebar from "../tasting/LeftSideBar";
import TastingPageHeader from "../layout/TastingPageHeader";
import TastingFooter from "../layout/TastingFooter";

const qualityTiers = [
  "Regional",
  "Village",
  "Premier Cru",
  "Grand Cru",
  "Single Vineyard",
  "Estate",
];

export default function FinalConclusionTastingClient({
  wineType,
}: {
  wineType: "red" | "white";
}) {
  const router = useRouter();
  const { tastingData, updateTastingData } = useTastingContext();

  const saved = tastingData.conclusion?.final ?? {};
  const [grapeVariety, setGrapeVariety] = useState(saved["grapeVariety"] ?? "");
  const [grapeInput, setGrapeInput] = useState("");
  const [countryOfOrigin, setCountryOfOrigin] = useState(saved["countryOfOrigin"] ?? "");
  const [countryInput, setCountryInput] = useState("");
  const [regionAppellation, setRegionAppellation] = useState(saved["regionAppellation"] ?? "");
  const [regionInput, setRegionInput] = useState("");
  const [qualityLevel, setQualityLevel] = useState(saved["qualityLevel"] ?? "");
  const [vintage, setVintage] = useState(saved["vintage"] ?? "");

  const conclusionPct = Math.round(
    [grapeVariety, countryOfOrigin, regionAppellation, qualityLevel, vintage]
      .filter(Boolean).length / 5 * 100,
  );

  const getCurrentData = () => ({
    grapeVariety,
    countryOfOrigin,
    regionAppellation,
    qualityLevel,
    vintage,
  });

  const handleNext = () => {
    updateTastingData({ conclusion: { ...tastingData.conclusion, final: getCurrentData() } });
    router.push(`/tastings/save?wineType=${wineType}`);
  };

  const handleBack = () => {
    updateTastingData({ conclusion: { ...tastingData.conclusion, final: getCurrentData() } });
    router.push(`/tastings/initial-conclusion?wineType=${wineType}`);
  };

  // Single-value confirm helper
  const confirm = (input: string, setter: (v: string) => void, inputSetter: (v: string) => void) => {
    const v = input.trim();
    if (v) setter(v);
    inputSetter("");
  };

  return (
    <div className="tasting-phase-page">
      <TastingPageHeader wineType={wineType} />
      <div className="tasting-phase-body">
        <LeftSidebar wineType={wineType} progress={conclusionPct} />
        <main className="tasting-phase-main">
          <div className="tasting-phase-content">

            <div className="phase-label">Phase 05</div>
            <h1 className="phase-heading">Final Conclusion</h1>
            <p className="phase-description">
              Synthesize your observations from sight, nose, and palate into a definitive
              identification of the wine.
            </p>

            <div className="fc-grid">

              {/* Grape Variety/Blend */}
              <div className="fc-field">
                <label className="fc-field__label">Grape Variety/Blend</label>
                <div className="ic-search-row">
                  <div className="ic-search-input-wrap">
                    <IconSearch size={14} className="ic-search-icon" />
                    <input
                      className="ic-search-input"
                      placeholder="e.g., Chardonnay"
                      value={grapeInput}
                      onChange={(e) => setGrapeInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && confirm(grapeInput, setGrapeVariety, setGrapeInput)}
                    />
                  </div>
                  <button className="ic-confirm-btn" onClick={() => confirm(grapeInput, setGrapeVariety, setGrapeInput)}>
                    Confirm
                  </button>
                </div>
                {grapeVariety && (
                  <div className="ic-chips">
                    <span className="ic-chip">
                      {grapeVariety}
                      <button className="ic-chip__remove" onClick={() => setGrapeVariety("")}>×</button>
                    </span>
                  </div>
                )}
              </div>

              {/* Country of Origin */}
              <div className="fc-field">
                <label className="fc-field__label">Country of Origin</label>
                <div className="ic-search-row">
                  <div className="ic-search-input-wrap">
                    <IconMapPin size={14} className="ic-search-icon" />
                    <input
                      className="ic-search-input"
                      placeholder="e.g., France"
                      value={countryInput}
                      onChange={(e) => setCountryInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && confirm(countryInput, setCountryOfOrigin, setCountryInput)}
                    />
                  </div>
                  <button className="ic-confirm-btn" onClick={() => confirm(countryInput, setCountryOfOrigin, setCountryInput)}>
                    Confirm
                  </button>
                </div>
                {countryOfOrigin && (
                  <div className="ic-chips">
                    <span className="ic-chip">
                      {countryOfOrigin}
                      <button className="ic-chip__remove" onClick={() => setCountryOfOrigin("")}>×</button>
                    </span>
                  </div>
                )}
              </div>

              {/* Region/Appellation */}
              <div className="fc-field">
                <label className="fc-field__label">Region/Appellation</label>
                <div className="ic-search-row">
                  <div className="ic-search-input-wrap">
                    <IconMap size={14} className="ic-search-icon" />
                    <input
                      className="ic-search-input"
                      placeholder="e.g., Burgundy (Côte de Beaune)"
                      value={regionInput}
                      onChange={(e) => setRegionInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && confirm(regionInput, setRegionAppellation, setRegionInput)}
                    />
                  </div>
                  <button className="ic-confirm-btn" onClick={() => confirm(regionInput, setRegionAppellation, setRegionInput)}>
                    Confirm
                  </button>
                </div>
                {regionAppellation && (
                  <div className="ic-chips">
                    <span className="ic-chip">
                      {regionAppellation}
                      <button className="ic-chip__remove" onClick={() => setRegionAppellation("")}>×</button>
                    </span>
                  </div>
                )}
              </div>

              {/* Quality Level */}
              <div className="fc-field">
                <label className="fc-field__label">Quality Level</label>
                <div className="fc-select-wrap">
                  <select
                    className="fc-select"
                    value={qualityLevel}
                    onChange={(e) => setQualityLevel(e.target.value)}
                  >
                    <option value="" disabled>Select quality tier...</option>
                    {qualityTiers.map((tier) => (
                      <option key={tier} value={tier}>{tier}</option>
                    ))}
                  </select>
                  <IconChevronDown size={16} className="fc-select__icon" />
                </div>
              </div>

              {/* Vintage — half-width */}
              <div className="fc-field fc-field--half">
                <label className="fc-field__label">Vintage</label>
                <div className="ic-search-row">
                  <div className="ic-search-input-wrap">
                    <IconCalendar size={14} className="ic-search-icon" />
                    <input
                      className="ic-search-input"
                      placeholder="YYYY"
                      maxLength={4}
                      value={vintage}
                      onChange={(e) => setVintage(e.target.value.replace(/\D/g, ""))}
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
      <TastingFooter
        onBack={handleBack}
        backLabel="← Back to Initial Conclusion"
        nextLabel="Save Tasting →"
        onNext={handleNext}
      />
    </div>
  );
}
