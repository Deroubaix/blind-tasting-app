"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  IconSearch,
  IconMapPin,
  IconMap,
  IconCalendar,
  IconChevronDown,
} from "@tabler/icons-react";
import { useTastingContext } from "../tasting/TastingContext";
import TastingPhaseLayout from "../layout/TastingPhaseLayout";
import PhaseHeading from "../layout/PhaseHeading";
import TastingAutocomplete from "./TastingAutocomplete";
import { GRAPE_VARIETALS, WINE_COUNTRIES } from "./autocompleteData";

const qualityTiers = [
  "Regional",
  "Village",
  "Premier Cru",
  "Grand Cru",
  "Single Vineyard",
  "Estate",
];

function AnalysisRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="fc-analysis__row">
      <div className="fc-analysis__row-label">{label}</div>
      <div className="fc-analysis__row-value">{value}</div>
    </div>
  );
}

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
  const [qualityOpen, setQualityOpen] = useState(false);
  const qualityRef = useRef<HTMLDivElement>(null);
  const [vintage, setVintage] = useState(saved["vintage"] ?? "");

  useEffect(() => {
    if (!qualityOpen) return;
    const handler = (e: MouseEvent) => {
      if (qualityRef.current && !qualityRef.current.contains(e.target as Node))
        setQualityOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [qualityOpen]);

  // Analysis summaries derived from prior phases
  const sightSummary = tastingData.sight
    ? Object.values(tastingData.sight).filter(Boolean).join(" · ")
    : "";
  const noseSummary = tastingData.nose
    ? Object.values(tastingData.nose).flat().filter(Boolean).join(" · ")
    : "";
  const palateSummary = tastingData.palate
    ? Object.values(tastingData.palate).filter(Boolean).join(" · ")
    : "";
  const initial = tastingData.conclusion?.initial;
  const initialCallSummary = initial
    ? [initial.worldOrigin, initial.climate, initial.ageRange, ...(initial.grapeVarieties ?? [])]
        .filter(Boolean)
        .join(" · ")
    : "";
  const possibleOriginSummary = (initial?.possibleCountries ?? []).join(" · ");
  const finalIdentity = [vintage, grapeVariety, qualityLevel, countryOfOrigin]
    .filter(Boolean)
    .join(" · ");

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

  const confirm = (input: string, setter: (v: string) => void, inputSetter: (v: string) => void) => {
    const v = input.trim();
    if (v) setter(v);
    inputSetter("");
  };

  return (
    <TastingPhaseLayout
      wineType={wineType}
      progress={conclusionPct}
      timerPage="finalConclusion"
      timerDestination={`/tastings/save?wineType=${wineType}`}
      footer={{
        onBack: handleBack,
        backLabel: "← Back to Initial Conclusion",
        nextLabel: "Review & Save →",
        onNext: handleNext,
      }}
    >
      <div className="fc-layout">

        {/* ── Left: heading + analysis panel ── */}
        <div className="fc-left">
          <PhaseHeading
            phase="Phase 05"
            title="Final Conclusion"
            description="Commit to your definitive identification. Synthesize everything — sight, nose, palate — into a single declaration."
          />

          <div className="fc-analysis">
            <div className="fc-analysis__header">
              <span className="fc-analysis__title">Your Analysis</span>
              <span className="fc-analysis__subtitle">Confirmed so far</span>
            </div>

            <AnalysisRow label="Color & Sight" value={sightSummary} />
            <AnalysisRow label="Primary Aromas" value={noseSummary} />
            <AnalysisRow label="Palate Structure" value={palateSummary} />
            <AnalysisRow label="Initial Call" value={initialCallSummary} />
            <AnalysisRow label="Possible Origin" value={possibleOriginSummary} />

            {finalIdentity && (
              <>
                <div className="fc-analysis__divider" />
                <div className="fc-analysis__row">
                  <div className="fc-analysis__row-label">Final Identity</div>
                  <div className="fc-analysis__row-value fc-analysis__row-value--identity">
                    {finalIdentity}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Right: form ── */}
        <div className="fc-right">
          <div className="fc-grid">

            {/* Grape Variety/Blend */}
            <div className="fc-field">
              <label className="tasting-card__label">Grape Variety / Blend</label>
              <div className="tasting-search-row">
                <TastingAutocomplete
                  suggestions={GRAPE_VARIETALS}
                  value={grapeInput}
                  onChange={setGrapeInput}
                  onConfirm={(v) => confirm(v, setGrapeVariety, setGrapeInput)}
                  placeholder="e.g., Pinot Noir"
                  icon={<IconSearch size={14} className="tasting-search-icon" />}
                />
                <button className="tasting-confirm-btn" onClick={() => confirm(grapeInput, setGrapeVariety, setGrapeInput)}>
                  Add
                </button>
              </div>
              {grapeVariety && (
                <div className="tasting-chips">
                  <span className="tasting-chip">
                    {grapeVariety}
                    <button className="tasting-chip__remove" onClick={() => setGrapeVariety("")}>×</button>
                  </span>
                </div>
              )}
            </div>

            {/* Country of Origin */}
            <div className="fc-field">
              <label className="tasting-card__label">Country of Origin</label>
              <div className="tasting-search-row">
                <TastingAutocomplete
                  suggestions={WINE_COUNTRIES}
                  value={countryInput}
                  onChange={setCountryInput}
                  onConfirm={(v) => confirm(v, setCountryOfOrigin, setCountryInput)}
                  placeholder="e.g., France"
                  icon={<IconMapPin size={14} className="tasting-search-icon" />}
                />
                <button className="tasting-confirm-btn" onClick={() => confirm(countryInput, setCountryOfOrigin, setCountryInput)}>
                  Add
                </button>
              </div>
              {countryOfOrigin && (
                <div className="tasting-chips">
                  <span className="tasting-chip">
                    {countryOfOrigin}
                    <button className="tasting-chip__remove" onClick={() => setCountryOfOrigin("")}>×</button>
                  </span>
                </div>
              )}
            </div>

            {/* Region/Appellation */}
            <div className="fc-field">
              <label className="tasting-card__label">Region / Appellation</label>
              <div className="tasting-search-row">
                <div className="tasting-search-input-wrap">
                  <IconMap size={14} className="tasting-search-icon" />
                  <input
                    className="tasting-search-input"
                    placeholder="e.g., Burgundy — Côte de Nuits"
                    value={regionInput}
                    onChange={(e) => setRegionInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && confirm(regionInput, setRegionAppellation, setRegionInput)}
                  />
                </div>
                <button className="tasting-confirm-btn" onClick={() => confirm(regionInput, setRegionAppellation, setRegionInput)}>
                  Add
                </button>
              </div>
              {regionAppellation && (
                <div className="tasting-chips">
                  <span className="tasting-chip">
                    {regionAppellation}
                    <button className="tasting-chip__remove" onClick={() => setRegionAppellation("")}>×</button>
                  </span>
                </div>
              )}
            </div>

            {/* Quality Level */}
            <div className="fc-field">
              <label className="tasting-card__label">Quality Level</label>
              <div className="tasting-select" ref={qualityRef}>
                <button
                  type="button"
                  className={`tasting-select__trigger${!qualityLevel ? " tasting-select__trigger--placeholder" : ""}`}
                  onClick={() => setQualityOpen(!qualityOpen)}
                >
                  {qualityLevel || "Select quality tier..."}
                  <IconChevronDown size={14} className={`tasting-select__chevron${qualityOpen ? " tasting-select__chevron--open" : ""}`} />
                </button>
                {qualityOpen && (
                  <ul className="tasting-select__dropdown">
                    {qualityTiers.map((tier) => (
                      <li key={tier}>
                        <button
                          type="button"
                          className={`tasting-select__option${qualityLevel === tier ? " tasting-select__option--selected" : ""}`}
                          onClick={() => { setQualityLevel(tier); setQualityOpen(false); }}
                        >
                          {tier}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Vintage */}
            <div className="fc-field fc-field--half">
              <label className="tasting-card__label">Vintage</label>
              <div className="tasting-search-row">
                <div className="tasting-search-input-wrap">
                  <IconCalendar size={14} className="tasting-search-icon" />
                  <input
                    className="tasting-search-input"
                    placeholder="Enter the harvest year"
                    maxLength={4}
                    value={vintage}
                    onChange={(e) => setVintage(e.target.value.replace(/\D/g, ""))}
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </TastingPhaseLayout>
  );
}
