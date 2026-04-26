"use client";

import React, { useEffect, useState } from "react";

interface TimerProps {
  initialTime: number;
  onTimeUp?: () => void;
}

export default function Timer({ initialTime, onTimeUp }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (onTimeUp) onTimeUp();
      return;
    }
    const intervalId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(intervalId);
  }, [timeLeft, onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes < 10 ? "0" + minutes : minutes}:${
    seconds < 10 ? "0" + seconds : seconds
  }`;

  return (
    <div className="timer-container">
      <div className="timer-display">
        <span>{formattedTime}</span>
      </div>
    </div>
  );
}
