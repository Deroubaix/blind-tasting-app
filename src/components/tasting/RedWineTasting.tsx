"use client";

import React, { useState } from "react";
import OtherInputButton from "./OtherInputButton";

export default function RedWineTasting() {
  const [currentPhase, setCurrentPhase] = useState<
    "sight" | "nose" | "palate" | "initialConclusion" | "finalConclusion"
  >("sight");

  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string | null>
  >({});

  const handleOptionSelect = (category: string, option: string) => {
    setSelectedOptions((prev) => ({ ...prev, [category]: option }));
  };

  const canProceedToNextPhase = (): boolean => {
    const requiredCategories = {
      sight: [
        "Clarity",
        "Brightness",
        "Concentration",
        "Color",
        "Viscosity",
        "Stained Tears",
        "Gas Evidence",
        "Sendiment",
        "Sediment, Particles",
      ],
      nose: [
        "Clean or Faulty",
        "Intensity",
        "Age Assessment",
        "Red Fruits",
        "Blue Fruits",
        "Black Fruits",
        "Dried Fruits",
        "Fruit Character",
        "Floral",
        "Condition",
        "Veg/Herbal",
        "Spices",
        "Animal",
        "Nuts",
        "Vanification",
        "Earth",
        "Rocks",
        "Wood Aromas",
        "Wood Aromas Origin",
        "Wood Aromas Condition",
      ],
      palate: ["Sweetness", "Tannin", "Acid", "Alcohol", "Body", "Texture"],
      initialConclusion: ["Old World or New World", "Climate", "Age Range"],
      finalConclusion: ["Grape Variety/Blend", "Country of Origin"],
    };

    const categories = requiredCategories[currentPhase] || [];
    return categories.every((category) => selectedOptions[category]);
  };

  const handleNextPhase = () => {
    if (!canProceedToNextPhase()) {
      alert("Please select at least one option for all categories.");
      return;
    }

    if (currentPhase === "sight") setCurrentPhase("nose");
    else if (currentPhase === "nose") setCurrentPhase("palate");
    else if (currentPhase === "palate") setCurrentPhase("initialConclusion");
    else if (currentPhase === "initialConclusion")
      setCurrentPhase("finalConclusion");
  };

  const handlePreviousPhase = () => {
    if (currentPhase === "finalConclusion")
      setCurrentPhase("initialConclusion");
    else if (currentPhase === "initialConclusion") setCurrentPhase("palate");
    else if (currentPhase === "palate") setCurrentPhase("nose");
    else if (currentPhase === "nose") setCurrentPhase("sight");
  };

  return (
    <section className="red-wine-tasting">
      <header>
        <h1>Red Wine Tasting</h1>
        <p>Phase: {currentPhase.toUpperCase()}</p>
      </header>

      {currentPhase === "sight" && (
        <>
          <h2>Sight</h2>
          <h3>Clarity</h3>
          <button onClick={() => handleOptionSelect("Clarity", "Clear")}>
            Clear
          </button>
          <button
            onClick={() => handleOptionSelect("Clarity", "Slight Cloudy")}
          >
            Slight Cloudy
          </button>

          <h3>Brightness</h3>
          <button onClick={() => handleOptionSelect("Brightness", "Hazy")}>
            Hazy
          </button>
          <button
            onClick={() => handleOptionSelect("Brightness", "Day Bright")}
          >
            Day Bright
          </button>
          <button
            onClick={() => handleOptionSelect("Brightness", "Star Bright")}
          >
            Star Bright
          </button>

          <h3>Concentration</h3>
          <button onClick={() => handleOptionSelect("Concentration", "Pale")}>
            Pale
          </button>
          <button
            onClick={() => handleOptionSelect("Concentration", "Moderate")}
          >
            Moderate
          </button>
          <button onClick={() => handleOptionSelect("Concentration", "Deep")}>
            Deep
          </button>

          <h3>Color</h3>
          <button onClick={() => handleOptionSelect("Color", "Purple")}>
            Purple
          </button>
          <button onClick={() => handleOptionSelect("Color", "Ruby")}>
            Ruby
          </button>
          <button onClick={() => handleOptionSelect("Color", "Garnet")}>
            Garnet
          </button>

          <h3>Hue</h3>
          <button onClick={() => handleOptionSelect("Hue", "Blue")}>
            Blue
          </button>
          <button onClick={() => handleOptionSelect("Hue", "Pink")}>
            Pink
          </button>
          <button onClick={() => handleOptionSelect("Hue", "Garnet")}>
            Garnet
          </button>

          <h3>Viscosity</h3>
          <button onClick={() => handleOptionSelect("Viscosity", "Low")}>
            Low
          </button>
          <button onClick={() => handleOptionSelect("Viscosity", "Medium")}>
            Medium
          </button>
          <button onClick={() => handleOptionSelect("Viscosity", "High")}>
            High
          </button>

          <h3>Stained Tears</h3>
          <button onClick={() => handleOptionSelect("Stained Tears", "No")}>
            No
          </button>
          <button onClick={() => handleOptionSelect("Stained Tears", "Yes")}>
            Yes
          </button>

          <h3>Gas Evidence</h3>
          <button onClick={() => handleOptionSelect("Gas Evidence", "No")}>
            No
          </button>
          <button onClick={() => handleOptionSelect("Gas Evidence", "Yes")}>
            Yes
          </button>

          <h3>Sediment, Particles</h3>
          <button
            onClick={() => handleOptionSelect("Sediment, Particles", "No")}
          >
            No
          </button>
          <button
            onClick={() => handleOptionSelect("Sediment, Particles", "Yes")}
          >
            Yes
          </button>

          <div className="navigation-buttons">
            <button onClick={handleNextPhase}>Next</button>
          </div>
        </>
      )}

      {currentPhase === "nose" && (
        <>
          <h2>Nose</h2>
          <h3>Clean or Faulty</h3>
          <button
            onClick={() => handleOptionSelect("Clean or Faulty", "Clean")}
          >
            Clean
          </button>
          <button
            onClick={() => handleOptionSelect("Clean or Faulty", "Faulty")}
          >
            Faulty
          </button>
          <OtherInputButton label="Faulty Reason" />

          <h3>Intensity</h3>
          <button onClick={() => handleOptionSelect("Intensity", "Delicate")}>
            Delicate
          </button>
          <button onClick={() => handleOptionSelect("Intensity", "Moderate")}>
            Moderate
          </button>
          <button onClick={() => handleOptionSelect("Intensity", "Pronounced")}>
            Pronounced
          </button>

          <h3>Age Assessment</h3>
          <button
            onClick={() => handleOptionSelect("Age Assessment", "Youthful")}
          >
            Youthful
          </button>
          <button
            onClick={() => handleOptionSelect("Age Assessment", "Vinous")}
          >
            Vinous
          </button>

          <h3>Red Fruits</h3>
          <button onClick={() => handleOptionSelect("Red Fruits", "Cherry")}>
            Cherry
          </button>
          <button onClick={() => handleOptionSelect("Red Fruits", "Raspberry")}>
            Raspberry
          </button>
          <button
            onClick={() => handleOptionSelect("Red Fruits", "Strawberry")}
          >
            Strawberry
          </button>
          <button onClick={() => handleOptionSelect("Red Fruits", "Cranberry")}>
            Cranberry
          </button>

          <h3>Blue Fruits</h3>
          <button onClick={() => handleOptionSelect("Blue Fruits", "Plum")}>
            Plum
          </button>
          <button
            onClick={() => handleOptionSelect("Blue Fruits", "Blueberry")}
          >
            Blueberry
          </button>

          <h3>Black Fruits</h3>
          <button
            onClick={() => handleOptionSelect("Black Fruits", "Blackberry")}
          >
            Blackberry
          </button>
          <button
            onClick={() => handleOptionSelect("Black Fruits", "Black Cherry")}
          >
            Black Cherry
          </button>
          <button
            onClick={() => handleOptionSelect("Black Fruits", "Blackcurrant")}
          >
            Blackcurrant
          </button>

          <h3>Dried Fruits</h3>
          <button onClick={() => handleOptionSelect("Dried Fruits", "Dates")}>
            Dates
          </button>
          <button onClick={() => handleOptionSelect("Dried Fruits", "Figs")}>
            Figs
          </button>
          <button onClick={() => handleOptionSelect("Dried Fruits", "Prunes")}>
            Prunes
          </button>

          <h3>Fruit Character</h3>
          <button onClick={() => handleOptionSelect("Fruit Character", "Tart")}>
            Tart
          </button>
          <button
            onClick={() => handleOptionSelect("Fruit Character", "Ripe/Lush")}
          >
            Ripe/Lush
          </button>
          <button
            onClick={() => handleOptionSelect("Fruit Character", "Jammy")}
          >
            Jammy
          </button>
          <button
            onClick={() => handleOptionSelect("Fruit Character", "Baked")}
          >
            Baked
          </button>
          <button
            onClick={() => handleOptionSelect("Fruit Character", "Stewed")}
          >
            Stewed
          </button>
          <button
            onClick={() => handleOptionSelect("Fruit Character", "Dried")}
          >
            Dried
          </button>

          <h3>Floral</h3>
          <button onClick={() => handleOptionSelect("Floral", "Rose")}>
            Rose
          </button>
          <button onClick={() => handleOptionSelect("Floral", "Lavender")}>
            Lavender
          </button>
          <button onClick={() => handleOptionSelect("Floral", "Violet")}>
            Violet
          </button>
          <button onClick={() => handleOptionSelect("Floral", "Black Tea")}>
            Black Tea
          </button>
          <OtherInputButton label="Floral" />

          <h3>Condition</h3>
          <button onClick={() => handleOptionSelect("Condition", "Fresh")}>
            Fresh
          </button>
          <button onClick={() => handleOptionSelect("Condition", "Dried")}>
            Dried
          </button>

          <h3>Veg/Herbal</h3>
          <button
            onClick={() => handleOptionSelect("Veg/Herbal", "Savory Herbs")}
          >
            Savory Herbs
          </button>
          <button
            onClick={() => handleOptionSelect("Veg/Herbal", "Provençal Herbs")}
          >
            Provençal Herbs
          </button>
          <button onClick={() => handleOptionSelect("Veg/Herbal", "Garrigue")}>
            Garrigue
          </button>
          <button onClick={() => handleOptionSelect("Veg/Herbal", "Tarragon")}>
            Tarragon
          </button>
          <button
            onClick={() => handleOptionSelect("Veg/Herbal", "Bell Pepper")}
          >
            Bell Pepper
          </button>
          <button onClick={() => handleOptionSelect("Veg/Herbal", "Olives")}>
            Olives
          </button>
          <button
            onClick={() => handleOptionSelect("Veg/Herbal", "Mint/Eucalyptus")}
          >
            Mint/Eucalyptus
          </button>
          <button onClick={() => handleOptionSelect("Veg/Herbal", "Dill")}>
            Dill
          </button>
          <button onClick={() => handleOptionSelect("Veg/Herbal", "Beet")}>
            Beet
          </button>
          <button
            onClick={() => handleOptionSelect("Veg/Herbal", "Tomato Leaf")}
          >
            Tomato Leaf
          </button>
          <OtherInputButton label="Veg/Herbal" />

          <h3>Spices</h3>
          <button onClick={() => handleOptionSelect("Spices", "Black Pepper")}>
            Black Pepper
          </button>
          <button onClick={() => handleOptionSelect("Spices", "Anise")}>
            Anise
          </button>
          <button onClick={() => handleOptionSelect("Spicesn", "Clove")}>
            Clove
          </button>
          <button onClick={() => handleOptionSelect("Spices", "Juniper")}>
            Juniper
          </button>
          <OtherInputButton label="Spices" />

          <h3>Animal</h3>
          <button onClick={() => handleOptionSelect("Animal", "Barbecue")}>
            Barbecue
          </button>
          <button onClick={() => handleOptionSelect("Animal", "Blood")}>
            Blood
          </button>
          <button onClick={() => handleOptionSelect("Animal", "Game")}>
            Game
          </button>
          <button onClick={() => handleOptionSelect("Animal", "Grilled Meat")}>
            Grilled Meat
          </button>
          <button onClick={() => handleOptionSelect("Animal", "Leather")}>
            Leather
          </button>
          <button onClick={() => handleOptionSelect("Animal", "Stable")}>
            Stable
          </button>
          <button onClick={() => handleOptionSelect("Animal", "Brett")}>
            Brett
          </button>
          <OtherInputButton label="Animal" />

          <h3>Nuts</h3>
          <button onClick={() => handleOptionSelect("Nuts", "Almond")}>
            Almond
          </button>
          <button onClick={() => handleOptionSelect("Nuts", "Hazelnut")}>
            Hazelnut
          </button>
          <button onClick={() => handleOptionSelect("Nuts", "Marzipan")}>
            Marzipan
          </button>
          <button onClick={() => handleOptionSelect("Nuts", "Peanut")}>
            Peanut
          </button>
          <button onClick={() => handleOptionSelect("Nuts", "Nutmeg")}>
            Nutmeg
          </button>
          <OtherInputButton label="Nuts" />

          <h3>Vanification</h3>
          <button onClick={() => handleOptionSelect("Vanification", "Butter")}>
            Butter
          </button>
          <button onClick={() => handleOptionSelect("Vanification", "Cream")}>
            Cream
          </button>
          <button onClick={() => handleOptionSelect("Vanification", "Rind")}>
            Rind
          </button>
          <button onClick={() => handleOptionSelect("Vanification", "Yougurt")}>
            Yogurt
          </button>
          <button onClick={() => handleOptionSelect("Vanification", "Brioche")}>
            Brioche
          </button>
          <button onClick={() => handleOptionSelect("Vanification", "Dough")}>
            Dough
          </button>
          <button
            onClick={() => handleOptionSelect("Vanification", "Graham Cracker")}
          >
            Graham Cracker
          </button>
          <button
            onClick={() => handleOptionSelect("Vanification", "Bubblegum")}
          >
            Bubblegum
          </button>
          <button
            onClick={() => handleOptionSelect("Vanification", "Botrytis")}
          >
            Botrytis
          </button>
          <OtherInputButton label="Nuts" />

          <h3>Earth</h3>
          <button onClick={() => handleOptionSelect("Earth", "Baked earth")}>
            Baked earth
          </button>
          <button onClick={() => handleOptionSelect("Earthn", "Compost")}>
            Compost
          </button>
          <button onClick={() => handleOptionSelect("Earth", "Forest Floor")}>
            Forest Floor
          </button>
          <button onClick={() => handleOptionSelect("Earth", "Potting Soil")}>
            Potting Soil
          </button>
          <button onClick={() => handleOptionSelect("Earth", "Truffle")}>
            Truffle
          </button>
          <button onClick={() => handleOptionSelect("Earth", "Leaves")}>
            Leaves
          </button>
          <button onClick={() => handleOptionSelect("Earth", "Mushroom")}>
            Mushroom
          </button>
          <button onClick={() => handleOptionSelect("Earth", "Hay")}>
            Hay
          </button>
          <button onClick={() => handleOptionSelect("Earth", "Straw")}>
            Straw
          </button>
          <OtherInputButton label="Nuts" />

          <h3>Rocks</h3>
          <button>Chalk</button>
          <button>Dust</button>
          <button>Flint/Gunpowder</button>
          <button>Granit</button>
          <button>Graphite</button>
          <button>Gravel</button>
          <button>Limestone</button>
          <button>Slate/Petrol</button>
          <button>Volcanic</button>
          <button>Tar</button>
          <button>Sea Spray</button>
          <OtherInputButton label="Rocks" />

          <h3>Wood Aromas</h3>
          <button onClick={() => handleOptionSelect("Wood Aromas", "Vanilla")}>
            Vanilla
          </button>
          <button onClick={() => handleOptionSelect("Wood Aromas", "Coconut")}>
            Coconut
          </button>
          <button onClick={() => handleOptionSelect("Wood Aromas", "Cigarbox")}>
            Cigarbox
          </button>
          <button onClick={() => handleOptionSelect("Wood Aromas", "Cedar")}>
            Cedar
          </button>
          <button onClick={() => handleOptionSelect("Wood Aromas", "Mocha")}>
            Mocha
          </button>
          <button
            onClick={() => handleOptionSelect("Wood Aromas", "Chocolate")}
          >
            Chocolate
          </button>
          <button onClick={() => handleOptionSelect("Wood Aromas", "Cocoa")}>
            Cocoa
          </button>
          <button onClick={() => handleOptionSelect("Wood Aromas", "Caramel")}>
            Caramel
          </button>
          <button
            onClick={() => handleOptionSelect("Wood Aromas", "Butterscotch")}
          >
            Butterscotch
          </button>
          <button
            onClick={() => handleOptionSelect("Wood Aromas", "Pencil Shavings")}
          >
            Pencil Shavings
          </button>
          <OtherInputButton label="Wood Aromas" />

          <h5>Origin</h5>
          <button
            onClick={() => handleOptionSelect("Wood Aromas Origin", "French")}
          >
            French
          </button>
          <button
            onClick={() => handleOptionSelect("Wood Aromas Origin", "American")}
          >
            American
          </button>
          <button
            onClick={() =>
              handleOptionSelect("Wood Aromas Origin", "Slavonian")
            }
          >
            Slavonian
          </button>

          <h5>Condition</h5>
          <button
            onClick={() => handleOptionSelect("Wood Aromas Condition", "New")}
          >
            New
          </button>
          <button
            onClick={() =>
              handleOptionSelect("Wood Aromas Condition", "Neutral")
            }
          >
            Neutral
          </button>
          <button
            onClick={() => handleOptionSelect("Wood Aromas Condition", "Large")}
          >
            Large
          </button>

          <div className="navigation-buttons">
            <button onClick={handlePreviousPhase}>Back</button>
            <button onClick={handleNextPhase}>Next</button>
          </div>
        </>
      )}

      {currentPhase === "palate" && (
        <>
          <h2>Palate (30 sec)</h2>
          <h3>Sweetness</h3>
          <button>Bone Dry</button>
          <button>Dry</button>
          <button>Off-Dry</button>
          <button>Sweet</button>

          <h3>Tannin</h3>
          <button>Low</button>
          <button>Medium(-)</button>
          <button>Medium</button>
          <button>Medium(+)</button>
          <button>High</button>

          <h3>Acid</h3>
          <button>Low</button>
          <button>Medium(-)</button>
          <button>Medium</button>
          <button>Medium(+)</button>
          <button>High</button>

          <h3>Alcohol</h3>
          <button>Low</button>
          <button>Medium(-)</button>
          <button>Medium</button>
          <button>Medium(+)</button>
          <button>High</button>

          <h3>Body</h3>
          <button>Light</button>
          <button>Medium</button>
          <button>Full Bodied</button>

          <h3>Texture</h3>
          <button>Lean</button>
          <button>Round</button>
          <button>Creamy</button>

          <h3>Flavour</h3>
          <p>Confirm the nose</p>

          <h3>Finish</h3>
          <button>Short</button>
          <button>Medium(-)</button>
          <button>Medium</button>
          <button>Medium(+)</button>
          <button>Long</button>

          <h3>Complexity</h3>
          <button>Low</button>
          <button>Medium(-)</button>
          <button>Medium</button>
          <button>Medium(+)</button>
          <button>High</button>

          <div className="navigation-buttons">
            <button onClick={handlePreviousPhase}>Back</button>
            <button onClick={handleNextPhase}>Next</button>
          </div>
        </>
      )}

      {currentPhase === "initialConclusion" && (
        <>
          <h2>Initial Conclusion (30 sec)</h2>
          <h3>Old World or New World</h3>
          <button>Old World</button>
          <button>New World</button>

          <h3>Climate</h3>
          <button>Cool</button>
          <button>Moderate</button>
          <button>Warm</button>

          <h3>Grape Variety/Blend</h3>
          <OtherInputButton label="Grape Variety/Blend" />

          <h3>Possible Countries</h3>
          <OtherInputButton label="Possible Countries" />

          <h3>Age Range</h3>
          <button>1-3</button>
          <button>3-5</button>
          <button>5-10</button>
          <button>+10</button>

          <div className="navigation-buttons">
            <button onClick={handlePreviousPhase}>Back</button>
            <button onClick={handleNextPhase}>Next</button>
          </div>
        </>
      )}

      {currentPhase === "finalConclusion" && (
        <>
          <h2>Final Conclusion (30 sec)</h2>
          <h3>Grape Variety/Blend</h3>
          <OtherInputButton label="Grape Variety/Blend" />

          <h3>Country of Origin</h3>
          <OtherInputButton label="Country of Origin" />

          <h3>Region/Appellation</h3>
          <OtherInputButton label="Region/Appellation" />

          <h3>Quality Level</h3>
          <OtherInputButton label="Quality Level" />

          <h3>Vintage</h3>
          <OtherInputButton label="Vintage" />

          <h3>Notes</h3>
          <textarea
            rows={6}
            placeholder="Add your notes here..."
            className="notes-input"
          ></textarea>

          <div className="navigation-buttons">
            <button onClick={handlePreviousPhase}>Back</button>
            <button onClick={() => alert("Tasting Saved!")}>Save</button>
          </div>
        </>
      )}
    </section>
  );
}
