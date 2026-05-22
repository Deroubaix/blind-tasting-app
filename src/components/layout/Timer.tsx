"use client";

import React, { useEffect, useRef, useState } from "react";

interface TimerProps {
  initialTime: number;
  onTimeUp?: () => void;
}

export default function Timer({ initialTime, onTimeUp }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const onTimeUpRef = useRef(onTimeUp);
  useEffect(() => { onTimeUpRef.current = onTimeUp; }, [onTimeUp]);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUpRef.current?.();
      return;
    }
    const intervalId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(intervalId);
  }, [timeLeft]); // onTimeUp intentionally excluded — reads via ref

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes < 10 ? "0" + minutes : minutes}:${
    seconds < 10 ? "0" + seconds : seconds
  }`;

  const stateClass = timeLeft === 0
    ? "timer-display--expired"
    : timeLeft <= 60
    ? "timer-display--warning"
    : "";

  return (
    <span className={`timer-display${stateClass ? ` ${stateClass}` : ""}`}>
      {formattedTime}
    </span>
  );
}
