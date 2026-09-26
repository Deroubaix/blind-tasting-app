'use client';

import FetchUtils from '../../utils/FetchUtils';

type SignResponse = { key: string; uploadUrl: string };

export default class ClientPhotoService {
	/**
	 * Uploads a prepared label photo and returns the key to save the tasting with. The server names
	 * the key and says where to PUT: its own receiver on local disk, a signed bucket URL on R2. The
	 * default `same-origin` credentials send the auth cookie to the former and nothing to the latter.
	 */
	public async uploadLabelPhoto(photo: Blob): Promise<string> {
		const { key, uploadUrl } = await FetchUtils.postJson<SignResponse>('/api/photos/sign', {}).response;

		await FetchUtils.execute(uploadUrl, {
			method: 'PUT',
			headers: { 'Content-Type': 'image/jpeg' },
			body: photo,
		}).response;

		return key;
	}

	public static url(key: string) {
		return `/api/photos/${key}`;
	}
}
