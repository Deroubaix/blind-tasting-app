"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconSearch } from "@tabler/icons-react";
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

  const ic = tastingData.conclusion?.initial ?? {};
  const [varietalInput, setVarietalInput] = useState("");
  const [countryInput, setCountryInput] = useState("");

  const updateIC = (patch: Partial<NonNullable<typeof ic>>) =>
    updateTastingData({ conclusion: { ...tastingData.conclusion, initial: { ...ic, ...patch } } });

  const conclusionPct = Math.round(
    [ic.worldOrigin, ic.climate, ic.ageRange, (ic.grapeVarieties?.length ?? 0) > 0 ? "x" : null, (ic.possibleCountries?.length ?? 0) > 0 ? "x" : null]
      .filter(Boolean).length / 5 * 100,
  );

  const handleNextPhase = () => router.push(`/tastings/final-conclusion?wineType=${wineType}`);
  const handlePreviousPhase = () => router.push(`/tastings/palate?wineType=${wineType}`);

  const addVarietal = (input?: string) => {
    const v = (input ?? varietalInput).trim();
    if (v && !(ic.grapeVarieties ?? []).includes(v))
      updateIC({ grapeVarieties: [...(ic.grapeVarieties ?? []), v] });
    setVarietalInput("");
  };

  const addCountry = (input?: string) => {
    const c = (input ?? countryInput).trim();
    if (c && !(ic.possibleCountries ?? []).includes(c))
      updateIC({ possibleCountries: [...(ic.possibleCountries ?? []), c] });
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
                        className={`tasting-option${ic.worldOrigin === opt ? " tasting-option--selected" : ""}`}
                        onClick={() => updateIC({ worldOrigin: opt })}
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
                        className={`tasting-option${ic.climate === opt ? " tasting-option--selected" : ""}`}
                        onClick={() => updateIC({ climate: opt })}
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
                        className={`tasting-option${ic.ageRange === opt ? " tasting-option--selected" : ""}`}
                        onClick={() => updateIC({ ageRange: opt })}
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
                    <button className="tasting-confirm-btn" aria-label="Add grape variety" onClick={() => addVarietal()}>Add</button>
                  </div>
                  {(ic.grapeVarieties?.length ?? 0) > 0 && (
                    <div className="tasting-chips">
                      {ic.grapeVarieties!.map((v) => (
                        <span key={v} className="tasting-chip">
                          {v}
                          <button
                            className="tasting-chip__remove"
                            onClick={() => updateIC({ grapeVarieties: ic.grapeVarieties!.filter((x) => x !== v) })}
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
                    <button className="tasting-confirm-btn" aria-label="Add country" onClick={() => addCountry()}>Add</button>
                  </div>
                  {(ic.possibleCountries?.length ?? 0) > 0 && (
                    <div className="tasting-chips">
                      {ic.possibleCountries!.map((c) => (
                        <span key={c} className="tasting-chip">
                          {c}
                          <button
                            className="tasting-chip__remove"
                            onClick={() => updateIC({ possibleCountries: ic.possibleCountries!.filter((x) => x !== c) })}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>
    </TastingPhaseLayout>
  );
}
