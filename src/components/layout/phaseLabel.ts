// "Phase 01" splits so the number can carry its own colour, in the heading and in the
// phone header strip alike. Labels with no number ("Wrap Up") come back whole.
const TRAILING_NUMBER = /^(.*?)\s+(\d+)$/;

export default function splitPhaseLabel(phase: string): { name: string; number?: string } {
	const match = TRAILING_NUMBER.exec(phase);
	return match ? { name: match[1], number: match[2] } : { name: phase };
}
