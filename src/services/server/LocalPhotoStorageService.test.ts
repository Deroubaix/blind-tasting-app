import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import LocalPhotoStorageService from './LocalPhotoStorageService';

const KEY = 'labels/6bd80ad6-6fc6-4e85-89cc-9a1f177d51b5/3f40940d-0d71-4e87-a6d8-4be8dc3b012b.jpg';

describe('LocalPhotoStorageService', () => {
	let root: string;
	let storage: LocalPhotoStorageService;

	beforeEach(async () => {
		root = await mkdtemp(join(tmpdir(), 'photos-'));
		storage = new LocalPhotoStorageService(root);
	});

	afterEach(() => rm(root, { recursive: true, force: true }));

	it('writes, reads, sizes and removes a photo', async () => {
		await storage.write(KEY, Buffer.from('jpeg'));
		expect(await storage.size(KEY)).toBe(4);
		expect(new TextDecoder().decode((await storage.read(KEY))!)).toBe('jpeg');

		await storage.remove(KEY);
		expect(await storage.size(KEY)).toBeNull();
		expect(await storage.read(KEY)).toBeNull();
		expect(await storage.open(KEY)).toBeNull();
	});

	it('treats removing a missing photo as done', async () => {
		await expect(storage.remove(KEY)).resolves.toBeUndefined();
	});

	it('removes a whole folder', async () => {
		await storage.write(KEY, Buffer.from('jpeg'));
		await storage.removeFolder('labels/6bd80ad6-6fc6-4e85-89cc-9a1f177d51b5/');
		expect(await storage.size(KEY)).toBeNull();
	});

	it('refuses paths outside its root', async () => {
		await expect(storage.write('../escape.jpg', Buffer.from('x'))).rejects.toThrow(/outside/);
		await expect(storage.removeFolder('..')).rejects.toThrow(/outside/);
	});
});
