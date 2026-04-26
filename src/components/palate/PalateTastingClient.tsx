"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTastingContext } from "../tasting/TastingContext";
import LeftSidebar from "../tasting/LeftSideBar";
import TastingPageHeader from "../layout/TastingPageHeader";
import TastingFooter from "../layout/TastingFooter";

const palateTastingOptions = {
  red: {
    Sweetness:  ["Bone Dry", "Dry", "Off-Dry", "Sweet"],
    Tannin:     ["Low", "Medium (-)", "Medium", "Medium (+)", "High"],
    Acid:       ["Low", "Medium (-)", "Medium", "Medium (+)", "High"],
    Alcohol:    ["Low", "Medium (-)", "Medium", "Medium (+)", "High"],
    Body:       ["Light", "Medium", "Full Bodied"],
    Texture:    ["Lean", "Round", "Creamy"],
    Finish:     ["Short", "Medium (-)", "Medium", "Medium (+)", "Long"],
    Complexity: ["Low", "Medium (-)", "Medium", "Medium (+)", "High"],
  },
  white: {
    Sweetness:  ["Bone Dry", "Dry", "Off-Dry", "Sweet"],
    Tannin:     ["Low", "Medium (-)", "Medium", "Medium (+)", "High"],
    Acid:       ["Low", "Medium (-)", "Medium", "Medium (+)", "High"],
    Alcohol:    ["Low", "Medium (-)", "Medium", "Medium (+)", "High"],
    Body:       ["Light", "Medium", "Full Bodied"],
    Texture:    ["Lean", "Round", "Creamy"],
    Finish:     ["Short", "Medium (-)", "Medium", "Medium (+)", "Long"],
    Complexity: ["Low", "Medium (-)", "Medium", "Medium (+)", "High"],
  },
};

export default function PalateTastingClient({
  wineType,
}: {
  wineType: "red" | "white";
}) {
  const router = useRouter();
  const { tastingData, updateTastingData } = useTastingContext();

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string | null>>(
    tastingData.palate || {},
  );
  const [confirmNose, setConfirmNose] = useState(tastingData.confirmNose || "");

  useEffect(() => {
    if (tastingData.palate) setSelectedOptions(tastingData.palate);
  }, [tastingData]);

  const currentOptions = palateTastingOptions[wineType];

  const handleOptionSelect = (category: string, option: string) => {
    setSelectedOptions((prev) => ({ ...prev, [category]: option }));
  };

  const handleNextPhase = () => {
    updateTastingData({ palate: selectedOptions, confirmNose });
    router.push(`/tastings/initial-conclusion?wineType=${wineType}`);
  };

  const handlePreviousPhase = () => {
    updateTastingData({ palate: selectedOptions, confirmNose });
    router.push(`/tastings/nose?wineType=${wineType}`);
  };

  const allKeys = Object.keys(currentOptions);
  const palatePct = Math.round(
    (allKeys.filter((k) => selectedOptions[k] != null).length / allKeys.length) * 100,
  );

  return (
    <div className="tasting-phase-page">
      <TastingPageHeader wineType={wineType} />
      <div className="tasting-phase-body">
        <LeftSidebar wineType={wineType} progress={palatePct} />
        <main className="tasting-phase-main">
          <div className="tasting-phase-content">

            {/* Page heading */}
            <div className="phase-label">Phase 03</div>
            <h1 className="phase-heading">The Palate</h1>
            <p className="phase-description">
              Analyze the structural components and flavor profile on the palate
              to confirm your nasal assessments.
            </p>

            {/* 2-column category grid */}
            <div className="palate-grid">
              {Object.entries(currentOptions).map(([category, options]) => (
                <div key={category} className="palate-card">
                  <div className="palate-card__label">{category}</div>
                  <div className="palate-options">
                    {options.map((option) => {
                      const selected = selectedOptions[category] === option;
                      return (
                        <button
                          key={option}
                          className={`palate-option${selected ? " palate-option--selected" : ""}`}
                          onClick={() => handleOptionSelect(category, option)}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Confirm the Nose */}
            <div className="palate-notes">
              <div className="palate-notes__header">
                <span className="palate-notes__label">Confirm the Nose</span>
                <span className="palate-notes__sublabel">Supplemental Notes</span>
              </div>
              <textarea
                className="palate-notes__textarea"
                rows={4}
                placeholder="Describe any secondary or tertiary notes that emerged on the palate..."
                value={confirmNose}
                onChange={(e) => setConfirmNose(e.target.value)}
              />
            </div>

          </div>
        </main>
      </div>
      <TastingFooter
        onBack={handlePreviousPhase}
        backLabel="← Back to Nose"
        nextLabel="Next: Initial Conclusion →"
        onNext={handleNextPhase}
      />
    </div>
  );
}
