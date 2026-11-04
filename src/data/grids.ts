/**
 * The two tasting grids. `cms` is the 2024 CMS Americas deductive grid the app was built around;
 * `wset` is the WSET Level 3 Systematic Approach to Tasting. A tasting carries one, chosen at Start
 * (or by the host, for a flight), and everything downstream reads it: which screens, how the clock
 * splits, what the reveal asks and how it scores.
 */
export type Grid = 'cms' | 'wset';

export const DEFAULT_GRID: Grid = 'cms';

export const GRIDS: Record<Grid, { name: string; short: string; title: string; credit: string }> = {
	cms: {
		name: 'CMS deductive grid',
		short: 'CMS',
		title: '2024 Deductive Tasting Format',
		credit: 'Grid based on the 2024 Deductive Tasting Format, © Court of Master Sommeliers, Americas.',
	},
	wset: {
		name: 'WSET Level 3 SAT',
		short: 'WSET L3',
		title: 'Level 3 Systematic Approach to Tasting Wine',
		credit: 'Based on the WSET Level 3 Systematic Approach to Tasting Wine®, © Wine & Spirit Education Trust.',
	},
};

/** The grid a stored value names, with anything unknown or missing read as the original grid. */
export function gridOf(value: string | null | undefined): Grid {
	return value === 'wset' ? 'wset' : 'cms';
}
