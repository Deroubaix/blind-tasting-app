import { Prisma, type PrismaClient } from '@prisma/client';
import { revealFields } from '../../utils/revealFields';
import { type RevealInput, type TastingCreateInput } from '../../schemas/tasting';
import { apiError } from '../../utils/ApiUtils';
import type FlightService from './FlightService';
import { TASTING_FLIGHT_INCLUDE, withFlight } from './FlightService';
import type PhotoService from './PhotoService';

/** Postgres unique-constraint violation. */
const UNIQUE_VIOLATION = 'P2002';

// Also what someone else's id gets, so nothing confirms another user's tasting exists.
const notFound = () => apiError(404, 'tastingNotFound');
// Anything else in a URL (a NUL, say) would reach Postgres and come back a 500.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default class TastingService {
	constructor(
		private readonly _prisma: PrismaClient,
		private readonly _flights: FlightService,
		private readonly _photos: PhotoService,
	) {}

	/** The user's tastings, newest first, each with the flight it was submitted to. */
	public async list(userId: string) {
		const tastings = await this._prisma.tasting.findMany({
			where: { userId },
			orderBy: { number: 'desc' },
			include: TASTING_FLIGHT_INCLUDE,
		});
		return tastings.map(withFlight);
	}

	public async get(userId: string, id: string) {
		if (!UUID.test(id)) {
			throw notFound();
		}
		const tasting = await this._prisma.tasting.findFirst({
			where: { id, userId },
			include: TASTING_FLIGHT_INCLUDE,
		});
		if (!tasting) {
			throw notFound();
		}
		return withFlight(tasting);
	}

	public async create(userId: string, body: TastingCreateInput) {
		const flight = body.flight ? await this._flights.entryToSubmit(userId, body.flight) : null;
		const timed = body.timerEnabled === true && body.timerSeconds != null;

		const data = {
			userId,
			wineType: body.wineType,
			// A flight wine is tasted on the flight's grid and revealed only by the host.
			grid: flight?.grid ?? body.grid ?? 'cms',
			timerEnabled: timed,
			timerSeconds: timed ? body.timerSeconds : null,
			timerMode: timed ? (body.timerMode ?? 'guided') : null,
			notes: body.notes || null,
			confirmNose: body.confirmNose || null,
			sight: body.sight ?? Prisma.DbNull,
			nose: body.nose ?? Prisma.DbNull,
			palate: body.palate ?? Prisma.DbNull,
			conclusion: body.conclusion ?? Prisma.DbNull,
			wineName: body.wineName || null,
			photoKey: await this._photos.verifiedKey(userId, body.photoKey),
			...revealFields(flight ? null : body.reveal),
		};

		// Revealed before this arrived: saved to the archive with the host's reveal, but not in the results.
		const late = flight?.reveal ?? null;
		const tasting = await this.createWithNextNumber(
			userId,
			late ? { ...data, reveal: late, revealedAt: new Date() } : data,
		);
		const linked =
			!flight ||
			(late
				? await this._flights.linkLateTasting(flight.where, tasting.id)
				: await this._flights.linkTasting(flight.where, tasting.id));
		if (flight && !linked) {
			// Another save of this wine got there first (a double tap, or a second late save). Its photo may be the first's too.
			await this._prisma.tasting.delete({ where: { id: tasting.id } });
			throw apiError(409, 'alreadySubmitted', flight.where.flightId_userId_wineNumber.wineNumber);
		}
		return { tasting, flightLate: Boolean(late) };
	}

	/** Row first, photo after: a failure leaves an unused file, never a tasting without its photo. */
	public async delete(userId: string, id: string) {
		if (!UUID.test(id)) {
			throw notFound();
		}
		const tasting = await this._prisma.tasting.findFirst({ where: { id, userId }, select: { photoKey: true } });
		if (!tasting) {
			throw notFound();
		}

		// A flight entry outlives its tasting (tastingId goes null), so the wine reopens on the clock it started.
		await this._prisma.tasting.deleteMany({ where: { id, userId } });

		if (tasting.photoKey) {
			await this._photos.remove(tasting.photoKey);
		}
	}

	/** Sets, edits or clears (`null`) the reveal; flight wines are the host's to reveal. */
	public async setReveal(userId: string, id: string, reveal: RevealInput | null) {
		const existing = await this.get(userId, id);
		// A flight's host reveals its wines; once the host has deleted their account, the taster does.
		if (existing.flight && (await this.flightHasHost(existing.flight.code))) {
			throw apiError(409, 'flightRevealLocked');
		}
		await this._prisma.tasting.updateMany({ where: { id, userId }, data: revealFields(reveal) });
		return this.get(userId, id);
	}

	private async flightHasHost(code: string) {
		const flight = await this._prisma.flight.findUnique({ where: { code }, select: { hostId: true } });
		return !!flight?.hostId;
	}

	/** Per-account numbering; @@unique([userId, number]) is the real guard, so a P2002 retries with the next number. */
	private async createWithNextNumber(userId: string, data: Omit<Prisma.TastingUncheckedCreateInput, 'number'>) {
		const MAX_ATTEMPTS = 5;

		for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
			const last = await this._prisma.tasting.findFirst({
				where: { userId },
				orderBy: { number: 'desc' },
				select: { number: true },
			});

			try {
				return await this._prisma.tasting.create({
					data: { ...data, number: (last?.number ?? 0) + 1 },
				});
			} catch (error) {
				const isCollision =
					error instanceof Prisma.PrismaClientKnownRequestError && error.code === UNIQUE_VIOLATION;

				if (!isCollision) {
					throw error;
				}
			}
		}

		throw new Error('Could not allocate a tasting number after repeated collisions');
	}
}
