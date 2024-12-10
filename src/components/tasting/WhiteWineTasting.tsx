"use client";

import React, { useState } from "react";
import OtherInputButton from "./OtherInputButton";

export default function WhiteWineTasting() {
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
        "Hue",
        "Viscosity",
        "Stained Tears",
        "Gas Evidence",
        "Sediment, Particles",
      ],
      nose: [
        "Clean or Faulty",
        "Intensity",
        "Age Assessment",
        "Citrus Fruit",
        "Stone Fruit",
        "Orchard Fruit",
        "Tropical Fruit",
        "Fruit Character",
        "Floral",
        "Condition",
        "Veg/Herbal/Spices",
        "Nuts",
        "Vinification",
        "Earth",
        "Rocks",
        "Wood Aromas",
        "Wood Aromas Origin",
        "Wood Aromas Condition",
      ],
      palate: [
        "Sweetness",
        "Tannin",
        "Acid",
        "Alcohol",
        "Body",
        "Texture",
        "Finish",
        "Complexity",
      ],
      initialConclusion: [
        "Old World or New World",
        "Climate",
        "Age Range",
        "Grape Variety/Blend",
        "Possible Countries",
      ],
      finalConclusion: [
        "Grape Variety/Blend",
        "Country of Origin",
        "Region/Appellation",
        "Quality Level",
        "Vintage",
      ],
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
    <section className="white-wine-tasting">
      <header>
        <h1>White Wine Tasting</h1>
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
          <OtherInputButton label="Faulty Reason" onSave={handleOptionSelect} />

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

          <h3>Citrus Fruit</h3>
          <button onClick={() => handleOptionSelect("Citrus Fruit", "Lime")}>
            Lime
          </button>
          <button onClick={() => handleOptionSelect("Citrus Fruit", "Lemon")}>
            Lemon
          </button>
          <button onClick={() => handleOptionSelect("Citrus Fruit", "Orange")}>
            Orange
          </button>
          <button
            onClick={() => handleOptionSelect("Citrus Fruit", "Grapefruit")}
          >
            Grapefruit
          </button>
          <OtherInputButton label="Citrus Fruit" onSave={handleOptionSelect} />

          <h3>Stone Fruit</h3>
          <button onClick={() => handleOptionSelect("Stone Fruit", "Apricot")}>
            Apricot
          </button>
          <button
            onClick={() => handleOptionSelect("Stone Fruit", "Nectarine")}
          >
            Nectarine
          </button>
          <button onClick={() => handleOptionSelect("Stone Fruit", "Peach")}>
            Peach
          </button>
          <OtherInputButton label="Stone Fruit" onSave={handleOptionSelect} />

          <h3>Orchard Fruits</h3>
          <button onClick={() => handleOptionSelect("Orchard Fruit", "Apple")}>
            Apple
          </button>
          <button onClick={() => handleOptionSelect("Orchard Fruit", "Pear")}>
            Pear
          </button>
          <button onClick={() => handleOptionSelect("Orchard Fruit", "Quince")}>
            Quince
          </button>
          <OtherInputButton label="Orchard Fruit" onSave={handleOptionSelect} />

          <h3>Tropical Fruits</h3>
          <button
            onClick={() => handleOptionSelect("Tropical Fruit", "Pineapple")}
          >
            Pineapple
          </button>
          <button
            onClick={() => handleOptionSelect("Tropical Fruit", "Passionfrui")}
          >
            Passionfruit
          </button>
          <button onClick={() => handleOptionSelect("Tropical Fruit", "Mango")}>
            Mango
          </button>
          <button onClick={() => handleOptionSelect("Tropical Fruit", "Melon")}>
            Melon
          </button>
          <button
            onClick={() => handleOptionSelect("Tropical Fruit", "Banana")}
          >
            Banana
          </button>
          <button
            onClick={() => handleOptionSelect("Tropical Fruit", "Lychee")}
          >
            Lychee
          </button>
          <OtherInputButton
            label="Tropical Fruit"
            onSave={handleOptionSelect}
          />

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
            onClick={() => handleOptionSelect("Fruit Character", "Baked")}
          >
            Baked
          </button>
          <button
            onClick={() => handleOptionSelect("Fruit Character", "Jammy")}
          >
            Jammy
          </button>
          <button
            onClick={() => handleOptionSelect("Fruit Character", "Dried")}
          >
            Dried
          </button>
          <button onClick={() => handleOptionSelect("Fruit Character", "Peel")}>
            Peel
          </button>

          <h3>Floral</h3>
          <button onClick={() => handleOptionSelect("Floral", "Acacia")}>
            Acacia
          </button>
          <button
            onClick={() => handleOptionSelect("Floral", "Citrus Blossom")}
          >
            Citrus Blossom
          </button>
          <button onClick={() => handleOptionSelect("Floral", "Honeysuckle")}>
            Honeysuckle
          </button>
          <button onClick={() => handleOptionSelect("Floral", "Jasmine")}>
            Jasmine
          </button>
          <button onClick={() => handleOptionSelect("Floral", "Rose")}>
            Rose
          </button>
          <OtherInputButton label="Floral" onSave={handleOptionSelect} />

          <h3>Condition</h3>
          <button onClick={() => handleOptionSelect("Condition", "Fresh")}>
            Fresh
          </button>
          <button onClick={() => handleOptionSelect("Condition", "Dried")}>
            Dried
          </button>

          <h3>Veg/Herbal/Spices</h3>
          <button
            onClick={() =>
              handleOptionSelect("Veg/Herbal/Spices", "Gooseberry")
            }
          >
            Gooseberry
          </button>
          <button
            onClick={() => handleOptionSelect("Veg/Herbal/Spices", "Asparagus")}
          >
            Asparagus
          </button>
          <button
            onClick={() =>
              handleOptionSelect("Veg/Herbal/Spices", "Bellpepper")
            }
          >
            Bellpepper
          </button>
          <button
            onClick={() => handleOptionSelect("Veg/Herbal/Spices", "Jalapeno")}
          >
            Jalapeno
          </button>
          <button
            onClick={() => handleOptionSelect("Veg/Herbal/Spices", "Olives")}
          >
            Olives
          </button>
          <button
            onClick={() => handleOptionSelect("Veg/Herbal/Spices", "Tomato")}
          >
            Tomato
          </button>
          <button
            onClick={() => handleOptionSelect("Veg/Herbal/Spices", "Bay Leaf")}
          >
            Bay Leaf
          </button>
          <button
            onClick={() => handleOptionSelect("Veg/Herbal/Spices", "Dill")}
          >
            Dill
          </button>
          <button
            onClick={() =>
              handleOptionSelect("Veg/Herbal/Spices", "Eucalyptus/Mint")
            }
          >
            Eucalyptus/Mint
          </button>
          <button
            onClick={() => handleOptionSelect("Veg/Herbal/Spices", "Ginger")}
          >
            Ginger
          </button>
          <button
            onClick={() => handleOptionSelect("Veg/Herbal/Spices", "Wasabi")}
          >
            Wasabi
          </button>
          <button
            onClick={() =>
              handleOptionSelect("Veg/Herbal/Spices", "White Pepper")
            }
          >
            White Pepper
          </button>
          <button
            onClick={() => handleOptionSelect("Veg/Herbal/Spices", "Lanolin")}
          >
            Lanolin
          </button>
          <OtherInputButton
            label="Veg/Herbal/Spices"
            onSave={handleOptionSelect}
          />

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
          <OtherInputButton label="Nuts" onSave={handleOptionSelect} />

          <h3>Vinification</h3>
          <button onClick={() => handleOptionSelect("Vinification", "Butter")}>
            Butter
          </button>
          <button onClick={() => handleOptionSelect("Vinification", "Cream")}>
            Cream
          </button>
          <button onClick={() => handleOptionSelect("Vinification", "Rind")}>
            Rind
          </button>
          <button onClick={() => handleOptionSelect("Vinification", "Yougurt")}>
            Yogurt
          </button>
          <button onClick={() => handleOptionSelect("Vinification", "Brioche")}>
            Brioche
          </button>
          <button onClick={() => handleOptionSelect("Vinification", "Dough")}>
            Dough
          </button>
          <button
            onClick={() => handleOptionSelect("Vinification", "Graham Cracker")}
          >
            Graham Cracker
          </button>
          <button
            onClick={() => handleOptionSelect("Vinification", "Bubblegum")}
          >
            Bubblegum
          </button>
          <button
            onClick={() => handleOptionSelect("Vinification", "Botrytis")}
          >
            Botrytis
          </button>
          <OtherInputButton label="Vinification" onSave={handleOptionSelect} />

          <h3>Earth</h3>
          <button onClick={() => handleOptionSelect("Earth", "Baked earth")}>
            Baked earth
          </button>
          <button onClick={() => handleOptionSelect("Earth", "Compost")}>
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
          <OtherInputButton label="Earth" onSave={handleOptionSelect} />

          <h3>Rocks</h3>
          <button onClick={() => handleOptionSelect("Rocks", "Chalk")}>
            Chalk
          </button>
          <button onClick={() => handleOptionSelect("Rocks", "Dust")}>
            Dust
          </button>
          <button
            onClick={() => handleOptionSelect("Rocks", "Flint/Gunpowder")}
          >
            Flint/Gunpowder
          </button>
          <button onClick={() => handleOptionSelect("Rocks", "Granit")}>
            Granit
          </button>
          <button onClick={() => handleOptionSelect("Rocks", "Graphite")}>
            Graphite
          </button>
          <button onClick={() => handleOptionSelect("Rocks", "Gravel")}>
            Gravel
          </button>
          <button onClick={() => handleOptionSelect("Rocks", "Limestone")}>
            Limestone
          </button>
          <button onClick={() => handleOptionSelect("Rocks", "Slate/Petrol")}>
            Slate/Petrol
          </button>
          <button onClick={() => handleOptionSelect("Rocks", "Volcanic")}>
            Volcanic
          </button>
          <button onClick={() => handleOptionSelect("Rocks", "Tar")}>
            Tar
          </button>
          <button onClick={() => handleOptionSelect("Rocks", "Sea Spray")}>
            Sea Spray
          </button>
          <OtherInputButton label="Rocks" onSave={handleOptionSelect} />

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
          <OtherInputButton label="Wood Aromas" onSave={handleOptionSelect} />

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
          <button onClick={() => handleOptionSelect("Sweetness", "Bone Dry")}>
            Bone Dry
          </button>
          <button onClick={() => handleOptionSelect("Sweetness", "Dry")}>
            Dry
          </button>
          <button onClick={() => handleOptionSelect("Sweetness", "Off-Dry")}>
            Off-Dry
          </button>
          <button onClick={() => handleOptionSelect("Sweetness", "Sweet")}>
            Sweet
          </button>

          <h3>Tannin</h3>
          <button onClick={() => handleOptionSelect("Tannin", "Low")}>
            Low
          </button>
          <button onClick={() => handleOptionSelect("Tannin", "Medium (-)")}>
            Medium(-)
          </button>
          <button onClick={() => handleOptionSelect("Tannin", "Medium")}>
            Medium
          </button>
          <button onClick={() => handleOptionSelect("Tannin", "Medium (+)")}>
            Medium(+)
          </button>
          <button onClick={() => handleOptionSelect("Tannin", "High")}>
            High
          </button>

          <h3>Acid</h3>
          <button onClick={() => handleOptionSelect("Acid", "Low")}>Low</button>
          <button onClick={() => handleOptionSelect("Acid", "Medium(-)")}>
            Medium(-)
          </button>
          <button onClick={() => handleOptionSelect("Acid", "Medium")}>
            Medium
          </button>
          <button onClick={() => handleOptionSelect("Acid", "Medium(+)")}>
            Medium(+)
          </button>
          <button onClick={() => handleOptionSelect("Acid", "High")}>
            High
          </button>

          <h3>Alcohol</h3>
          <button onClick={() => handleOptionSelect("Alcohol", "Low")}>
            Low
          </button>
          <button onClick={() => handleOptionSelect("Alcohol", "Medium(-)")}>
            Medium(-)
          </button>
          <button onClick={() => handleOptionSelect("Alcohol", "Medium")}>
            Medium
          </button>
          <button onClick={() => handleOptionSelect("Alcohol", "Medium(+)")}>
            Medium(+)
          </button>
          <button onClick={() => handleOptionSelect("Alcohol", "High")}>
            High
          </button>

          <h3>Body</h3>
          <button onClick={() => handleOptionSelect("Body", "Light")}>
            Light
          </button>
          <button onClick={() => handleOptionSelect("Body", "Medium")}>
            Medium
          </button>
          <button onClick={() => handleOptionSelect("Body", "Full Bodied")}>
            Full Bodied
          </button>

          <h3>Texture</h3>
          <button onClick={() => handleOptionSelect("Texture", "Lean")}>
            Lean
          </button>
          <button onClick={() => handleOptionSelect("Texture", "Round")}>
            Round
          </button>
          <button onClick={() => handleOptionSelect("Texture", "Creamy")}>
            Creamy
          </button>

          <h3>Flavour</h3>
          <p>Confirm the nose</p>

          <h3>Finish</h3>
          <button onClick={() => handleOptionSelect("Finish", "Short")}>
            Short
          </button>
          <button onClick={() => handleOptionSelect("Finish", "Medium(-)")}>
            Medium(-)
          </button>
          <button onClick={() => handleOptionSelect("Finish", "Medium")}>
            Medium
          </button>
          <button onClick={() => handleOptionSelect("Finish", "Medium(+)")}>
            Medium(+)
          </button>
          <button onClick={() => handleOptionSelect("Finish", "Long")}>
            Long
          </button>

          <h3>Complexity</h3>
          <button onClick={() => handleOptionSelect("Complexity", "Low")}>
            Low
          </button>
          <button onClick={() => handleOptionSelect("Complexity", "Medium(-)")}>
            Medium(-)
          </button>
          <button onClick={() => handleOptionSelect("Complexity", "Medium")}>
            Medium
          </button>
          <button onClick={() => handleOptionSelect("Complexity", "Medium(+)")}>
            Medium(+)
          </button>
          <button onClick={() => handleOptionSelect("Complexity", "High")}>
            High
          </button>

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
          <button
            onClick={() =>
              handleOptionSelect("Old World or New World", "Old World")
            }
          >
            Old World
          </button>
          <button
            onClick={() =>
              handleOptionSelect("Old World or New World", "New World")
            }
          >
            New World
          </button>

          <h3>Climate</h3>
          <button onClick={() => handleOptionSelect("Climate", "Cool")}>
            Cool
          </button>
          <button onClick={() => handleOptionSelect("Climate", "Moderate")}>
            Moderate
          </button>
          <button onClick={() => handleOptionSelect("Climate", "Warm")}>
            Warm
          </button>

          <h3>Grape Variety/Blend</h3>
          <OtherInputButton
            label="Grape Variety/Blend"
            onSave={handleOptionSelect}
          />

          <h3>Possible Countries</h3>
          <OtherInputButton
            label="Possible Countries"
            onSave={handleOptionSelect}
          />

          <h3>Age Range</h3>
          <button onClick={() => handleOptionSelect("Age Range", "1-3")}>
            1-3
          </button>
          <button onClick={() => handleOptionSelect("Age Range", "3-5")}>
            3-5
          </button>
          <button onClick={() => handleOptionSelect("Age Range", "5-10")}>
            5-10
          </button>
          <button onClick={() => handleOptionSelect("Age Range", "+10")}>
            +10
          </button>

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
          <OtherInputButton
            label="Grape Variety/Blend"
            onSave={handleOptionSelect}
          />

          <h3>Country of Origin</h3>
          <OtherInputButton
            label="Country of Origin"
            onSave={handleOptionSelect}
          />

          <h3>Region/Appellation</h3>
          <OtherInputButton
            label="Region/Appellation"
            onSave={handleOptionSelect}
          />

          <h3>Quality Level</h3>
          <OtherInputButton label="Quality Level" onSave={handleOptionSelect} />

          <h3>Vintage</h3>
          <OtherInputButton label="Vintage" onSave={handleOptionSelect} />

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
