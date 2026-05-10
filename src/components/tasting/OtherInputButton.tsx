import React, { useState } from "react";

interface OtherInputButtonProps {
  label: string;
  savedValue?: string;
  onSave: (category: string, value: string) => void;
}

export default function OtherInputButton({
  label,
  savedValue,
  onSave,
}: OtherInputButtonProps) {
  const [showInput, setShowInput] = useState(false);
  const [customInput, setCustomInput] = useState(savedValue || "");

  const handleSubmit = () => {
    const trimmed = customInput.trim();
    if (!trimmed) return;
    onSave(label, trimmed);
    setShowInput(false);
  };

  if (showInput) {
    return (
      <div className="other-input">
        <input
          type="text"
          className="tasting-input"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          placeholder={`Enter ${label}`}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
            if (e.key === "Escape") setShowInput(false);
          }}
          autoFocus
        />
        <button className="rounded quiet" onClick={handleSubmit}>
          Save
        </button>
        <button className="rounded quiet" onClick={() => setShowInput(false)}>
          ✕
        </button>
      </div>
    );
  }

  return (
    <div className="other-input">
      {savedValue ? (
        <button
          className="rounded quiet selected"
          onClick={() => setShowInput(true)}
          title="Click to edit"
        >
          {savedValue} ✎
        </button>
      ) : (
        <button className="rounded quiet" onClick={() => setShowInput(true)}>
          Enter {label}
        </button>
      )}
    </div>
  );
}
