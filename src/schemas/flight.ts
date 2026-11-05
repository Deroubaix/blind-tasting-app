import { z } from 'zod';
import { MAX_WINES } from '../utils/flightLogic';
import { ALL_TIMER_PRESETS } from '../data/timerData';
import { revealSchema } from './tasting';

const presetSeconds = ALL_TIMER_PRESETS.map((preset) => preset.seconds) as number[];

export const flightCreateSchema = z.object({
	name: z.string().trim().min(1, 'Give the flight a name').max(40, 'Keep the name under 40 characters'),
	wineCount: z.number().int().min(1, 'At least one wine').max(MAX_WINES, `At most ${MAX_WINES} wines`),
	grid: z.enum(['cms', 'wset']).default('cms'),
	timerSeconds: z
		.number()
		.int()
		.refine((seconds) => presetSeconds.includes(seconds), 'Choose one of the timer presets')
		.nullable(),
});

/** The host's reveal: the same fields as a tasting's, and at least one of them. */
export const flightRevealSchema = z.object({ reveal: revealSchema });

export type FlightCreateInput = z.infer<typeof flightCreateSchema>;
