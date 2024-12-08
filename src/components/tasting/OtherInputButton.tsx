import React, { useState } from "react";

export default function OtherInputButton({ label }: { label: string }) {
  const [showInput, setShowInput] = useState(false);
  const [customInput, setCustomInput] = useState("");

  const handleSubmit = () => {
    console.log("Custom input:", customInput);
    setShowInput(false);
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
