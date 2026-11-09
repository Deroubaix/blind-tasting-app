import { type PrismaClient } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';
import FlightService from './FlightService';
import type RateLimitService from './RateLimitService';

// One flight: Marta hosts, Ana has joined, Eve has only the code.
const HOST = 'marta';
const TASTER = 'ana';
const VISITOR = 'eve';
const when = new Date('2026-11-04T10:00:00Z');

const user = (id: string) => ({ id, displayName: id[0].toUpperCase() + id.slice(1) });

function flightRow() {
	return {
		id: 'f1',
		code: 'B7KQ4M',
		name: 'Tuesday',
		grid: 'cms',
		hostId: HOST,
		host: user(HOST),
		wineCount: 2,
		timerSeconds: null,
		endedAt: null,
		created_at: when,
		wines: [
			{ number: 1, reveal: null, revealedAt: null },
			{ number: 2, reveal: null, revealedAt: null },
		],
		members: [{ userId: TASTER, joined_at: when, user: user(TASTER) }],
		entries: [
			{
				flightId: 'f1',
				userId: TASTER,
				wineNumber: 1,
				startedAt: when,
				tastingId: 't1',
				tasting: { id: 't1', wineType: 'Red', conclusion: null, palate: null, nose: null, created_at: when },
			},
		],
	};
}

type Query = { where: { code?: string }; include?: { members?: { where?: { userId: string } } } };

function setup(exists = true) {
	const writes: string[] = [];
	const write = (name: string) =>
		vi.fn(async () => {
			writes.push(name);
			return { startedAt: when, tastingId: null };
		});
	const prisma = {
		flight: {
			findUnique: vi.fn(async ({ include }: Query) => {
				if (!exists) {
					return null;
				}
				const row = flightRow();
				const only = include?.members?.where?.userId;
				return only ? { ...row, members: row.members.filter((m) => m.userId === only) } : row;
			}),
			update: write('flight.update'),
		},
		flightMember: { upsert: write('flightMember.upsert') },
		flightEntry: { upsert: write('flightEntry.upsert'), findUnique: vi.fn(async () => null) },
		flightWine: { update: write('flightWine.update') },
		tasting: { updateMany: write('tasting.updateMany') },
		$transaction: vi.fn(async (ops: unknown[]) => ops),
	};
	const rateLimits = { check: vi.fn(async () => {}), consume: vi.fn(async () => {}) };
	const service = new FlightService(prisma as unknown as PrismaClient, rateLimits as unknown as RateLimitService);
	return { service, writes, rateLimits };
}

const refused = (status: number, key: string) => expect.objectContaining({ statusCode: status, key });
const label = {
	qualityAssessment: null,
	readiness: null,
	grapeVariety: 'Syrah',
	countryOfOrigin: 'France',
	regionAppellation: null,
	qualityLevel: null,
	styleCategory: null,
	vintage: null,
	wineName: null,
};

describe('flight permissions', () => {
	it('shows a visitor the flight but no wines, scores or sheet', async () => {
		const { service } = setup();
		const view = await service.view('b7kq4m', VISITOR, 'en');
		expect(view.role).toBe('visitor');
		expect(view.wines).toEqual([]);
		expect(view.mine).toBeNull();
		expect(view.members.every((m) => m.submittedCount === 0 && m.total === 0)).toBe(true);
	});

	it("keeps results and the summary from anyone who hasn't joined", async () => {
		const { service } = setup();
		await expect(service.results('B7KQ4M', '1', VISITOR, 'en')).rejects.toEqual(refused(403, 'joinToSeeResults'));
		await expect(service.summary('B7KQ4M', VISITOR, 'en')).rejects.toEqual(refused(403, 'joinToSeeResults'));
	});

	it('lets only the host reveal or end the flight', async () => {
		for (const who of [TASTER, VISITOR]) {
			const { service, writes } = setup();
			await expect(service.reveal('B7KQ4M', '1', who, label)).rejects.toEqual(refused(403, 'hostOnly'));
			await expect(service.end('B7KQ4M', who)).rejects.toEqual(refused(403, 'hostOnly'));
			expect(writes).toEqual([]);
		}
	});

	it('lets the host reveal a submitted wine', async () => {
		const { service, writes } = setup();
		await expect(service.reveal('B7KQ4M', '1', HOST, label)).resolves.toEqual({ code: 'B7KQ4M', number: 1 });
		expect(writes).toEqual(['flightWine.update', 'tasting.updateMany']);
	});

	it('lets only tasters who joined open a wine', async () => {
		for (const who of [HOST, VISITOR]) {
			const { service, writes } = setup();
			await expect(service.startWine('B7KQ4M', '1', who)).rejects.toEqual(refused(403, 'joinToTaste'));
			expect(writes).toEqual([]);
		}
	});

	it("won't let the host join their own flight", async () => {
		const { service } = setup();
		await expect(service.join('B7KQ4M', HOST)).rejects.toEqual(refused(409, 'hostCannotJoin'));
	});

	it("refuses a submission from someone who hasn't joined", async () => {
		const { service } = setup();
		await expect(service.entryToSubmit(VISITOR, { code: 'B7KQ4M', wineNumber: 1 })).rejects.toEqual(
			refused(400, 'flightWineNotFound'),
		);
	});

	it('counts a wrong code against the guess limit', async () => {
		const { service, rateLimits } = setup(false);
		await expect(service.view('ZZZZZZ', VISITOR, 'en')).rejects.toEqual(refused(404, 'flightNotFound'));
		expect(rateLimits.consume).toHaveBeenCalledTimes(1);
	});
});
