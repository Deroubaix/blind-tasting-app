import { compareReveal, describeCall, isRevealed, revealTitle } from './revealScore';
import { formatTimerSeconds } from '../data/timerData';
import { gridOf } from '../data/grids';
import { type TastingData } from '../types/TastingData';
import { archivesText } from '../i18n/archives';
import { type Lang } from '../i18n';

export type SavedTasting = TastingData & { id: string; number?: number; created_at?: string };

export type TastingRow = {
	title: string;
	call: string;
	/** The flight and wine, or the grid with the clock or your call. */
	detail: string;
	score: { score: number; outOf: number } | null;
};

/** A saved tasting as one line of a list: the archive's, and the home page's recent tastings. */
export function tastingRow(tasting: SavedTasting, lang: Lang): TastingRow {
	const { list: t, shared } = archivesText[lang];
	const final = (tasting.conclusion?.final as Record<string, string | null>) ?? {};
	const grid = gridOf(tasting.grid);
	const revealed = isRevealed(tasting.reveal);
	const result = revealed ? compareReveal(final, tasting.reveal!, null, grid, lang) : null;
	const call = describeCall(final, grid, lang);
	const title = revealed
		? revealTitle(tasting.reveal!, lang)
		: tasting.wineName || final.grapeVariety || shared.untitled;
	const detail = tasting.flight
		? t.flightWine(tasting.flight.name, tasting.flight.wineNumber)
		: [
				grid === 'wset' ? t.wset : t.cms,
				revealed || !call
					? tasting.timerSeconds
						? formatTimerSeconds(tasting.timerSeconds)
						: t.untimed
					: t.yourCall(call),
			].join(' · ');
	return {
		title,
		call,
		detail,
		score: result && result.outOf > 0 ? { score: result.score, outOf: result.outOf } : null,
	};
}
