import { type TastingData } from '../types/TastingData';
import { type TimerPhase } from './timerData';

type Clock = Partial<Pick<TastingData, 'timerEndsAt' | 'phaseEndsAt' | 'timerPausedAt'>>;

/**
 * The guided deadline for a phase opened for the first time, or null when it already has one —
 * so stepping Back to a phase finds its clock where it was rather than full again.
 *
 * Opened while paused, the deadline is stamped from the moment of the pause: resuming shifts every
 * deadline by the time spent paused, which then lands this one at its full length.
 */
export function stampPhase(clock: Clock, phase: TimerPhase, seconds: number, now: number): Clock | null {
	if (clock.phaseEndsAt?.[phase] !== undefined) {
		return null;
	}
	const from = clock.timerPausedAt ?? now;
	return { phaseEndsAt: { ...clock.phaseEndsAt, [phase]: from + seconds * 1000 } };
}

/** Stops the clock. Pausing twice keeps the first pause. */
export function pauseClock(clock: Clock, now: number): Clock {
	return clock.timerPausedAt ? {} : { timerPausedAt: now };
}

/**
 * Restarts the clock by pushing every deadline back by the time spent paused, so each one has
 * exactly what it had left when the pause began.
 */
export function resumeClock(clock: Clock, now: number): Clock {
	if (!clock.timerPausedAt) {
		return {};
	}
	const paused = now - clock.timerPausedAt;
	const phaseEndsAt = clock.phaseEndsAt
		? Object.fromEntries(Object.entries(clock.phaseEndsAt).map(([phase, endsAt]) => [phase, endsAt + paused]))
		: undefined;
	return {
		timerPausedAt: null,
		timerEndsAt: clock.timerEndsAt === undefined ? undefined : clock.timerEndsAt + paused,
		phaseEndsAt,
	};
}
