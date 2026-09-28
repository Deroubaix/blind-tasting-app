import { Prisma } from '@prisma/client';
import { prisma } from './prisma';
import { formatTimerSeconds } from '../data/timerData';
import { RATE_LIMITS, check, consume } from './rateLimit';
import { JsonApiError } from '../utils/ErrorUtils';
import {
	average,
	entryStatus,
	newFlightCode,
	normalizeCode,
	type EntryStatus,
} from '../components/flights/flightLogic';
import {
	REVEAL_FIELDS,
	compareReveal,
	describeWine,
	isRevealed,
	revealTitle,
	type Reveal,
} from '../components/archives/revealScore';
import {
	type FlightListItem,
	type FlightMemberView,
	type FlightPerson,
	type FlightRole,
	type FlightSummary,
	type FlightView,
	type WineResultRow,
	type WineResults,
} from '../types/Flight';

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

const NOT_FOUND = new JsonApiError('NotFound', 'No flight has that code.', 404);

/**
 * The flight by code, for every flight route. Only misses count against the limit — guessing is
 * what it stops — and once it's used up, even a right code waits.
 */
export async function loadFlight(code: string, userId: string): Promise<LoadedFlight> {
	await check(RATE_LIMITS.flightCode, userId);
	const flight = await prisma.flight.findUnique({ where: { code: normalizeCode(code) }, include: FLIGHT_INCLUDE });
	if (!flight) {
		await consume(RATE_LIMITS.flightCode, userId);
		throw NOT_FOUND;
	}
	return flight;
}

export function roleOf(flight: LoadedFlight, userId: string): FlightRole {
	if (flight.hostId === userId) {
		return 'host';
	}
	return flight.members.some((member) => member.userId === userId) ? 'taster' : 'visitor';
}

/** Host or member; anyone else is told to join first. */
export function requireInFlight(flight: LoadedFlight, userId: string): 'host' | 'taster' {
	const role = roleOf(flight, userId);
	if (role === 'visitor') {
		throw new JsonApiError('Forbidden', 'Join the flight to see its results.', 403);
	}
	return role;
}

export function requireHost(flight: LoadedFlight, userId: string) {
	if (flight.hostId !== userId) {
		throw new JsonApiError('Forbidden', 'Only the host can do that.', 403);
	}
}

/** A new flight, with its numbered wines. Retries on the rare code collision. */
export async function createFlight(
	hostId: string,
	data: { name: string; wineCount: number; timerSeconds: number | null },
) {
	for (let attempt = 0; attempt < 5; attempt++) {
		try {
			return await prisma.flight.create({
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

function score(entry: LoadedEntry | undefined, reveal: Reveal | null) {
	if (!entry?.tasting || !reveal) {
		return null;
	}
	const conclusion = entry.tasting.conclusion as {
		final?: Record<string, string | null>;
		initial?: { grapeVarieties?: string[]; possibleCountries?: string[] };
	} | null;
	return compareReveal(conclusion?.final, reveal, conclusion?.initial);
}

const endsAt = (flight: LoadedFlight, entry: LoadedEntry) =>
	flight.timerSeconds ? new Date(entry.startedAt.getTime() + flight.timerSeconds * 1000).toISOString() : null;

/** How many scored fields the label gave: what every score for this wine is out of. */
const outOfFor = (reveal: Reveal) => REVEAL_FIELDS.filter((field) => reveal[field.key]?.trim()).length;

export function flightView(flight: LoadedFlight, userId: string): FlightView {
	const role = roleOf(flight, userId);
	const members = people(flight);
	const base = {
		code: flight.code,
		name: flight.name,
		wineCount: flight.wineCount,
		timerSeconds: flight.timerSeconds,
		ended: flight.endedAt !== null,
		createdAt: flight.created_at.toISOString(),
		host: { id: flight.host.id, name: flight.host.displayName },
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
			const result = score(entry, reveal);
			if (result) {
				scores.push(result.score);
			}
		}
		return {
			number: wine.number,
			revealed: reveal !== null,
			title: reveal ? revealTitle(reveal) : null,
			detail: reveal ? describeWine(reveal) : null,
			statuses,
			submitted: Object.values(statuses).filter((status) => status === 'submitted').length,
			average: reveal ? average(scores) : null,
			best: scores.length ? Math.max(...scores) : null,
			outOf: reveal ? outOfFor(reveal) : null,
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
			const result = score(entry, wineReveal(flight, entry.wineNumber));
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
					const result = score(entry, reveal);
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
	return `${formatTimerSeconds(left)} left`;
}

export function wineResults(flight: LoadedFlight, number: number, userId: string): WineResults {
	const reveal = wineReveal(flight, number);
	if (!reveal) {
		throw new JsonApiError('Conflict', `Wine ${number} has not been revealed yet.`, 409);
	}

	const rows: WineResultRow[] = people(flight).map((person) => {
		const entry = entryFor(flight, person.id, number);
		const result = score(entry, reveal);
		const tasting = entry?.tasting;
		const wineType = tasting?.wineType === 'Red' ? 'red' : tasting?.wineType === 'White' ? 'white' : null;
		return {
			person,
			status: entryStatus(entry, true),
			score: result?.score ?? null,
			outOf: result?.outOf ?? null,
			fields: result?.fields ?? null,
			headline: result?.headline ?? null,
			detail: result?.detail ?? null,
			wineType,
			palate: (tasting?.palate as Record<string, string> | null) ?? null,
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
		number,
		reveal,
		title: revealTitle(reveal),
		detail: describeWine(reveal),
		wineType: types.length ? (reds * 2 >= types.length ? 'red' : 'white') : null,
		rows,
		average: average(rows.map((row) => row.score)),
		outOf: outOfFor(reveal),
		best: top ? { score: top.score!, outOf: top.outOf!, name: top.person.name } : null,
		submitted: scored.length,
		memberCount: rows.length,
	};
}

export function flightSummary(flight: LoadedFlight): FlightSummary {
	const members = people(flight);
	const totals: FlightSummary['totals'] = Object.fromEntries(
		members.map((person) => [person.id, { score: 0, outOf: 0, submitted: 0 }]),
	);

	const wines = flight.wines.map((wine) => {
		const reveal = wineReveal(flight, wine.number);
		const scores: FlightSummary['wines'][number]['scores'] = {};
		for (const person of members) {
			const result = score(entryFor(flight, person.id, wine.number), reveal);
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
			title: reveal ? revealTitle(reveal) : null,
			grape: reveal?.grapeVariety ?? null,
			average: reveal ? average(Object.values(scores).map((s) => s?.score ?? null)) : null,
			outOf: reveal ? outOfFor(reveal) : null,
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
			note: confusionNote(flight, worst.number),
		};
	}

	return {
		code: flight.code,
		name: flight.name,
		createdAt: flight.created_at.toISOString(),
		hostName: flight.host.displayName,
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
function confusionNote(flight: LoadedFlight, number: number): string | null {
	const reveal = wineReveal(flight, number);
	const calls = flight.entries
		.filter((entry) => entry.wineNumber === number && entry.tasting)
		.map((entry) => score(entry, reveal)?.fields.find((field) => field.key === 'grapeVariety'))
		.filter((field) => field?.status === 'wrong' && field.call)
		.map((field) => field!.call!);
	const counts = new Map<string, number>();
	calls.forEach((call) => counts.set(call, (counts.get(call) ?? 0) + 1));
	const [grape, n] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0] ?? [];
	const submitted = flight.entries.filter((entry) => entry.wineNumber === number && entry.tasting).length;
	if (!grape || !n || n < 2) {
		return null;
	}
	const words = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
	return `${words[n] ?? n} of ${(words[submitted] ?? String(submitted)).toLowerCase()} called ${grape}.`;
}

export async function listFlights(userId: string): Promise<FlightListItem[]> {
	const flights = await prisma.flight.findMany({
		where: { OR: [{ hostId: userId }, { members: { some: { userId } } }] },
		orderBy: { created_at: 'desc' },
		include: { wines: { select: { revealedAt: true } }, _count: { select: { members: true } } },
	});
	return flights.map((flight) => ({
		code: flight.code,
		name: flight.name,
		role: flight.hostId === userId ? 'host' : 'taster',
		wineCount: flight.wineCount,
		revealed: flight.wines.filter((wine) => wine.revealedAt).length,
		memberCount: flight._count.members,
		ended: flight.endedAt !== null,
		createdAt: flight.created_at.toISOString(),
	}));
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
