"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconSearch, IconMapPin, IconTrash } from "@tabler/icons-react";
import { useTastingContext } from "../tasting/TastingContext";
import LeftSidebar from "../tasting/LeftSideBar";
import TastingPageHeader from "../layout/TastingPageHeader";
import TastingFooter from "../layout/TastingFooter";

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

  const addVarietal = () => {
    const v = varietalInput.trim();
    if (v && !grapeVarieties.includes(v)) setGrapeVarieties((prev) => [...prev, v]);
    setVarietalInput("");
  };

  const addCountry = () => {
    const c = countryInput.trim();
    if (c && !possibleCountries.includes(c)) setPossibleCountries((prev) => [...prev, c]);
    setCountryInput("");
  };

  return (
    <div className="tasting-phase-page">
      <TastingPageHeader wineType={wineType} />
      <div className="tasting-phase-body">
        <LeftSidebar wineType={wineType} progress={conclusionPct} />
        <main className="tasting-phase-main">
          <div className="tasting-phase-content">

            <div className="phase-label">Phase 04</div>
            <h1 className="phase-heading">Initial Conclusion</h1>

            <div className="ic-layout">

              {/* ── Left column ── */}
              <div className="ic-col">
                <div className="ic-section-label">Origin &amp; Environment</div>

                <div className="ic-card">
                  <div className="ic-card__label">World Origin</div>
                  <div className="ic-world-origin">
                    {["Old World", "New World"].map((opt) => (
                      <button
                        key={opt}
                        className={`ic-world-btn${worldOrigin === opt ? " ic-world-btn--selected" : ""}`}
                        onClick={() => setWorldOrigin(opt)}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="ic-card">
                  <div className="ic-card__label">Climate</div>
                  <div className="ic-options">
                    {["Cool", "Moderate", "Warm"].map((opt) => (
                      <button
                        key={opt}
                        className={`ic-option${climate === opt ? " ic-option--selected" : ""}`}
                        onClick={() => setClimate(opt)}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="ic-section-label ic-section-label--mt">Maturity</div>

                <div className="ic-card">
                  <div className="ic-card__label">Estimated Age Range (Years)</div>
                  <div className="ic-options">
                    {["1-3", "3-5", "5-10", "+10"].map((opt) => (
                      <button
                        key={opt}
                        className={`ic-option${ageRange === opt ? " ic-option--selected" : ""}`}
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

                <div className="ic-card">
                  <div className="ic-card__label">Grape Variety/Blend</div>
                  <div className="ic-search-row">
                    <div className="ic-search-input-wrap">
                      <IconSearch size={14} className="ic-search-icon" />
                      <input
                        className="ic-search-input"
                        placeholder="Search varietals..."
                        value={varietalInput}
                        onChange={(e) => setVarietalInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addVarietal()}
                      />
                    </div>
                    <button className="ic-confirm-btn" onClick={addVarietal}>Confirm</button>
                  </div>
                  {grapeVarieties.length > 0 && (
                    <div className="ic-chips">
                      {grapeVarieties.map((v) => (
                        <span key={v} className="ic-chip">
                          {v}
                          <button
                            className="ic-chip__remove"
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

                <div className="ic-card">
                  <div className="ic-card__label">Possible Countries</div>
                  <div className="ic-search-row">
                    <div className="ic-search-input-wrap">
                      <IconSearch size={14} className="ic-search-icon" />
                      <input
                        className="ic-search-input"
                        placeholder="Search countries..."
                        value={countryInput}
                        onChange={(e) => setCountryInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addCountry()}
                      />
                    </div>
                    <button className="ic-add-btn" onClick={addCountry}>Add</button>
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
          </div>
        </main>
      </div>
      <TastingFooter
        onBack={handlePreviousPhase}
        backLabel="← Back to Palate"
        nextLabel="Next: Final Conclusion →"
        onNext={handleNextPhase}
      />
    </div>
  );
}
