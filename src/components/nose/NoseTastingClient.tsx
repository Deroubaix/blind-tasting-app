"use client";

import { useRouter } from "next/navigation";
import { useTastingContext } from "../tasting/TastingContext";
import { useEffect, useState } from "react";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import TastingPhaseLayout from "../layout/TastingPhaseLayout";
import PhaseHeading from "../layout/PhaseHeading";

// ── Single-select categories ───────────────────────────────────────────────────
const SINGLE_SELECT = new Set([
  "Clean or Faulty",
  "Intensity",
  "Age Assessment",
  "Fruit Character",
  "Condition",
  "Wood Aromas Origin",
  "Wood Aromas Condition",
]);

// ── Aroma data ─────────────────────────────────────────────────────────────────
const noseTastingOptions = {
  red: {
    "Clean or Faulty": ["Clean", "Faulty"],
    Intensity: ["Delicate", "Moderate", "Pronounced"],
    "Age Assessment": ["Youthful", "Vinous"],
    "Red Fruits": ["Cherry", "Raspberry", "Strawberry", "Cranberry"],
    "Blue Fruits": ["Plum", "Blueberry"],
    "Black Fruits": ["Blackberry", "Black Cherry", "Blackcurrant"],
    "Dried Fruits": ["Dates", "Figs", "Prunes"],
    "Fruit Character": ["Tart", "Ripe/Lush", "Jammy"],
    Condition: ["Fresh", "Dried"],
    Floral: ["Rose", "Lavender", "Violet", "Black Tea"],
    "Veg/Herbal": ["Savory Herbs", "Provençal Herbs", "Garrigue", "Tarragon", "Bell Pepper"],
    Spices: ["Black Pepper", "Anise", "Clove", "Juniper"],
    Animal: ["Barbecue", "Blood", "Game", "Grilled Meat", "Leather", "Stable", "Brett"],
    Nuts: ["Almond", "Hazelnut", "Marzipan", "Peanut", "Nutmeg"],
    Vinification: ["Butter", "Cream", "Rind", "Yogurt", "Brioche", "Dough", "Graham Cracker", "Bubblegum", "Botrytis"],
    Earth: ["Baked earth", "Compost", "Forest Floor", "Potting Soil", "Truffle", "Leaves", "Mushroom", "Hay", "Straw"],
    Rocks: ["Chalk", "Dust", "Flint/Gunpowder", "Granit", "Graphite", "Gravel", "Limestone", "Slate/Petrol", "Volcanic", "Tar", "Sea Spray"],
    "Wood Aromas": ["Vanilla", "Coconut", "Cigarbox", "Cedar", "Mocha", "Chocolate", "Cocoa", "Caramel", "Butterscotch", "Pencil Shavings"],
    "Wood Aromas Origin": ["French", "American", "Slavonian"],
    "Wood Aromas Condition": ["New", "Neutral", "Large"],
  },
  white: {
    "Clean or Faulty": ["Clean", "Faulty"],
    Intensity: ["Delicate", "Moderate", "Pronounced"],
    "Age Assessment": ["Youthful", "Vinous"],
    "Citrus Fruit": ["Lime", "Lemon", "Orange", "Grapefruit"],
    "Stone Fruit": ["Apricot", "Nectarine", "Peach"],
    "Orchard Fruit": ["Apple", "Pear", "Quince"],
    "Tropical Fruit": ["Pineapple", "Passionfruit", "Mango", "Melon", "Banana", "Lychee"],
    "Fruit Character": ["Tart", "Ripe/Lush", "Baked", "Jammy", "Dried", "Peel"],
    Condition: ["Fresh", "Dried"],
    Floral: ["Acacia", "Citrus Blossom", "Honeysuckle", "Jasmine", "Rose"],
    "Veg/Herbal/Spices": ["Gooseberry", "Asparagus", "Bellpepper", "Jalapeno", "Olives", "Tomato", "Bay Leaf", "Dill", "Eucalyptus/Mint", "Ginger", "Wasabi", "White Pepper", "Lanolin"],
    Nuts: ["Almond", "Hazelnut", "Marzipan", "Peanut", "Nutmeg"],
    Vinification: ["Butter", "Cream", "Rind", "Yogurt", "Brioche", "Dough", "Graham Cracker", "Bubblegum", "Botrytis"],
    Earth: ["Baked earth", "Compost", "Forest Floor", "Potting Soil", "Truffle", "Leaves", "Mushroom", "Hay", "Straw"],
    Rocks: ["Chalk", "Dust", "Flint/Gunpowder", "Granit", "Graphite", "Gravel", "Limestone", "Slate/Petrol", "Volcanic", "Tar", "Sea Spray"],
    "Wood Aromas": ["Vanilla", "Coconut", "Cigarbox", "Cedar", "Mocha", "Chocolate", "Cocoa", "Caramel", "Butterscotch", "Pencil Shavings"],
    "Wood Aromas Origin": ["French", "American", "Slavonian"],
    "Wood Aromas Condition": ["New", "Neutral", "Large"],
  },
};

// ── Fruit dot colors (SCSS modifier suffix per category) ──────────────────────
const fruitDotClass: Record<string, string> = {
  "Red Fruits":     "red",
  "Blue Fruits":    "blue",
  "Black Fruits":   "black",
  "Dried Fruits":   "dried",
  "Citrus Fruit":   "citrus",
  "Stone Fruit":    "stone",
  "Orchard Fruit":  "orchard",
  "Tropical Fruit": "tropical",
};

// ── Section groupings ──────────────────────────────────────────────────────────
const topAssessmentKeys: Record<"red" | "white", string[]> = {
  red:   ["Clean or Faulty", "Intensity", "Age Assessment"],
  white: ["Clean or Faulty", "Intensity", "Age Assessment"],
};

// Actual fruit types — rendered without card background
const primaryFruitTypeKeys: Record<"red" | "white", string[]> = {
  red:   ["Red Fruits", "Blue Fruits", "Black Fruits", "Dried Fruits"],
  white: ["Citrus Fruit", "Stone Fruit", "Orchard Fruit", "Tropical Fruit"],
};

// Assessment rows — rendered with card background
const primaryFruitAssessmentKeys: Record<"red" | "white", string[]> = {
  red:   ["Fruit Character", "Condition"],
  white: ["Fruit Character", "Condition"],
};

// Combined for progress calculation
const primaryFruitKeys: Record<"red" | "white", string[]> = {
  red:   [...primaryFruitTypeKeys.red,   ...primaryFruitAssessmentKeys.red],
  white: [...primaryFruitTypeKeys.white, ...primaryFruitAssessmentKeys.white],
};

const complexSecondaryKeys: Record<"red" | "white", string[]> = {
  red:   ["Floral", "Veg/Herbal", "Spices", "Animal", "Nuts", "Vinification", "Earth", "Rocks"],
  white: ["Floral", "Veg/Herbal/Spices", "Nuts", "Vinification", "Earth", "Rocks"],
};

// Wood Aromas: descriptor (no bg) — Origin + Condition: assessment (split card)
const woodAromaKeys: Record<"red" | "white", string[]> = {
  red:   ["Wood Aromas"],
  white: ["Wood Aromas"],
};

const woodAssessmentKeys: Record<"red" | "white", string[]> = {
  red:   ["Wood Aromas Origin", "Wood Aromas Condition"],
  white: ["Wood Aromas Origin", "Wood Aromas Condition"],
};

// Combined for progress calculation
const woodExposureKeys: Record<"red" | "white", string[]> = {
  red:   [...woodAromaKeys.red,   ...woodAssessmentKeys.red],
  white: [...woodAromaKeys.white, ...woodAssessmentKeys.white],
};

// ── Component ──────────────────────────────────────────────────────────────────
export default function NoseTastingClient({
  wineType,
}: {
  wineType: "red" | "white";
}) {
  const router = useRouter();
  const { tastingData, updateTastingData } = useTastingContext();

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>(
    (tastingData.nose as Record<string, string[]>) || {},
  );
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({});
  const [showCustomInput, setShowCustomInput] = useState<Record<string, boolean>>({});
  const [complexOpen, setComplexOpen] = useState(false);
  const [woodOpen, setWoodOpen] = useState(false);

  useEffect(() => {
    if (tastingData.nose) {
      setSelectedOptions(tastingData.nose as Record<string, string[]>);
    }
  }, [tastingData]);

  const handleOptionToggle = (category: string, option: string) => {
    setSelectedOptions((prev) => {
      const current = prev[category] || [];
      if (SINGLE_SELECT.has(category)) {
        return { ...prev, [category]: current[0] === option ? [] : [option] };
      }
      const exists = current.includes(option);
      return {
        ...prev,
        [category]: exists ? current.filter((o) => o !== option) : [...current, option],
      };
    });
  };

  const handleAddCustom = (category: string) => {
    const value = customInputs[category]?.trim();
    if (!value) return;
    setSelectedOptions((prev) => {
      const current = prev[category] || [];
      if (current.includes(value)) return prev;
      return { ...prev, [category]: [...current, value] };
    });
    setCustomInputs((prev) => ({ ...prev, [category]: "" }));
    setShowCustomInput((prev) => ({ ...prev, [category]: false }));
  };

  const handleRemoveCustom = (category: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [category]: (prev[category] || []).filter((o) => o !== value),
    }));
  };

  const handleNextPhase = () => {
    updateTastingData({ nose: selectedOptions });
    router.push(`/tastings/palate?wineType=${wineType}`);
  };

  const handlePreviousPhase = () => {
    updateTastingData({ nose: selectedOptions });
    router.push(`/tastings/sight?wineType=${wineType}`);
  };

  const countSelected = (keys: string[]) =>
    keys.reduce((total, cat) => total + (selectedOptions[cat]?.length || 0), 0);

  // Overall nose completion %
  const allNoseKeys = [
    ...topAssessmentKeys[wineType],
    ...primaryFruitKeys[wineType],
    ...complexSecondaryKeys[wineType],
    ...woodExposureKeys[wineType],
  ];
  const nosePct = Math.round(
    (allNoseKeys.filter((k) => (selectedOptions[k]?.length || 0) > 0).length /
      allNoseKeys.length) *
      100,
  );

  const presetOptions = noseTastingOptions[wineType] as Record<string, string[]>;

  // ── Sub-renderers ────────────────────────────────────────────────────────────

  // Shared pill renderer — used by both card and fruit variants
  const renderPills = (category: string, options: string[], selections: string[], customValues: string[], equalWidth = false) => (
    <div className={`tasting-options${equalWidth ? " tasting-options--equal" : ""}`}>
      {options.map((option) => {
        const selected = selections.includes(option);
        return (
          <button
            key={option}
            onClick={() => handleOptionToggle(category, option)}
            className={`tasting-option${selected ? " tasting-option--selected" : ""}`}
          >
            {option}
          </button>
        );
      })}
      {customValues.map((val) => (
        <button
          key={val}
          onClick={() => handleRemoveCustom(category, val)}
          className="tasting-option tasting-option--selected"
          title="Click to remove"
        >
          {val} ×
        </button>
      ))}
      {!SINGLE_SELECT.has(category) && (
        showCustomInput[category] ? (
          <span className="nose-other-input">
            <input
              type="text"
              className="tasting-input"
              value={customInputs[category] || ""}
              onChange={(e) =>
                setCustomInputs((prev) => ({ ...prev, [category]: e.target.value }))
              }
              placeholder="Type custom note..."
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddCustom(category);
                if (e.key === "Escape")
                  setShowCustomInput((prev) => ({ ...prev, [category]: false }));
              }}
              autoFocus
            />
            <button className="tasting-option" onClick={() => handleAddCustom(category)}>
              Add
            </button>
            <button
              className="tasting-option"
              onClick={() => setShowCustomInput((prev) => ({ ...prev, [category]: false }))}
            >
              ✕
            </button>
          </span>
        ) : (
          <button
            className="tasting-option tasting-option--ghost"
            onClick={() => setShowCustomInput((prev) => ({ ...prev, [category]: true }))}
          >
            + Other
          </button>
        )
      )}
    </div>
  );

  // Renders inside a .nose-card (with dark background — top assessment, complex, wood)
  const renderCategory = (category: string, equalWidth = false) => {
    const options = presetOptions[category];
    const selections = selectedOptions[category] || [];
    const presetSet = new Set(options);
    const customValues = selections.filter((v) => !presetSet.has(v));

    return (
      <>
        <div className="tasting-card__label">{category}</div>
        {renderPills(category, options, selections, customValues, equalWidth)}
      </>
    );
  };

  // Renders inside a .nose-fruit-category (no background) with colored dot
  const renderFruitCategory = (category: string) => {
    const options = presetOptions[category];
    const selections = selectedOptions[category] || [];
    const presetSet = new Set(options);
    const customValues = selections.filter((v) => !presetSet.has(v));
    const dotClass = fruitDotClass[category];

    return (
      <>
        <div className="nose-fruit-category__label">
          {dotClass && <span className={`nose-fruit-dot nose-fruit-dot--${dotClass}`} />}
          {category}
        </div>
        {renderPills(category, options, selections, customValues)}
      </>
    );
  };

  // Renders a collapsible section header button
  const renderSectionHeader = (
    title: string,
    isOpen: boolean,
    onToggle: () => void,
    selectedCount: number,
  ) => (
    <button className="nose-section-header" onClick={onToggle}>
      <span className="nose-section-header__title">{title}</span>
      <span className="nose-section-header__right">
        {!isOpen && selectedCount > 0 && (
          <span className="nose-section-header__count">{selectedCount} selected</span>
        )}
        {isOpen ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
      </span>
    </button>
  );

  // ── Markup ───────────────────────────────────────────────────────────────────
  return (
    <TastingPhaseLayout
      wineType={wineType}
      progress={nosePct}
      timerPage="nose"
      timerDestination={`/tastings/palate?wineType=${wineType}`}
      footer={{
        onBack: handlePreviousPhase,
        backLabel: "← Back to Sight",
        nextLabel: "Next: Palate →",
        onNext: handleNextPhase,
      }}
    >
      <PhaseHeading
        phase="Phase 02"
        title="The Nose"
        description="Assess the aromatic profile — start with condition and intensity, then identify fruit, secondary, and tertiary aromas."
      />

            {/* ── Top assessment (3 cols) ── */}
            <div className="nose-grid">
              {topAssessmentKeys[wineType].map((cat) => (
                <div key={cat} className="tasting-card">
                  {renderCategory(cat)}
                </div>
              ))}
            </div>

            {/* ── Primary Fruit Profile ── */}
            <div className="nose-section-divider">
              <span className="nose-section-divider__title">Primary Fruit Profile</span>
            </div>

            {/* Fruit types — no card background */}
            <div className="nose-grid nose-grid--two-col">
              {primaryFruitTypeKeys[wineType].map((cat) => (
                <div key={cat} className="nose-fruit-category">
                  {renderFruitCategory(cat)}
                </div>
              ))}
            </div>

            {/* Fruit Character + Condition — separate cards, equal-width buttons */}
            <div className="nose-grid nose-grid--two-col">
              {primaryFruitAssessmentKeys[wineType].map((cat) => (
                <div key={cat} className="tasting-card">
                  {renderCategory(cat, true)}
                </div>
              ))}
            </div>

            {/* ── Complex & Secondary Aromas (collapsible) ── */}
            {renderSectionHeader(
              "Complex & Secondary Aromas",
              complexOpen,
              () => setComplexOpen((o) => !o),
              countSelected(complexSecondaryKeys[wineType]),
            )}
            <div className={`nose-collapsible${complexOpen ? "" : " nose-collapsible--collapsed"}`}>
              <div className="nose-collapsible__inner">
                {/* Descriptor categories — no background */}
                <div className="nose-grid">
                  {complexSecondaryKeys[wineType].map((cat) => (
                    <div key={cat} className="nose-fruit-category">
                      {renderFruitCategory(cat)}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Wood Exposure Assessment (collapsible) ── */}
            {renderSectionHeader(
              "Wood Exposure Assessment",
              woodOpen,
              () => setWoodOpen((o) => !o),
              countSelected(woodExposureKeys[wineType]),
            )}
            <div className={`nose-collapsible${woodOpen ? "" : " nose-collapsible--collapsed"}`}>
              <div className="nose-collapsible__inner">
                <div className="nose-wood-layout">
                  {/* Wood Aromas — left, no background */}
                  <div className="nose-fruit-category nose-wood-layout__aromas">
                    {renderFruitCategory("Wood Aromas")}
                  </div>

                  {/* Origin + Condition — right, stacked, individual cards */}
                  <div className="nose-wood-layout__assessment">
                    {woodAssessmentKeys[wineType].map((cat) => (
                      <div key={cat} className="tasting-card">
                        {renderCategory(cat, true)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

    </TastingPhaseLayout>
  );
}
