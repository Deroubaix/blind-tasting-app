export type TimerOption = "4 min" | "7.5 min";

export const PHASE_TIMER_SECONDS: Record<string, Record<TimerOption, number>> = {
  sight:             { "4 min": 30,  "7.5 min": 56  },
  nose:              { "4 min": 120, "7.5 min": 225 },
  palate:            { "4 min": 30,  "7.5 min": 56  },
  initialConclusion: { "4 min": 30,  "7.5 min": 56  },
  finalConclusion:   { "4 min": 30,  "7.5 min": 56  },
};

export function formatTimerSeconds(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
