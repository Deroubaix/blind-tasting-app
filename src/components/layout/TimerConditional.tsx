"use client";

import TimerWrapper from "../layout/TimerWrapper";
import { useTastingContext } from "../../components/tasting/TastingContext";

interface TimerConditionalProps {
  page: "sight" | "nose" | "palate" | "initialConclusion" | "finalConclusion";
  destination: string;
}

export default function TimerConditional({
  page,
  destination,
}: TimerConditionalProps) {
  const { tastingData } = useTastingContext();

  // If timer is not enabled, render nothing.
  if (!tastingData.timerEnabled) return null;

  // Compare against 7 because that's what we stored for "7.5 min".
  const selectedOption = tastingData.timerDuration === 7 ? "7.5 min" : "4 min";

  // Timer durations for each page for both timer options.
  const timerMapping: Record<string, Record<"4 min" | "7.5 min", number>> = {
    sight: {
      "4 min": 30,
      "7.5 min": 56, // 30 * 1.875 ≈ 56 seconds
    },
    nose: {
      "4 min": 120,
      "7.5 min": 225, // 120 * 1.875 = 225 seconds
    },
    palate: {
      "4 min": 30,
      "7.5 min": 56,
    },
    initialConclusion: {
      "4 min": 30,
      "7.5 min": 56,
    },
    finalConclusion: {
      "4 min": 30,
      "7.5 min": 56,
    },
  };

  const defaultDuration = timerMapping[page][selectedOption];

  return (
    <TimerWrapper defaultDuration={defaultDuration} destination={destination} />
  );
}
