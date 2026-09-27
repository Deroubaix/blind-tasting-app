'use client';

import FetchUtils from '../../utils/FetchUtils';
import { type Reveal } from '../../components/archives/revealScore';
import { type FlightListItem, type FlightSummary, type FlightView, type WineResults } from '../../types/Flight';

export default class ClientFlightService {
	public async list(): Promise<FlightListItem[]> {
		return (await FetchUtils.getJson<{ flights: FlightListItem[] }>('/api/flights').response).flights;
	}

	public async create(input: { name: string; wineCount: number; timerSeconds: number | null }): Promise<string> {
		return (await FetchUtils.postJson<{ code: string }>('/api/flights', input).response).code;
	}

	public async get(code: string): Promise<FlightView> {
		return (await FetchUtils.getJson<{ flight: FlightView }>(`/api/flights/${code}`).response).flight;
	}

	public async join(code: string): Promise<void> {
		await FetchUtils.post(`/api/flights/${code}/join`, {}).response;
	}

	public async end(code: string): Promise<void> {
		await FetchUtils.post(`/api/flights/${code}/end`, {}).response;
	}

	/** Opens a wine; the clock's deadline (ms) comes back, or null when untimed. */
	public async start(code: string, wineNumber: number): Promise<{ endsAt: number | null }> {
		return FetchUtils.postJson<{ endsAt: number | null }>(`/api/flights/${code}/wines/${wineNumber}/start`, {})
			.response;
	}

	public async reveal(code: string, wineNumber: number, reveal: Reveal): Promise<void> {
		await FetchUtils.execute(`/api/flights/${code}/wines/${wineNumber}`, {
			method: 'PATCH',
			credentials: 'same-origin',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ reveal }),
		}).response;
	}

	public async results(code: string, wineNumber: number): Promise<WineResults> {
		return (await FetchUtils.getJson<{ results: WineResults }>(`/api/flights/${code}/wines/${wineNumber}`).response)
			.results;
	}

	public async summary(code: string): Promise<FlightSummary> {
		return (await FetchUtils.getJson<{ summary: FlightSummary }>(`/api/flights/${code}/summary`).response).summary;
	}
}
