import { type PrismaClient } from '@prisma/client';
import { gridOf } from '../../data/grids';
import { wineTypeOf } from '../../utils/flightLogic';
import { type FlightWineCalls, type PalateSample, palateSamplesFor } from '../../utils/progressStats';

/** What the Progress page can't work out from the user's own tastings: how their palate calls sit in flights. */
export default class ProgressService {
	constructor(private readonly _prisma: PrismaClient) {}

	/** Revealed wines only: before the reveal, the other tasters' calls are theirs alone, as on the results page. */
	public async palateSamples(userId: string): Promise<PalateSample[]> {
		const entries = await this._prisma.flightEntry.findMany({
			where: { userId, tastingId: { not: null } },
			select: {
				wineNumber: true,
				flight: {
					select: {
						grid: true,
						wines: { where: { revealedAt: { not: null } }, select: { number: true } },
						entries: {
							where: { tastingId: { not: null } },
							select: {
								userId: true,
								wineNumber: true,
								tasting: { select: { palate: true, wineType: true } },
							},
						},
					},
				},
			},
		});

		const wines: FlightWineCalls[] = entries
			.filter(({ wineNumber, flight }) => flight.wines.some((wine) => wine.number === wineNumber))
			.map(({ wineNumber, flight }) => ({
				grid: gridOf(flight.grid),
				answers: flight.entries.flatMap(({ userId: personId, wineNumber: number, tasting }) => {
					const wineType = wineTypeOf(tasting?.wineType);
					if (number !== wineNumber || !tasting || !wineType) {
						return [];
					}
					const palate = tasting.palate as Record<string, string | string[]> | null;
					return [{ personId, wineType, palate }];
				}),
			}));
		return palateSamplesFor(userId, wines);
	}
}
