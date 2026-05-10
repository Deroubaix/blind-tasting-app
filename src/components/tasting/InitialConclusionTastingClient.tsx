"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconSearch, IconMapPin, IconTrash } from "@tabler/icons-react";
import { useTastingContext } from "../tasting/TastingContext";
import TastingPhaseLayout from "../layout/TastingPhaseLayout";
import PhaseHeading from "../layout/PhaseHeading";
import TastingAutocomplete from "./TastingAutocomplete";
import { GRAPE_VARIETALS, WINE_COUNTRIES } from "./autocompleteData";

export default function InitialConclusionTastingClient({
  wineType,
}: {
  wineType: "red" | "white";
}) {
  const router = useRouter();
  const { tastingData, updateTastingData } = useTastingContext();

  const initial = tastingData.conclusion?.initial;
  const [worldOrigin, setWorldOrigin] = useState<string | null>(initial?.worldOrigin ?? null);
  const [climate, setClimate] = useState<string | null>(initial?.climate ?? null);
  const [ageRange, setAgeRange] = useState<string | null>(initial?.ageRange ?? null);
  const [grapeVarieties, setGrapeVarieties] = useState<string[]>(initial?.grapeVarieties ?? []);
  const [possibleCountries, setPossibleCountries] = useState<string[]>(initial?.possibleCountries ?? []);
  const [varietalInput, setVarietalInput] = useState("");
  const [countryInput, setCountryInput] = useState("");

  const conclusionPct = Math.round(
    [worldOrigin, climate, ageRange, grapeVarieties.length ? "x" : null, possibleCountries.length ? "x" : null]
      .filter(Boolean).length / 5 * 100,
  );

  const getCurrentData = () => ({ worldOrigin, climate, ageRange, grapeVarieties, possibleCountries });

  const handleNextPhase = () => {
    updateTastingData({ conclusion: { ...tastingData.conclusion, initial: getCurrentData() } });
    router.push(`/tastings/final-conclusion?wineType=${wineType}`);
  };

  const handlePreviousPhase = () => {
    updateTastingData({ conclusion: { ...tastingData.conclusion, initial: getCurrentData() } });
    router.push(`/tastings/palate?wineType=${wineType}`);
  };

  const addVarietal = (input?: string) => {
    const v = (input ?? varietalInput).trim();
    if (v && !grapeVarieties.includes(v)) setGrapeVarieties((prev) => [...prev, v]);
    setVarietalInput("");
  };

  const addCountry = (input?: string) => {
    const c = (input ?? countryInput).trim();
    if (c && !possibleCountries.includes(c)) setPossibleCountries((prev) => [...prev, c]);
    setCountryInput("");
  };

  return (
    <TastingPhaseLayout
      wineType={wineType}
      progress={conclusionPct}
      timerPage="initialConclusion"
      timerDestination={`/tastings/final-conclusion?wineType=${wineType}`}
      footer={{
        onBack: handlePreviousPhase,
        backLabel: "← Back to Palate",
        nextLabel: "Next: Final Conclusion →",
        onNext: handleNextPhase,
      }}
    >
      <PhaseHeading
        phase="Phase 04"
        title="Initial Conclusion"
        description="Synthesize your observations from sight, nose, and palate to form your initial identification — origin, climate, grape variety, and age."
      />

            <div className="ic-layout">

              {/* ── Left column ── */}
              <div className="ic-col">
                <div className="ic-section-label">Origin &amp; Environment</div>

                <div className="tasting-card">
                  <div className="tasting-card__label">World Origin</div>
                  <div className="tasting-options tasting-options--equal">
                    {["Old World", "New World"].map((opt) => (
                      <button
                        key={opt}
                        className={`tasting-option${worldOrigin === opt ? " tasting-option--selected" : ""}`}
                        onClick={() => setWorldOrigin(opt)}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="tasting-card">
                  <div className="tasting-card__label">Climate</div>
                  <div className="tasting-options">
                    {["Cool", "Moderate", "Warm"].map((opt) => (
                      <button
                        key={opt}
                        className={`tasting-option${climate === opt ? " tasting-option--selected" : ""}`}
                        onClick={() => setClimate(opt)}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="ic-section-label ic-section-label--mt">Maturity</div>

                <div className="tasting-card">
                  <div className="tasting-card__label">Estimated Age Range (Years)</div>
                  <div className="tasting-options">
                    {["1-3", "3-5", "5-10", "+10"].map((opt) => (
                      <button
                        key={opt}
                        className={`tasting-option${ageRange === opt ? " tasting-option--selected" : ""}`}
                        onClick={() => setAgeRange(opt)}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── Right column ── */}
              <div className="ic-col">
                <div className="ic-section-label">Varietal Identification</div>

                <div className="tasting-card">
                  <div className="tasting-card__label">Grape Variety/Blend</div>
                  <div className="tasting-search-row">
                    <TastingAutocomplete
                      suggestions={GRAPE_VARIETALS}
                      value={varietalInput}
                      onChange={setVarietalInput}
                      onConfirm={addVarietal}
                      placeholder="Search varietals..."
                      icon={<IconSearch size={14} className="tasting-search-icon" />}
                    />
                    <button className="tasting-confirm-btn" onClick={() => addVarietal()}>Add</button>
                  </div>
                  {grapeVarieties.length > 0 && (
                    <div className="tasting-chips">
                      {grapeVarieties.map((v) => (
                        <span key={v} className="tasting-chip">
                          {v}
                          <button
                            className="tasting-chip__remove"
                            onClick={() => setGrapeVarieties((prev) => prev.filter((x) => x !== v))}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="ic-section-label ic-section-label--mt">Geographic Deduction</div>

                <div className="tasting-card">
                  <div className="tasting-card__label">Possible Countries</div>
                  <div className="tasting-search-row">
                    <TastingAutocomplete
                      suggestions={WINE_COUNTRIES}
                      value={countryInput}
                      onChange={setCountryInput}
                      onConfirm={addCountry}
                      placeholder="Search countries..."
                      icon={<IconSearch size={14} className="tasting-search-icon" />}
                    />
                    <button className="tasting-confirm-btn" onClick={() => addCountry()}>Add</button>
                  </div>
                  {possibleCountries.length > 0 && (
                    <ul className="ic-country-list">
                      {possibleCountries.map((c) => (
                        <li key={c} className="ic-country-item">
                          <IconMapPin size={14} className="ic-country-item__icon" />
                          <span className="ic-country-item__name">{c}</span>
                          <button
                            className="ic-country-item__remove"
                            onClick={() => setPossibleCountries((prev) => prev.filter((x) => x !== c))}
                          >
                            <IconTrash size={14} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

            </div>
    </TastingPhaseLayout>
  );
}
