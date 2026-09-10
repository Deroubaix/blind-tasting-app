export type TastingData = {
	id?: string;
	/** Per-user display number shown as "No. N". Assigned by the server on create. */
	number?: number;
	wineType: 'White' | 'Red';
	timerEnabled: boolean;
	timerDuration: number | null;
	soundEnabled?: boolean;
	wineName?: string;
	/**
	 * Index into PHASE_ORDER in phaseCompletion.ts. A high-water mark, not the current
	 * index, so stepping back to review an earlier phase does not un-complete later ones.
	 */
	furthestPhase?: number;
	sight?: Record<string, string>;
	nose?: Record<string, string[]>;
	confirmNose?: string;
	palate?: Record<string, string>;
	conclusion?: {
		initial?: {
			worldOrigin?: string | null;
			climate?: string | null;
			ageRange?: string | null;
			grapeVarieties?: string[];
			possibleCountries?: string[];
		};
		final?: Record<string, string | null>;
	};
	notes?: string;
};
