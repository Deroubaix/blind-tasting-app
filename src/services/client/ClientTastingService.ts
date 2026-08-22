'use client';

import FetchUtils from '../../utils/FetchUtils';
import { type TastingData } from '../../types/TastingData';

export type TastingResponse = {
	message: string;
	tasting: TastingData;
};

export default class ClientTastingService {
	/**
	 * Accepts a partial: the tasting context builds the record up across phases, and the server
	 * is the one that enforces the required fields (it 400s on a missing wineType).
	 */
	public saveTasting(data: Partial<TastingData>) {
		const request = FetchUtils.postJson<TastingResponse>('/api/tastings', data);
		return FetchUtils.abortableRequest(request);
	}

	public async getTastings(): Promise<TastingData[]> {
		const request = FetchUtils.getJson<{ tastings: TastingData[] }>('/api/tastings');
		const response = await request.response;
		return response.tastings;
	}

	public async getTasting(id: string): Promise<TastingData & { id: string; created_at: string }> {
		const request = FetchUtils.getJson<{ tasting: TastingData & { id: string; created_at: string } }>(
			`/api/tastings/${id}`,
		);
		const response = await request.response;
		return response.tasting;
	}
}
