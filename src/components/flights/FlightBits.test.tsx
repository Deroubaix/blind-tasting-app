// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flightService, useFlight } from './FlightBits';
import { JsonApiError } from '../../utils/ErrorUtils';
import { type FlightView } from '../../types/Flight';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));

const tick = (ms: number) => act(() => vi.advanceTimersByTimeAsync(ms));

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
	cleanup();
	vi.useRealTimers();
	vi.restoreAllMocks();
});

describe('useFlight', () => {
	it('stops asking once the flight is gone', async () => {
		const get = vi
			.spyOn(flightService, 'get')
			.mockRejectedValue(new JsonApiError('Not Found', 'flightNotFound', 404));
		const { result } = renderHook(() => useFlight('ABC123', true));
		await tick(0);
		expect(get).toHaveBeenCalledTimes(1);
		expect(result.current.error).toBeTruthy();
		await tick(20_000);
		expect(get).toHaveBeenCalledTimes(1);
	});

	it('keeps polling after other errors', async () => {
		const get = vi.spyOn(flightService, 'get').mockRejectedValue(new JsonApiError('Error', 'boom', 500));
		renderHook(() => useFlight('ABC123', true));
		await tick(0);
		await tick(8_000);
		expect(get).toHaveBeenCalledTimes(3);
	});

	it("doesn't stack polls while one is still waiting", async () => {
		const get = vi.spyOn(flightService, 'get').mockReturnValue(new Promise<FlightView>(() => {}));
		renderHook(() => useFlight('ABC123', true));
		await tick(20_000);
		expect(get).toHaveBeenCalledTimes(1);
	});
});
