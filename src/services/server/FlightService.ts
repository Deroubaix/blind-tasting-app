import { Prisma, type PrismaClient } from '@prisma/client';
import { formatTimerSeconds } from '../../data/timerData';
import { DEFAULT_LANG, type Lang } from '../../i18n';
import { RATE_LIMITS } from '../../utils/RateLimitUtils';
import { apiError } from '../../utils/ApiUtils';
import {
	average,
	entryStatus,
	newFlightCode,
	normalizeCode,
	wineTypeOf,
	type EntryStatus,
} from '../../utils/flightLogic';
import {
	compareReveal,
	revealOutOf,
	describeWine,
	isRevealed,
	revealTitle,
	type Reveal,
} from '../../utils/revealScore';
import { gridOf } from '../../data/grids';
import { revealFields } from '../../utils/revealFields';
import { type FlightCreateInput } from '../../schemas/flight';
import { type RevealInput } from '../../schemas/tasting';
import {
	type FlightListItem,
	type FlightMemberView,
	type FlightPerson,
	type FlightRole,
	type FlightSummary,
	type FlightView,
	type WineResultRow,
	type WineResults,
} from '../../types/Flight';
import type RateLimitService from './RateLimitService';

const FLIGHT_INCLUDE = {
	host: { select: { id: true, displayName: true } },
	wines: { orderBy: { number: 'asc' } },
	members: { orderBy: { joined_at: 'asc' }, include: { user: { select: { id: true, displayName: true } } } },
	entries: {
		include: {
			tasting: {
				select: { id: true, wineType: true, conclusion: true, palate: true, nose: true, created_at: true },
			},
		},
	},
} satisfies Prisma.FlightInclude;

type LoadedFlight = Prisma.FlightGetPayload<{ include: typeof FLIGHT_INCLUDE }>;
type LoadedEntry = LoadedFlight['entries'][number];

function wineNumber(n: string | number, wineCount: number) {
	const number = Number(n);
	if (!Number.isInteger(number) || number < 1 || number > wineCount) {
		throw apiError(404, 'noSuchWine');
	}
	return number;
}

function roleOf(flight: LoadedFlight, userId: string): FlightRole {
	if (flight.hostId === userId) {
		return 'host';
	}
	return flight.members.some((member) => member.userId === userId) ? 'taster' : 'visitor';
}

/** Host or member; anyone else is told to join first. */
function requireInFlight(flight: LoadedFlight, userId: string): 'host' | 'taster' {
	const role = roleOf(flight, userId);
	if (role === 'visitor') {
		throw apiError(403, 'joinToSeeResults');
	}
	return role;
}

function requireHost(flight: LoadedFlight, userId: string) {
	if (flight.hostId !== userId) {
		throw apiError(403, 'hostOnly');
	}
}

// ── Shaping ───────────────────────────────────────────────────────────────────

function people(flight: LoadedFlight): FlightPerson[] {
	return flight.members.map((member, index) => ({
		id: member.userId,
		name: member.user.displayName,
		initial: (member.user.displayName.trim()[0] ?? '?').toUpperCase(),
		tint: index % 4,
	}));
}

const wineReveal = (flight: LoadedFlight, number: number) => {
	const reveal = flight.wines.find((wine) => wine.number === number)?.reveal as Reveal | null | undefined;
	return isRevealed(reveal) ? reveal : null;
};

const entryFor = (flight: LoadedFlight, userId: string, number: number) =>
	flight.entries.find((entry) => entry.userId === userId && entry.wineNumber === number);

function score(flight: LoadedFlight, entry: LoadedEntry | undefined, reveal: Reveal | null, lang: Lang = DEFAULT_LANG) {
	if (!entry?.tasting || !reveal) {
		return null;
	}
	const conclusion = entry.tasting.conclusion as {
		final?: Record<string, string | null>;
		initial?: { grapeVarieties?: string[]; possibleCountries?: string[] };
	} | null;
	return compareReveal(conclusion?.final, reveal, conclusion?.initial, gridOf(flight.grid), lang);
}

const endsAt = (flight: LoadedFlight, entry: LoadedEntry) =>
	flight.timerSeconds ? new Date(entry.startedAt.getTime() + flight.timerSeconds * 1000).toISOString() : null;

/** How many scored fields the label gave: what every score for this wine is out of. */
const outOfFor = (flight: LoadedFlight, reveal: Reveal) => revealOutOf(reveal, gridOf(flight.grid));

function flightView(flight: LoadedFlight, userId: string, lang: Lang = DEFAULT_LANG): FlightView {
	const role = roleOf(flight, userId);
	const members = people(flight);
	const base = {
		code: flight.code,
		name: flight.name,
		wineCount: flight.wineCount,
		grid: gridOf(flight.grid),
		timerSeconds: flight.timerSeconds,
		ended: flight.endedAt !== null,
		createdAt: flight.created_at.toISOString(),
		// Null once the host has deleted their account.
		host: flight.host && { id: flight.host.id, name: flight.host.displayName },
		role,
	};

	// Someone with the code but not yet in: enough to decide whether to join, no statuses or scores.
	if (role === 'visitor') {
		return {
			...base,
			members: members.map((person) => ({
				...person,
				tastingWine: null,
				endsAt: null,
				waitingOn: null,
				submittedCount: 0,
				total: 0,
				outOf: 0,
			})),
			wines: [],
			mine: null,
		};
	}

	const wines = flight.wines.map((wine) => {
		const reveal = wineReveal(flight, wine.number);
		const statuses: Record<string, EntryStatus> = {};
		const scores: number[] = [];
		for (const person of members) {
			const entry = entryFor(flight, person.id, wine.number);
			statuses[person.id] = entryStatus(entry, reveal !== null);
			const result = score(flight, entry, reveal, lang);
			if (result) {
				scores.push(result.score);
			}
		}
		return {
			number: wine.number,
			revealed: reveal !== null,
			title: reveal ? revealTitle(reveal, lang) : null,
			detail: reveal ? describeWine(reveal, lang) : null,
			statuses,
			submitted: Object.values(statuses).filter((status) => status === 'submitted').length,
			average: reveal ? average(scores) : null,
			best: scores.length ? Math.max(...scores) : null,
			outOf: reveal ? outOfFor(flight, reveal) : null,
		};
	});

	const memberViews: FlightMemberView[] = members.map((person) => {
		const entries = flight.entries.filter((entry) => entry.userId === person.id);
		const open = entries
			.filter((entry) => !entry.tastingId && !wineReveal(flight, entry.wineNumber))
			.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())[0];
		const waiting = entries
			.filter((entry) => entry.tastingId && !wineReveal(flight, entry.wineNumber))
			.sort((a, b) => b.wineNumber - a.wineNumber)[0];
		let total = 0;
		let outOf = 0;
		for (const entry of entries) {
			const result = score(flight, entry, wineReveal(flight, entry.wineNumber));
			if (result) {
				total += result.score;
				outOf += result.outOf;
			}
		}
		return {
			...person,
			tastingWine: open?.wineNumber ?? null,
			endsAt: open ? endsAt(flight, open) : null,
			waitingOn: waiting?.wineNumber ?? null,
			submittedCount: entries.filter((entry) => entry.tastingId).length,
			total,
			outOf,
		};
	});

	const mine =
		role === 'taster'
			? flight.wines.map((wine) => {
					const reveal = wineReveal(flight, wine.number);
					const entry = entryFor(flight, userId, wine.number);
					const result = score(flight, entry, reveal, lang);
					return {
						number: wine.number,
						status: entryStatus(entry, reveal !== null),
						startedAt: entry?.startedAt.toISOString() ?? null,
						endsAt: entry ? endsAt(flight, entry) : null,
						submittedAt: entry?.tasting?.created_at.toISOString() ?? null,
						score: result?.score ?? null,
						outOf: result?.outOf ?? null,
					};
				})
			: null;

	return { ...base, members: memberViews, wines, mine };
}

function clockLeft(flight: LoadedFlight, entry: LoadedEntry): string | null {
	if (!flight.timerSeconds || !entry.tasting) {
		return null;
	}
	const used = (entry.tasting.created_at.getTime() - entry.startedAt.getTime()) / 1000;
	const left = Math.max(0, Math.round(flight.timerSeconds - used));
	return formatTimerSeconds(left);
}

function wineResults(flight: LoadedFlight, number: number, userId: string, lang: Lang = DEFAULT_LANG): WineResults {
	const reveal = wineReveal(flight, number);
	if (!reveal) {
		throw apiError(409, 'notRevealedYet', number);
	}

	const rows: WineResultRow[] = people(flight).map((person) => {
		const entry = entryFor(flight, person.id, number);
		const result = score(flight, entry, reveal, lang);
		const tasting = entry?.tasting;
		const wineType = wineTypeOf(tasting?.wineType);
		return {
			person,
			status: entryStatus(entry, true),
			score: result?.score ?? null,
			outOf: result?.outOf ?? null,
			fields: result?.fields ?? null,
			headline: result?.headline ?? null,
			detail: result?.detail ?? null,
			wineType,
			palate: (tasting?.palate as Record<string, string | string[]> | null) ?? null,
			nose: Object.values((tasting?.nose as Record<string, string[]> | null) ?? {}).flat(),
			submittedLeft: entry ? clockLeft(flight, entry) : null,
			tastingId: person.id === userId ? (tasting?.id ?? null) : null,
		};
	});

	const scored = rows.filter((row) => row.score !== null);
	const top = scored.sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0];
	const types = rows.map((row) => row.wineType).filter(Boolean);
	const reds = types.filter((type) => type === 'red').length;

	return {
		code: flight.code,
		flightName: flight.name,
		wineCount: flight.wineCount,
		grid: gridOf(flight.grid),
		number,
		reveal,
		title: revealTitle(reveal, lang),
		detail: describeWine(reveal, lang),
		wineType: types.length ? (reds * 2 >= types.length ? 'red' : 'white') : null,
		rows,
		average: average(rows.map((row) => row.score)),
		outOf: outOfFor(flight, reveal),
		best: top ? { score: top.score!, outOf: top.outOf!, name: top.person.name } : null,
		submitted: scored.length,
		memberCount: rows.length,
	};
}

function flightSummary(flight: LoadedFlight, lang: Lang = DEFAULT_LANG): FlightSummary {
	const members = people(flight);
	const totals: FlightSummary['totals'] = Object.fromEntries(
		members.map((person) => [person.id, { score: 0, outOf: 0, submitted: 0 }]),
	);

	const wines = flight.wines.map((wine) => {
		const reveal = wineReveal(flight, wine.number);
		const scores: FlightSummary['wines'][number]['scores'] = {};
		for (const person of members) {
			const result = score(flight, entryFor(flight, person.id, wine.number), reveal, lang);
			scores[person.id] = result ? { score: result.score, outOf: result.outOf } : null;
			if (result) {
				totals[person.id].score += result.score;
				totals[person.id].outOf += result.outOf;
				totals[person.id].submitted += 1;
			}
		}
		return {
			number: wine.number,
			revealed: reveal !== null,
			title: reveal ? revealTitle(reveal, lang) : null,
			grape: reveal?.grapeVariety ?? null,
			average: reveal ? average(Object.values(scores).map((s) => s?.score ?? null)) : null,
			outOf: reveal ? outOfFor(flight, reveal) : null,
			scores,
		};
	});

	const revealed = wines.filter((wine) => wine.average !== null);
	const worst = [...revealed].sort((a, b) => a.average! - b.average!)[0];
	let mostConfused: FlightSummary['mostConfused'] = null;
	if (worst && revealed.length > 1) {
		mostConfused = {
			number: worst.number,
			title: worst.title!,
			average: worst.average!,
			outOf: worst.outOf!,
			note: confusionNote(flight, worst.number, lang),
		};
	}

	return {
		code: flight.code,
		name: flight.name,
		grid: gridOf(flight.grid),
		createdAt: flight.created_at.toISOString(),
		hostName: flight.host?.displayName ?? null,
		timerSeconds: flight.timerSeconds,
		members,
		wines,
		totals,
		groupAverage: average(revealed.map((wine) => wine.average)),
		groupOutOf: new Set(revealed.map((wine) => wine.outOf)).size === 1 ? revealed[0].outOf : null,
		mostConfused,
	};
}

/** "Three of four called Sangiovese", when a wrong grape was the popular call. */
function confusionNote(flight: LoadedFlight, number: number, lang: Lang): string | null {
	const reveal = wineReveal(flight, number);
	const calls = flight.entries
		.filter((entry) => entry.wineNumber === number && entry.tasting)
		.map((entry) => score(flight, entry, reveal)?.fields.find((field) => field.key === 'grapeVariety'))
		.filter((field) => field?.status === 'wrong' && field.call)
		.map((field) => field!.call!);
	const counts = new Map<string, number>();
	calls.forEach((call) => counts.set(call, (counts.get(call) ?? 0) + 1));
	const [grape, n] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0] ?? [];
	const submitted = flight.entries.filter((entry) => entry.wineNumber === number && entry.tasting).length;
	if (!grape || !n || n < 2) {
		return null;
	}
	if (lang === 'pt') {
		return `${n} de ${submitted} disseram ${grape}.`;
	}
	const words = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
	return `${words[n] ?? n} of ${(words[submitted] ?? String(submitted)).toLowerCase()} called ${grape}.`;
}

/** For tasting queries: the flight a tasting was submitted to, if any. */
export const TASTING_FLIGHT_INCLUDE = {
	flightEntry: { select: { wineNumber: true, flight: { select: { code: true, name: true, wineCount: true } } } },
} satisfies Prisma.TastingInclude;

type TastingWithEntry = Prisma.TastingGetPayload<{ include: typeof TASTING_FLIGHT_INCLUDE }>;

/** A tasting as the archive gets it, with `flight` in the shape the tasting flow uses. */
export function withFlight({ flightEntry, ...tasting }: TastingWithEntry) {
	return {
		...tasting,
		flight: flightEntry ? { ...flightEntry.flight, wineNumber: flightEntry.wineNumber } : null,
	};
}

/** Where a submitted tasting's flight entry is found again, once the tasting exists. */
export type FlightEntryWhere = { flightId_userId_wineNumber: { flightId: string; userId: string; wineNumber: number } };

export default class FlightService {
	constructor(
		private readonly _prisma: PrismaClient,
		private readonly _rateLimits: RateLimitService,
	) {}

	/**
	 * Only misses count against the limit, since guessing is what it stops. Past the limit, codes
	 * still open the flights the user hosts or has joined: mistyping one shouldn't lock them out of theirs.
	 */
	private async load(code: string, userId: string): Promise<LoadedFlight> {
		const flight = await this._prisma.flight.findUnique({
			where: { code: normalizeCode(code) },
			include: FLIGHT_INCLUDE,
		});
		if (flight && (flight.hostId === userId || flight.members.some((m) => m.userId === userId))) {
			return flight;
		}
		await this._rateLimits.check(RATE_LIMITS.flightCode, userId);
		if (!flight) {
			await this._rateLimits.consume(RATE_LIMITS.flightCode, userId);
			throw apiError(404, 'flightNotFound');
		}
		return flight;
	}

	/** The flights the user hosts or has joined, newest first. */
	public async list(userId: string): Promise<FlightListItem[]> {
		const flights = await this._prisma.flight.findMany({
			where: { OR: [{ hostId: userId }, { members: { some: { userId } } }] },
			orderBy: { created_at: 'desc' },
			include: { wines: { select: { revealedAt: true } }, _count: { select: { members: true } } },
		});
		return flights.map((flight) => ({
			code: flight.code,
			name: flight.name,
			grid: gridOf(flight.grid),
			role: flight.hostId === userId ? 'host' : 'taster',
			wineCount: flight.wineCount,
			revealed: flight.wines.filter((wine) => wine.revealedAt).length,
			memberCount: flight._count.members,
			ended: flight.endedAt !== null,
			createdAt: flight.created_at.toISOString(),
		}));
	}

	/** A new flight, with its numbered wines. Retries on the rare code collision. */
	public async create(hostId: string, data: FlightCreateInput) {
		for (let attempt = 0; attempt < 5; attempt++) {
			try {
				return await this._prisma.flight.create({
					data: {
						...data,
						code: newFlightCode(),
						hostId,
						wines: { create: Array.from({ length: data.wineCount }, (_, i) => ({ number: i + 1 })) },
					},
				});
			} catch (error) {
				if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')) {
					throw error;
				}
			}
		}
		throw new Error('Could not allocate a flight code');
	}

	/** The flight as the viewer may see it: host, taster, or someone with the code who hasn't joined. */
	public async view(code: string, userId: string, lang: Lang): Promise<FlightView> {
		return flightView(await this.load(code, userId), userId, lang);
	}

	public async join(code: string, userId: string) {
		const flight = await this.load(code, userId);
		if (flight.hostId === userId) {
			throw apiError(409, 'hostCannotJoin');
		}
		if (flight.endedAt) {
			throw apiError(409, 'flightEnded');
		}
		await this._prisma.flightMember.upsert({
			where: { flightId_userId: { flightId: flight.id, userId } },
			create: { flightId: flight.id, userId },
			update: {},
		});
		return flight.code;
	}

	/** Closes the flight to new joins and new wines. Results stay readable. */
	public async end(code: string, userId: string) {
		const flight = await this.load(code, userId);
		requireHost(flight, userId);
		await this._prisma.flight.update({ where: { id: flight.id }, data: { endedAt: flight.endedAt ?? new Date() } });
		return flight.code;
	}

	/** Stamps the clock once, so reopening the wine carries on the same clock. */
	public async startWine(code: string, n: string, userId: string) {
		const flight = await this.load(code, userId);
		if (!flight.members.some((member) => member.userId === userId)) {
			throw apiError(403, 'joinToTaste');
		}
		const number = Number(n);
		const wine = flight.wines.find((w) => w.number === number);
		if (!wine) {
			throw apiError(404, 'noSuchWine');
		}
		if (wine.revealedAt) {
			throw apiError(409, 'alreadyRevealed', number);
		}
		if (flight.endedAt) {
			throw apiError(409, 'flightEnded');
		}

		const entry = await this._prisma.flightEntry.upsert({
			where: { flightId_userId_wineNumber: { flightId: flight.id, userId, wineNumber: number } },
			create: { flightId: flight.id, userId, wineNumber: number },
			update: {},
		});
		if (entry.tastingId) {
			throw apiError(409, 'alreadySubmitted', number);
		}
		const endsAt = flight.timerSeconds ? entry.startedAt.getTime() + flight.timerSeconds * 1000 : null;
		return { startedAt: entry.startedAt.toISOString(), endsAt };
	}

	/** A revealed wine's results: everyone's call against the label, and their palate. */
	public async results(code: string, n: string, userId: string, lang: Lang): Promise<WineResults> {
		const flight = await this.load(code, userId);
		requireInFlight(flight, userId);
		return wineResults(flight, wineNumber(n, flight.wineCount), userId, lang);
	}

	/** Copies the reveal onto every submitted tasting, so each taster's archive scores it too. */
	public async reveal(code: string, n: string, userId: string, reveal: RevealInput) {
		const flight = await this.load(code, userId);
		requireHost(flight, userId);
		const number = wineNumber(n, flight.wineCount);

		const fields = revealFields(reveal);
		// Only fields this grid scores count: a reveal of nothing else would score every taster 0 of 0.
		if (fields.reveal === Prisma.DbNull || outOfFor(flight, reveal as Reveal) === 0) {
			throw apiError(400, 'revealNeedsField');
		}
		const submitted = flight.entries.filter((entry) => entry.wineNumber === number && entry.tastingId);
		if (!submitted.length) {
			throw apiError(409, 'waitForSubmission');
		}

		await this._prisma.$transaction([
			this._prisma.flightWine.update({
				where: { flightId_number: { flightId: flight.id, number } },
				data: fields,
			}),
			// By relation, not the ids loaded above, so a tasting linked meanwhile gets it too.
			this._prisma.tasting.updateMany({
				where: { flightEntry: { is: { flightId: flight.id, wineNumber: number } } },
				data: fields,
			}),
		]);
		return { code: flight.code, number };
	}

	public async summary(code: string, userId: string, lang: Lang): Promise<FlightSummary> {
		const flight = await this.load(code, userId);
		requireInFlight(flight, userId);
		return flightSummary(flight, lang);
	}

	/** The taster's entry for a flight wine, checked; `reveal` is set when the host got there first. */
	public async entryToSubmit(userId: string, { code, wineNumber }: { code: string; wineNumber: number }) {
		// No check up front: a found flight the user hasn't joined answers like a miss, so nothing leaks.
		const flight = await this._prisma.flight.findUnique({
			where: { code: normalizeCode(code) },
			include: { members: { where: { userId } }, wines: { where: { number: wineNumber } } },
		});
		if (!flight) {
			await this._rateLimits.consume(RATE_LIMITS.flightCode, userId);
		}
		if (!flight || !flight.members.length || !flight.wines.length) {
			throw apiError(400, 'flightWineNotFound');
		}
		const where: FlightEntryWhere = { flightId_userId_wineNumber: { flightId: flight.id, userId, wineNumber } };
		const entry = await this._prisma.flightEntry.findUnique({ where });
		if (!entry) {
			throw apiError(409, 'openWineFirst', wineNumber);
		}
		if (entry.tastingId || entry.lateTastingId) {
			throw apiError(409, 'alreadySubmitted', wineNumber);
		}
		const reveal = flight.wines[0].revealedAt ? (flight.wines[0].reveal as Prisma.InputJsonValue) : null;
		return { where, reveal, grid: flight.grid };
	}

	/** Records a save that came after the reveal, if no other got there first; false if one did. */
	public async linkLateTasting(where: FlightEntryWhere, tastingId: string): Promise<boolean> {
		const { flightId, userId, wineNumber } = where.flightId_userId_wineNumber;
		const { count } = await this._prisma.flightEntry.updateMany({
			where: { flightId, userId, wineNumber, tastingId: null, lateTastingId: null },
			data: { lateTastingId: tastingId },
		});
		return count > 0;
	}

	/**
	 * Links a saved tasting to its entry, if no other save got there first; false if one did.
	 * Revealed between the check and the link: copy the reveal on.
	 */
	public async linkTasting(where: FlightEntryWhere, tastingId: string): Promise<boolean> {
		const { flightId, userId, wineNumber } = where.flightId_userId_wineNumber;
		const { count } = await this._prisma.flightEntry.updateMany({
			where: { flightId, userId, wineNumber, tastingId: null },
			data: { tastingId },
		});
		if (count === 0) {
			return false;
		}
		const wine = await this._prisma.flightWine.findUnique({
			where: { flightId_number: { flightId, number: wineNumber } },
		});
		if (wine?.revealedAt) {
			await this._prisma.tasting.update({
				where: { id: tastingId },
				data: { reveal: wine.reveal as Prisma.InputJsonValue, revealedAt: wine.revealedAt },
			});
		}
		return true;
	}
}
