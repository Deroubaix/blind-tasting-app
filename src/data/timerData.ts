import { type Grid } from './grids';

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

/** The WSET Level 3 tasting paper: two wines in 30 minutes. */
export const WSET_TIMER_PRESETS = [{ seconds: 900, label: 'Level 3 exam', note: '2 wines in 30 min' }] as const;

export const ALL_TIMER_PRESETS = [...TIMER_PRESETS, ...WSET_TIMER_PRESETS];

export type TimerPreset = (typeof ALL_TIMER_PRESETS)[number];

export function timerPresets(grid: Grid): readonly TimerPreset[] {
	return grid === 'wset' ? WSET_TIMER_PRESETS : TIMER_PRESETS;
}

export const DEFAULT_TIMER_SECONDS = TIMER_PRESETS[0].seconds;

export const defaultTimerSeconds = (grid: Grid) => timerPresets(grid)[0].seconds;

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
const PHASE_SHARE: Record<Grid, Record<TimerPhase, number>> = {
	cms: {
		sight: 1 / 8,
		nose: 1 / 2,
		palate: 1 / 8,
		initialConclusion: 1 / 8,
		finalConclusion: 1 / 8,
	},
	// The SAT has no initial conclusion, and its palate carries flavour as well as structure.
	wset: {
		sight: 1 / 8,
		nose: 3 / 8,
		palate: 3 / 8,
		initialConclusion: 0,
		finalConclusion: 1 / 8,
	},
};

/** One phase's guided time. The nose takes the rounding, so the phases always sum to the total. */
export function phaseSeconds(totalSeconds: number, phase: TimerPhase, grid: Grid = 'cms'): number {
	const share = PHASE_SHARE[grid];
	if (phase !== 'nose') {
		return Math.round(totalSeconds * share[phase]);
	}
	const others = (Object.keys(share) as TimerPhase[])
		.filter((p) => p !== 'nose')
		.reduce((sum, p) => sum + Math.round(totalSeconds * share[p]), 0);
	return totalSeconds - others;
}

/** The phase each phase hands over to. `finalConclusion` ends the timed session. */
const NEXT_PHASE: Record<Grid, Record<TimerPhase, TimerPhase | null>> = {
	cms: {
		sight: 'nose',
		nose: 'palate',
		palate: 'initialConclusion',
		initialConclusion: 'finalConclusion',
		finalConclusion: null,
	},
	wset: {
		sight: 'nose',
		nose: 'palate',
		palate: 'finalConclusion',
		initialConclusion: 'finalConclusion',
		finalConclusion: null,
	},
};

export function nextPhase(phase: TimerPhase, grid: Grid = 'cms'): TimerPhase | null {
	return NEXT_PHASE[grid][phase];
}

export function formatTimerSeconds(seconds: number): string {
	const m = Math.floor(seconds / 60);
	const s = seconds % 60;
	return `${m}:${s.toString().padStart(2, '0')}`;
}
