import { describe, expect, it } from 'vitest';
import { newPhotoKey, ownsPhotoKey } from './storage';

const ALICE = '6bd80ad6-6fc6-4e85-89cc-9a1f177d51b5';
const BOB = '2ccafcaf-6490-4bb5-8f0d-08ade9dbfc92';

// ownsPhotoKey is the whole of photo access control: upload, save and serve all check it, so
// these are the cases that keep one account out of another's photos.
describe('ownsPhotoKey', () => {
	it('accepts a key issued to the same user', () => {
		expect(ownsPhotoKey(ALICE, newPhotoKey(ALICE))).toBe(true);
	});

	it("rejects another user's key", () => {
		expect(ownsPhotoKey(BOB, newPhotoKey(ALICE))).toBe(false);
	});

	it('rejects path traversal dressed up as a key', () => {
		expect(ownsPhotoKey(ALICE, `labels/${ALICE}/../${BOB}/x.jpg`)).toBe(false);
		expect(ownsPhotoKey(ALICE, `labels/${ALICE}/../../package.json`)).toBe(false);
	});

	it('rejects anything but a uuid .jpg in the user folder', () => {
		const photo = '3f40940d-0d71-4e87-a6d8-4be8dc3b012b';

		expect(ownsPhotoKey(ALICE, `labels/${ALICE}/${photo}.jpg`)).toBe(true);
		expect(ownsPhotoKey(ALICE, `labels/${ALICE}/${photo}.png`)).toBe(false);
		expect(ownsPhotoKey(ALICE, `labels/${ALICE}/${photo}.jpg/extra`)).toBe(false);
		expect(ownsPhotoKey(ALICE, `labels/${ALICE}/not-a-uuid.jpg`)).toBe(false);
		expect(ownsPhotoKey(ALICE, `other/${ALICE}/${photo}.jpg`)).toBe(false);
		expect(ownsPhotoKey(ALICE, '')).toBe(false);
	});
});

describe('newPhotoKey', () => {
	it('names a fresh file every time', () => {
		expect(newPhotoKey(ALICE)).not.toBe(newPhotoKey(ALICE));
	});
});
