export type TastingData = {
	id?: string;
	/** Per-user display number shown as "No. N". Assigned by the server on create. */
	number?: number;
	wineType: 'White' | 'Red';
	timerEnabled: boolean;
	/** Seconds for the whole wine; null with the timer off. See TIMER_PRESETS. */
	timerSeconds: number | null;
	timerMode?: 'guided' | 'exam';
	/**
	 * Exam mode only, and never saved: the wall-clock moment the whole-wine clock runs out,
	 * stamped when Start is pressed so every phase page counts down to the same deadline.
	 */
	timerEndsAt?: number;
	/**
	 * Guided mode only, and never saved: each phase's deadline, stamped the first time the phase is
	 * opened. Kept here rather than in the page so stepping Back does not hand a phase a fresh clock.
	 */
	phaseEndsAt?: Partial<Record<'sight' | 'nose' | 'palate' | 'initialConclusion' | 'finalConclusion', number>>;
	/** Never saved: when the clock was paused, or null/absent while it runs. See timerClock.ts. */
	timerPausedAt?: number | null;
	soundEnabled?: boolean;
	/** Tasting a flight wine. Only `code` and `wineNumber` are saved, to link the tasting. */
	flight?: { code: string; name: string; wineNumber: number; wineCount: number } | null;
	wineName?: string;
	/**
	 * Index into PHASE_ORDER in phaseCompletion.ts. A high-water mark, not the current
	 * index, so stepping back to review an earlier phase does not un-complete later ones.
	 */
	furthestPhase?: number;
	/** Single answers, except Secondary Color(s), which is a list. */
	sight?: Record<string, string | string[]>;
	nose?: Record<string, string[]>;
	confirmNose?: string;
	palate?: Record<string, string>;
	conclusion?: {
		initial?: {
			/** 2016 grid only; still read so older saved tastings display it. */
			worldOrigin?: string | null;
			climate?: string | null;
			ageRange?: string | null;
			grapeVarieties?: string[];
			possibleCountries?: string[];
		};
		final?: Record<string, string | null>;
	};
	notes?: string;
	/** Storage key of the label photo, set by the server-issued upload. Absent until saved. */
	photoKey?: string | null;
	/** The wine as it actually was, entered after tasting. See revealScore.ts. */
	reveal?: {
		grapeVariety?: string | null;
		countryOfOrigin?: string | null;
		regionAppellation?: string | null;
		qualityLevel?: string | null;
		vintage?: string | null;
		wineName?: string | null;
	} | null;
	revealedAt?: string | null;
};
