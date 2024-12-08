"use client";

import React, { useState } from "react";
import OtherInputButton from "./OtherInputButton";

export default function RedWineTasting() {
  const [currentPhase, setCurrentPhase] = useState<
    "sight" | "nose" | "palate" | "initialConclusion" | "finalConclusion"
  >("sight");

  const handleNextPhase = () => {
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
          <button>Clear</button>
          <button>Slight Cloudy</button>

          <h3>Brightness</h3>
          <button>Hazy</button>
          <button>Day Bright</button>
          <button>Star Bright</button>

          <h3>Concentration</h3>
          <button>Pale</button>
          <button>Moderate</button>
          <button>Deep</button>

          <h3>Color</h3>
          <button>White</button>
          <button>Straw</button>
          <button>Yellow</button>
          <button>Gold</button>

          <h3>Hue</h3>
          <button>Silver</button>
          <button>Green</button>
          <button>Orange</button>

          <h3>Viscosity</h3>
          <button>Low</button>
          <button>Medium</button>
          <button>High</button>

          <h3>Stained Tears</h3>
          <button>No</button>
          <button>Yes</button>

          <h3>Gas Evidence</h3>
          <button>No</button>
          <button>Yes</button>

          <h3>Sediment, Particles</h3>
          <button>No</button>
          <button>Yes</button>

          <div className="navigation-buttons">
            <button onClick={handleNextPhase}>Next</button>
          </div>
        </>
      )}

      {currentPhase === "nose" && (
        <>
          <h2>Nose</h2>
          <h3>Clean or Faulty</h3>
          <button>Clean</button>
          <button>Faulty</button>
          <OtherInputButton label="Faulty Reason" />

          <h3>Intensity</h3>
          <button>Delicate</button>
          <button>Moderate</button>
          <button>Pronounced</button>

          <h3>Age Assessment</h3>
          <button>Youthful</button>
          <button>Vinous</button>

          <h3>Citrus</h3>
          <button>Lime</button>
          <button>Lemon</button>
          <button>Orange</button>
          <button>Grapefruit</button>
          <OtherInputButton label="Citrus" />

          <h3>Stone Fruit</h3>
          <button>Apricot</button>
          <button>Nectarine</button>
          <button>Peach</button>
          <OtherInputButton label="Stone Fruit" />

          <h3>Orchard Fruits</h3>
          <button>Apple</button>
          <button>Pear</button>
          <button>Quince</button>
          <OtherInputButton label="Orchard" />

          <h3>Tropical Fruits</h3>
          <button>Pineapple</button>
          <button>Passionfruit</button>
          <button>Mango</button>
          <button>Melon</button>
          <button>Banana</button>
          <button>Lychee</button>
          <OtherInputButton label="Tropical" />

          <h3>Fruit Character</h3>
          <button>Tart</button>
          <button>Ripe/Lush</button>
          <button>Baked</button>
          <button>Jammy</button>
          <button>Dried</button>
          <button>Peel</button>

          <h3>Floral</h3>
          <button>Acacia</button>
          <button>Citrus Blossom</button>
          <button>Honeysuckle</button>
          <button>Jasmine</button>
          <button>Rose</button>
          <OtherInputButton label="Floral" />

          <h3>Condition</h3>
          <button>Fresh</button>
          <button>Dried</button>

          <h3>Veg/Herbal/Spices</h3>
          <button>Gooseberry</button>
          <button>Asparagus</button>
          <button>Bellpepper</button>
          <button>Jalapeno</button>
          <button>Olives</button>
          <button>Tomato</button>
          <button>Bay Leaf</button>
          <button>Dill</button>
          <button>Eucalyptus/Mint</button>
          <button>Ginger</button>
          <button>Wasabi</button>
          <button>White Pepper</button>
          <button>Lanolin</button>
          <OtherInputButton label="Veg/Herbal/Spices" />

          <h3>Nuts</h3>
          <button>Almond</button>
          <button>Hazelnut</button>
          <button>Marzipan</button>
          <button>Peanut</button>
          <button>Nutmeg</button>
          <OtherInputButton label="Nuts" />

          <h3>Vanification</h3>
          <button>Butter</button>
          <button>Cream</button>
          <button>Rind</button>
          <button>Yogurt</button>
          <button>Brioche</button>
          <button>Dough</button>
          <button>Graham Cracker</button>
          <button>Bubblegum</button>
          <button>Botrytis</button>
          <OtherInputButton label="Nuts" />

          <h3>Earth</h3>
          <button>Baked earth</button>
          <button>Compost</button>
          <button>Forest Floor</button>
          <button>Potting Soil</button>
          <button>Truffle</button>
          <button>Leaves</button>
          <button>Mushroom</button>
          <button>Hay</button>
          <button>Straw</button>
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

          <h3>Wood aromas</h3>
          <button>Vanilla</button>
          <button>Coconut</button>
          <button>Cigarbox</button>
          <button>Cedar</button>
          <button>Mocha</button>
          <button>Chocolate</button>
          <button>Cocoa</button>
          <button>Caramel</button>
          <button>Butterscotch</button>
          <button>Pencil Shavings</button>
          <OtherInputButton label="Wood aromas" />

          <h5>Origin</h5>
          <button>French</button>
          <button>American</button>
          <button>Slavonian</button>

          <h5>Condition</h5>
          <button>New</button>
          <button>Neutral</button>
          <button>Large</button>

          <button onClick={handleNextPhase}>Next</button>
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
