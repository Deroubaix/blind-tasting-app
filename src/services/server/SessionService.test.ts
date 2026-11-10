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
	const rows = new Map<string, { id: string; userId: string }>();
	let next = 0;
	const prisma = {
		session: {
			create: vi.fn(async ({ data }: { data: { userId: string } }) => {
				const row = { id: `s${++next}`, userId: data.userId };
				rows.set(row.id, row);
				return row;
			}),
			findUnique: vi.fn(async ({ where }: { where: { id: string } }) => rows.get(where.id) ?? null),
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

	it('refuses a session that names someone else', async () => {
		const { sessions, rows } = setup();
		await sessions.start('ana');
		const sid = [...rows.keys()][0];
		jar.set('auth-token', jwt.sign({ userId: 'eve', sid }, SECRET, { algorithm: 'HS256', expiresIn: 3600 }));
		await expect(sessions.requireUserId()).rejects.toEqual(expired);
	});
});
