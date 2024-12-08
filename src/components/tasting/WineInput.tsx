import React from "react";

type WineInputProps = {
  wineName: string;
  setWineName: (name: string) => void;
  onNext: () => void;
};

export default function WineInput({
  wineName,
  setWineName,
  onNext,
}: WineInputProps) {
  const handleNext = () => {
    if (!wineName.trim()) {
      alert("Please enter the wine name.");
      return;
    }
    onNext();
  };

  return (
    <section className="wine-input">
      <h1>Wine</h1>
      <input
        type="text"
        value={wineName}
        placeholder="Enter the wine name..."
        onChange={(e) => setWineName(e.target.value)}
      />
      <button onClick={handleNext}>Next</button>
    </section>
  );
}
