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
		const timed = body.timerEnabled === true && body.timerSeconds != null;

		const data = {
			userId,
			wineType: body.wineType,
			grid: body.grid ?? 'cms',
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
			...revealFields(body.reveal),
		};

		const flight = body.flight ? await this._flights.entryToSubmit(userId, body.flight) : null;
		// Revealed before this arrived: saved to the archive with the host's reveal, but not in the results.
		const late = flight?.reveal ?? null;
		const tasting = await this.createWithNextNumber(
			userId,
			late ? { ...data, reveal: late, revealedAt: new Date() } : data,
		);
		if (flight && !late) {
			await this._flights.linkTasting(flight.where, tasting.id);
		}
		return { tasting, flightLate: Boolean(late) };
	}

	/** Row first, photo after: a failure leaves an unused file, never a tasting without its photo. */
	public async delete(userId: string, id: string) {
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
		if (existing.flight) {
			throw apiError(409, 'flightRevealLocked');
		}
		await this._prisma.tasting.updateMany({ where: { id, userId }, data: revealFields(reveal) });
		return this.get(userId, id);
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
