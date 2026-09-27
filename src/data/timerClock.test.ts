import { describe, expect, it } from 'vitest';
import { pauseClock, resumeClock, stampPhase } from './timerClock';

describe('stampPhase', () => {
	it('stamps a phase the first time it is opened', () => {
		expect(stampPhase({}, 'sight', 30, 1000)).toEqual({ phaseEndsAt: { sight: 31_000 } });
	});

	it('keeps the other phases already stamped', () => {
		expect(stampPhase({ phaseEndsAt: { sight: 5000 } }, 'nose', 120, 1000)).toEqual({
			phaseEndsAt: { sight: 5000, nose: 121_000 },
		});
	});

	it('leaves a phase already stamped alone, so Back does not restart its clock', () => {
		expect(stampPhase({ phaseEndsAt: { sight: 5000 } }, 'sight', 30, 60_000)).toBeNull();
	});

	it('stamps from the pause when opened while paused', () => {
		expect(stampPhase({ timerPausedAt: 1000 }, 'palate', 30, 9000)).toEqual({ phaseEndsAt: { palate: 31_000 } });
	});
});

describe('pauseClock and resumeClock', () => {
	it('pauses once', () => {
		expect(pauseClock({}, 1000)).toEqual({ timerPausedAt: 1000 });
		expect(pauseClock({ timerPausedAt: 1000 }, 2000)).toEqual({});
	});

	it('moves every deadline back by the time spent paused', () => {
		const clock = { timerPausedAt: 10_000, timerEndsAt: 50_000, phaseEndsAt: { sight: 20_000, nose: 40_000 } };
		expect(resumeClock(clock, 25_000)).toEqual({
			timerPausedAt: null,
			timerEndsAt: 65_000,
			phaseEndsAt: { sight: 35_000, nose: 55_000 },
		});
	});

	it('gives a phase opened during the pause its full length on resume', () => {
		const opened = { timerPausedAt: 1000, ...stampPhase({ timerPausedAt: 1000 }, 'nose', 120, 9000) };
		const resumed = resumeClock(opened, 9000);
		expect(resumed.phaseEndsAt?.nose).toBe(9000 + 120_000);
	});

	it('does nothing when not paused', () => {
		expect(resumeClock({ timerEndsAt: 5000 }, 9000)).toEqual({});
	});
});
