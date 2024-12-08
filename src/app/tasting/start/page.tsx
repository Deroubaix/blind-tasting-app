"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function TastingStartPage() {
  const [wineType, setWineType] = useState<"White" | "Red" | null>(null);
  const [sound, setSound] = useState(true);
  const [timer, setTimer] = useState<"7.5 min" | "4 min" | null>(null);
  const router = useRouter();

  const handleWineTypeSelection = (type: "White" | "Red") => {
    setWineType(type);
  };

  const handleTimerSelection = (duration: "7.5 min" | "4 min") => {
    setTimer(duration);
  };

  const handleStartTasting = () => {
    if (!wineType) {
      alert("Please select a wine type.");
      return;
    }
    if (!timer) {
      alert("Please select a timer duration.");
      return;
    }
    // Redirect to the tasting flow
    router.push(`/tasting/${wineType.toLowerCase()}`); // e.g., /tasting/red or /tasting/white
  };

  return (
    <main className="tasting-start">
      <section className="wine-type">
        <h2>Select Wine Type</h2>
        <button
          onClick={() => handleWineTypeSelection("White")}
          className={wineType === "White" ? "selected" : ""}
        >
          White
        </button>
        <button
          onClick={() => handleWineTypeSelection("Red")}
          className={wineType === "Red" ? "selected" : ""}
        >
          Red
        </button>
      </section>

      <section className="options">
        <h2>Options</h2>
        <div className="option">
          <label>Sound</label>
          <button onClick={() => setSound((prev) => !prev)}>
            {sound ? "On" : "Off"}
          </button>
        </div>
        <div className="option">
          <label>Timer</label>
          <button
            onClick={() => handleTimerSelection("7.5 min")}
            className={timer === "7.5 min" ? "selected" : ""}
          >
            7.5 min
          </button>
          <button
            onClick={() => handleTimerSelection("4 min")}
            className={timer === "4 min" ? "selected" : ""}
          >
            4 min
          </button>
        </div>
      </section>

      <button className="start-btn" onClick={handleStartTasting}>
        Start Tasting
      </button>
    </main>
  );
}
