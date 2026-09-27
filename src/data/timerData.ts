export type TimerPhase = 'sight' | 'nose' | 'palate' | 'initialConclusion' | 'finalConclusion';

/**
 * Seconds per wine, taken from the real exams. CMS Americas times a whole flight, not each
 * phase: Advanced and Master give six wines in 25 minutes (about 4:10 each, rounded to 4:00),
 * Certified gives four wines in 45 minutes (11:15 each).
 */
export const TIMER_PRESETS = [
	{ seconds: 240, label: 'Advanced / Master', note: '6 wines in 25 min' },
	{ seconds: 675, label: 'Certified', note: '4 wines in 45 min' },
] as const;

export const DEFAULT_TIMER_SECONDS = TIMER_PRESETS[0].seconds;

/**
 * `guided` gives each phase its own clock and moves on when it runs out — the app's own
 * scaffolding for learning to pace. `exam` runs one clock for the whole wine, as the exam does:
 * you move between phases yourself and are only stopped when the total runs out.
 */
export type TimerMode = 'guided' | 'exam';
export const DEFAULT_TIMER_MODE: TimerMode = 'guided';

/**
 * The guided split. Not from any exam — the exam has no per-phase times. The nose gets half
 * because it is where most candidates are ruled out; the other four phases share the rest.
 */
const PHASE_SHARE: Record<TimerPhase, number> = {
	sight: 1 / 8,
	nose: 1 / 2,
	palate: 1 / 8,
	initialConclusion: 1 / 8,
	finalConclusion: 1 / 8,
};

/** One phase's guided time. The nose takes the rounding, so the five always sum to the total. */
export function phaseSeconds(totalSeconds: number, phase: TimerPhase): number {
	if (phase !== 'nose') {
		return Math.round(totalSeconds * PHASE_SHARE[phase]);
	}
	const others = (Object.keys(PHASE_SHARE) as TimerPhase[])
		.filter((p) => p !== 'nose')
		.reduce((sum, p) => sum + Math.round(totalSeconds * PHASE_SHARE[p]), 0);
	return totalSeconds - others;
}

/** Display name of the phase each phase hands over to. `finalConclusion` ends the timed session. */
export const NEXT_PHASE_LABEL: Record<TimerPhase, string | null> = {
	sight: 'The Nose',
	nose: 'The Palate',
	palate: 'Initial Conclusion',
	initialConclusion: 'Final Conclusion',
	finalConclusion: null,
};

export function formatTimerSeconds(seconds: number): string {
	const m = Math.floor(seconds / 60);
	const s = seconds % 60;
	return `${m}:${s.toString().padStart(2, '0')}`;
}
