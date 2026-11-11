import { type PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SessionService from './SessionService';

const jar = vi.hoisted(() => new Map<string, string>());
vi.mock('next/headers', () => ({
	cookies: async () => ({
		get: (name: string) => (jar.has(name) ? { value: jar.get(name) } : undefined),
		set: (name: string, value: string) => (value ? jar.set(name, value) : jar.delete(name)),
	}),
}));

const SECRET = 'test-secret';
process.env.JWT_SECRET = SECRET;

function setup() {
	type Row = { id: string; userId: string; expiresAt: Date };
	const rows = new Map<string, Row>();
	let next = 0;
	const prisma = {
		session: {
			create: vi.fn(async ({ data }: { data: Omit<Row, 'id'> }) => {
				const row = { id: `s${++next}`, ...data };
				rows.set(row.id, row);
				return row;
			}),
			findUnique: vi.fn(async ({ where }: { where: { id: string } }) => rows.get(where.id) ?? null),
			update: vi.fn(async ({ where, data }: { where: { id: string }; data: { expiresAt: Date } }) => {
				rows.get(where.id)!.expiresAt = data.expiresAt;
			}),
			deleteMany: vi.fn(async ({ where }: { where: { id?: string; userId?: string } }) => {
				for (const row of [...rows.values()]) {
					if (row.id === where.id || row.userId === where.userId) {
						rows.delete(row.id);
					}
				}
				return { count: 0 };
			}),
		},
	};
	return { sessions: new SessionService(prisma as unknown as PrismaClient), rows };
}

const expired = expect.objectContaining({ statusCode: 401 });

beforeEach(() => jar.clear());

describe('sessions', () => {
	it('signs in and is recognised', async () => {
		const { sessions } = setup();
		await sessions.start('ana');
		await expect(sessions.requireUserId()).resolves.toBe('ana');
	});

	it('logging out stops a copied token working', async () => {
		const { sessions } = setup();
		await sessions.start('ana');
		const copied = jar.get('auth-token')!;
		await sessions.end();
		jar.set('auth-token', copied);
		await expect(sessions.requireUserId()).rejects.toEqual(expired);
	});

	it('logging out ends only this browser', async () => {
		const { sessions } = setup();
		await sessions.start('ana');
		const laptop = jar.get('auth-token')!;
		await sessions.start('ana');
		await sessions.end();
		jar.set('auth-token', laptop);
		await expect(sessions.requireUserId()).resolves.toBe('ana');
	});

	it('ending all signs out every browser', async () => {
		const { sessions } = setup();
		await sessions.start('ana');
		await sessions.endAll('ana');
		await expect(sessions.requireUserId()).rejects.toEqual(expired);
	});

	it('refuses a token from before sessions were recorded', async () => {
		const { sessions } = setup();
		jar.set('auth-token', jwt.sign({ userId: 'ana' }, SECRET, { algorithm: 'HS256', expiresIn: 3600 }));
		await expect(sessions.requireUserId()).rejects.toEqual(expired);
	});

	it('ends a session left unused past its end', async () => {
		const { sessions, rows } = setup();
		await sessions.start('ana');
		[...rows.values()][0].expiresAt = new Date(Date.now() - 1000);
		await expect(sessions.requireUserId()).rejects.toEqual(expired);
	});

	it('pushes the end out again when used a day or more later', async () => {
		const { sessions, rows } = setup();
		await sessions.start('ana');
		const row = [...rows.values()][0];
		const DAY = 24 * 60 * 60 * 1000;
		row.expiresAt = new Date(Date.now() + 5 * DAY);
		await expect(sessions.requireUserId()).resolves.toBe('ana');
		expect(row.expiresAt.getTime()).toBeGreaterThan(Date.now() + 29 * DAY);
	});

	it('refuses a session that names someone else', async () => {
		const { sessions, rows } = setup();
		await sessions.start('ana');
		const sid = [...rows.keys()][0];
		jar.set('auth-token', jwt.sign({ userId: 'eve', sid }, SECRET, { algorithm: 'HS256', expiresIn: 3600 }));
		await expect(sessions.requireUserId()).rejects.toEqual(expired);
	});
});
