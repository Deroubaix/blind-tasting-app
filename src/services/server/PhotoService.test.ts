import { describe, expect, it, vi } from 'vitest';
import PhotoService from './PhotoService';
import type PhotoStorageService from './PhotoStorageService';
import type RateLimitService from './RateLimitService';
import { MAX_PHOTO_BYTES } from '../../utils/PhotoKeyUtils';

function setup() {
	const storage = { uploadUrl: vi.fn(async (key: string, size: number) => `https://bucket/${key}?size=${size}`) };
	const rateLimits = { consume: vi.fn(async () => {}) };
	const photos = new PhotoService(
		() => storage as unknown as PhotoStorageService,
		rateLimits as unknown as RateLimitService,
	);
	return { photos, storage, rateLimits };
}

describe('photo upload links', () => {
	it('signs for the stated size and counts it', async () => {
		const { photos, storage, rateLimits } = setup();
		const { key } = await photos.sign('ana', 40_000);
		expect(storage.uploadUrl).toHaveBeenCalledWith(key, 40_000);
		expect(rateLimits.consume).toHaveBeenCalledTimes(1);
	});

	it('refuses a photo over the limit before signing anything', async () => {
		const { photos, storage } = setup();
		await expect(photos.sign('ana', MAX_PHOTO_BYTES + 1)).rejects.toMatchObject({ statusCode: 413 });
		expect(storage.uploadUrl).not.toHaveBeenCalled();
	});
});
