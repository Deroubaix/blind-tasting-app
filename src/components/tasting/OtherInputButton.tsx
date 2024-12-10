import React, { useState } from "react";

interface OtherInputButtonProps {
  label: string;
  onSave: (category: string, value: string) => void;
}

export default function OtherInputButton({
  label,
  onSave,
}: OtherInputButtonProps) {
  const [showInput, setShowInput] = useState(false);
  const [customInput, setCustomInput] = useState("");

  const handleSubmit = () => {
    // Call the parent's handleOptionSelect function
    onSave(label, customInput.trim());
    // Hide the input field after saving
    setShowInput(false);
    // Clear the input
    setCustomInput("");
  };

  return (
    <div className="other-input">
      {showInput ? (
        <div>
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder={`Enter your custom ${label}`}
          />
          <button onClick={handleSubmit}>Save</button>
        </div>
      ) : (
        <button onClick={() => setShowInput(true)}>Other</button>
      )}
    </div>
  );
}
