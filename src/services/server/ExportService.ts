import { Zip, ZipDeflate, ZipPassThrough } from 'fflate';
import { type PrismaClient } from '@prisma/client';
import { readPhoto } from '../../lib/storage';
import { compareReveal, isRevealed, type Reveal } from '../../components/archives/revealScore';
import { gridOf } from '../../data/grids';

/**
 * Everything the app holds about one person, as a ZIP of JSON files and the label photos. Only
 * their own data goes in: a flight they joined is listed by name and code, not by who else was there.
 */

type ExportUser = { id: string; email: string; displayName: string; created_at: Date | null };

type ExportTasting = {
	id: string;
	number: number;
	wineType: string | null;
	grid: string;
	wineName: string | null;
	sight: unknown;
	nose: unknown;
	palate: unknown;
	conclusion: unknown;
	confirmNose: string | null;
	notes: string | null;
	timerEnabled: boolean;
	timerSeconds: number | null;
	timerMode: string | null;
	photoKey: string | null;
	reveal: unknown;
	revealedAt: Date | null;
	created_at: Date;
	flightEntry: { wineNumber: number; flight: { code: string; name: string } } | null;
};

type ExportFlight = {
	code: string;
	name: string;
	hostId: string;
	wineCount: number;
	timerSeconds: number | null;
	endedAt: Date | null;
	created_at: Date;
	wines: { number: number; reveal: unknown; revealedAt: Date | null }[];
	members: { userId: string; joined_at: Date }[];
	entries: { userId: string; wineNumber: number; startedAt: Date; tastingId: string | null }[];
};

/** The photo's name inside the archive: by tasting number, which is what the person knows it as. */
export const photoFileName = (number: number) => `labels/tasting-${number}.jpg`;

/** Shapes the rows into the three JSON documents. Pure, so the layout is pinned by tests. */
export function shapeExport(user: ExportUser, tastings: ExportTasting[], flights: ExportFlight[], exportedAt: Date) {
	const account = {
		exportedAt,
		displayName: user.displayName,
		email: user.email,
		memberSince: user.created_at,
	};

	const tastingDocs = tastings.map(({ photoKey, flightEntry, reveal, ...tasting }) => {
		const revealed = isRevealed(reveal as Reveal | null);
		const call = (tasting.conclusion as { final?: Record<string, string | null>; initial?: never } | null)?.final;
		return {
			...tasting,
			reveal: revealed ? reveal : null,
			score: revealed
				? (({ score, outOf }) => ({ score, outOf }))(
						compareReveal(call, reveal as Reveal, null, gridOf(tasting.grid)),
					)
				: null,
			photo: photoKey ? photoFileName(tasting.number) : null,
			flight: flightEntry
				? { code: flightEntry.flight.code, name: flightEntry.flight.name, wineNumber: flightEntry.wineNumber }
				: null,
		};
	});

	const flightDocs = flights.map((flight) => {
		const host = flight.hostId === user.id;
		return {
			code: flight.code,
			name: flight.name,
			role: host ? 'host' : 'taster',
			wineCount: flight.wineCount,
			timerSeconds: flight.timerSeconds,
			created_at: flight.created_at,
			endedAt: flight.endedAt,
			joined_at: flight.members.find((member) => member.userId === user.id)?.joined_at ?? null,
			// The reveals are the host's entries; a taster sees them in their own tastings instead.
			wines: host ? flight.wines : undefined,
			tasters: host ? flight.members.length : undefined,
			entries: flight.entries
				.filter((entry) => entry.userId === user.id)
				.map(({ wineNumber, startedAt, tastingId }) => ({ wineNumber, startedAt, tastingId })),
		};
	});

	return { account, tastings: tastingDocs, flights: flightDocs };
}

const README = `This is everything The Sommelier's Ledger holds about you.

account.json   your account details
tastings.json  every tasting you saved, with its reveal and score where you entered the label
flights.json   flights you hosted or joined; for a hosted flight, the wines and their reveals
labels/        your label photos, named by tasting number

Dates are UTC, in ISO 8601. Other people's names are not included.
`;

export default class ExportService {
	constructor(private readonly _prisma: PrismaClient) {}

	/** The archive as a stream, so a photo-heavy account never has to fit in memory at once. */
	public async archive(userId: string): Promise<ReadableStream<Uint8Array>> {
		const [user, tastings, flights] = await Promise.all([
			this._prisma.user.findUniqueOrThrow({
				where: { id: userId },
				select: { id: true, email: true, displayName: true, created_at: true },
			}),
			this._prisma.tasting.findMany({
				where: { userId },
				orderBy: { number: 'asc' },
				select: {
					id: true,
					number: true,
					wineType: true,
					grid: true,
					wineName: true,
					sight: true,
					nose: true,
					palate: true,
					conclusion: true,
					confirmNose: true,
					notes: true,
					timerEnabled: true,
					timerSeconds: true,
					timerMode: true,
					photoKey: true,
					reveal: true,
					revealedAt: true,
					created_at: true,
					flightEntry: { select: { wineNumber: true, flight: { select: { code: true, name: true } } } },
				},
			}),
			this._prisma.flight.findMany({
				where: { OR: [{ hostId: userId }, { members: { some: { userId } } }] },
				orderBy: { created_at: 'asc' },
				include: {
					wines: { orderBy: { number: 'asc' }, select: { number: true, reveal: true, revealedAt: true } },
					members: { select: { userId: true, joined_at: true } },
					entries: { select: { userId: true, wineNumber: true, startedAt: true, tastingId: true } },
				},
			}),
		]);

		const docs = shapeExport(user, tastings, flights, new Date());
		const photos = tastings
			.filter((t) => t.photoKey)
			.map((t) => ({ key: t.photoKey!, name: photoFileName(t.number) }));
		const encoder = new TextEncoder();

		return new ReadableStream<Uint8Array>({
			async start(controller) {
				const zip = new Zip((error, data, final) => {
					if (error) {
						controller.error(error);
						return;
					}
					controller.enqueue(data);
					if (final) {
						controller.close();
					}
				});

				const addText = (name: string, text: string) => {
					const file = new ZipDeflate(name, { level: 6 });
					zip.add(file);
					file.push(encoder.encode(text), true);
				};

				try {
					addText('README.txt', README);
					addText('account.json', JSON.stringify(docs.account, null, 2));
					addText('tastings.json', JSON.stringify(docs.tastings, null, 2));
					addText('flights.json', JSON.stringify(docs.flights, null, 2));
					for (const photo of photos) {
						const bytes = await readPhoto(photo.key);
						if (!bytes) {
							continue;
						}
						// JPEGs don't compress, so store them as they are.
						const file = new ZipPassThrough(photo.name);
						zip.add(file);
						file.push(bytes, true);
					}
					zip.end();
				} catch (error) {
					controller.error(error);
				}
			},
		});
	}
}
