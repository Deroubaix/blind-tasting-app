import { describe, expect, it } from 'vitest';
import { photoFileName, shapeExport } from './export';

const me = { id: 'me', email: 'me@example.test', displayName: 'Me', created_at: new Date('2026-01-01T00:00:00Z') };
const when = new Date('2026-11-04T10:00:00Z');

const tasting = (number: number, extra: Partial<Parameters<typeof shapeExport>[1][number]> = {}) => ({
	id: `t${number}`,
	number,
	wineType: 'Red',
	wineName: null,
	sight: null,
	nose: null,
	palate: null,
	conclusion: { final: { grapeVariety: 'Pinot Noir', countryOfOrigin: 'France' } },
	confirmNose: null,
	notes: null,
	timerEnabled: true,
	timerSeconds: 240,
	timerMode: 'guided',
	photoKey: null,
	reveal: null,
	revealedAt: null,
	created_at: when,
	flightEntry: null,
	...extra,
});

const flight = (hostId: string) => ({
	code: 'ABCDEF',
	name: 'Tuesday',
	hostId,
	wineCount: 2,
	timerSeconds: null,
	endedAt: null,
	created_at: when,
	wines: [{ number: 1, reveal: { grapeVariety: 'Syrah' }, revealedAt: when }],
	members: [
		{ userId: 'me', joined_at: when },
		{ userId: 'someone-else', joined_at: when },
	],
	entries: [
		{ userId: 'me', wineNumber: 1, startedAt: when, tastingId: 't1' },
		{ userId: 'someone-else', wineNumber: 1, startedAt: when, tastingId: 't9' },
	],
});

describe('shapeExport', () => {
	it('keeps the account to what the person gave', () => {
		const { account } = shapeExport(me, [], [], when);
		expect(account).toEqual({
			exportedAt: when,
			displayName: 'Me',
			email: 'me@example.test',
			memberSince: me.created_at,
		});
	});

	it('scores a revealed tasting and names its photo by number', () => {
		const reveal = {
			grapeVariety: 'Pinot Noir',
			countryOfOrigin: 'France',
			regionAppellation: 'Chambolle-Musigny',
		};
		const [doc] = shapeExport(me, [tasting(3, { reveal, photoKey: 'labels/me/x.jpg' })], [], when).tastings;
		expect(doc.score).toEqual({ score: 2, outOf: 3 });
		expect(doc.photo).toBe('labels/tasting-3.jpg');
		expect(doc).not.toHaveProperty('photoKey');
	});

	it('leaves an unrevealed tasting unscored and an empty reveal null', () => {
		const [doc] = shapeExport(me, [tasting(1, { reveal: { grapeVariety: '' } })], [], when).tastings;
		expect(doc.score).toBeNull();
		expect(doc.reveal).toBeNull();
		expect(doc.photo).toBeNull();
	});

	it('points a flight tasting at its flight', () => {
		const entry = { wineNumber: 2, flight: { code: 'ABCDEF', name: 'Tuesday' } };
		const [doc] = shapeExport(me, [tasting(1, { flightEntry: entry })], [], when).tastings;
		expect(doc.flight).toEqual({ code: 'ABCDEF', name: 'Tuesday', wineNumber: 2 });
	});

	it('gives a host the wines and a headcount, never the other tasters', () => {
		const [doc] = shapeExport(me, [], [flight('me')], when).flights;
		expect(doc.role).toBe('host');
		expect(doc.wines).toHaveLength(1);
		expect(doc.tasters).toBe(2);
		expect(JSON.stringify(doc)).not.toContain('someone-else');
	});

	it("gives a taster only their own entries, not the host's reveals", () => {
		const [doc] = shapeExport(me, [], [flight('host')], when).flights;
		expect(doc.role).toBe('taster');
		expect(doc.wines).toBeUndefined();
		expect(doc.entries).toEqual([{ wineNumber: 1, startedAt: when, tastingId: 't1' }]);
		expect(doc.joined_at).toEqual(when);
	});
});

describe('photoFileName', () => {
	it('is stable, so tastings.json and the archive agree', () => {
		expect(photoFileName(12)).toBe('labels/tasting-12.jpg');
	});
});
