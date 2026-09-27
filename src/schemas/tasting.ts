import { z } from 'zod';

/**
 * What a saved tasting may contain. The body arrives from the browser, so the shape is checked
 * rather than trusted: a wrong type used to reach Prisma, which threw, and the taster saw a 500
 * and lost the sheet. Parsed here, a bad field is a 400 that names it.
 *
 * The limits are generous for anything the app itself sends and exist to bound a hand-built
 * request, not to police real answers. Unknown keys the client carries in its tasting state
 * (furthestPhase, soundEnabled, the exam clock's timerEndsAt…) are dropped, as before.
 */

const MAX_ANSWERS_PER_PHASE = 80;
const answer = z.string().max(200, 'An answer is too long');
const answerList = z.array(answer).max(80, 'Too many answers in one category');

/** A phase's answers: attribute name to value, with a cap on how many attributes. */
function phaseAnswers<T extends z.ZodTypeAny>(value: T) {
	return z
		.record(z.string().max(80, 'An attribute name is too long'), value)
		.refine((answers) => Object.keys(answers).length <= MAX_ANSWERS_PER_PHASE, 'Too many answers in one phase');
}

const optionalText = (max: number, label: string) =>
	z.string().max(max, `${label} must be ${max} characters or fewer`).nullish();

/**
 * The wine as it actually was, typed from the label. Every field is optional: a label may carry
 * no quality level, and a field left blank simply drops out of the score. Empty strings are
 * stored as null so "blank" has one spelling.
 */
const revealText = (max: number) =>
	z
		.string()
		.trim()
		.max(max, `Keep each answer under ${max} characters`)
		.nullish()
		.transform((value) => value || null);

export const revealSchema = z.object({
	grapeVariety: revealText(200),
	countryOfOrigin: revealText(200),
	regionAppellation: revealText(200),
	qualityLevel: revealText(200),
	vintage: z
		.string()
		.trim()
		.refine((value) => value === '' || /^\d{4}$/.test(value), 'Vintage must be a four-digit year')
		.nullish()
		.transform((value) => value || null),
	wineName: revealText(100),
});

export type RevealInput = z.infer<typeof revealSchema>;

/** Setting, editing or clearing (null) the reveal on a saved tasting. */
export const revealUpdateSchema = z.object({ reveal: revealSchema.nullable() });

export const tastingCreateSchema = z.object({
	wineType: z.enum(['Red', 'White'], {
		errorMap: () => ({ message: 'Wine type is required' }),
	}),
	wineName: optionalText(100, 'Wine name'),
	notes: optionalText(5000, 'Notes'),
	confirmNose: optionalText(2000, 'Confirm from the Nose'),

	timerEnabled: z.boolean().optional(),
	timerSeconds: z
		.number()
		.int('Timer length must be whole seconds')
		.positive('Timer length must be positive')
		.max(3600, 'Timer length must be an hour or less')
		.nullish(),
	timerMode: z.enum(['guided', 'exam']).nullish(),

	sight: phaseAnswers(z.union([answer, answerList])).nullish(),
	nose: phaseAnswers(answerList).nullish(),
	palate: phaseAnswers(answer).nullish(),
	conclusion: z
		.object({
			initial: z
				.object({
					climate: answer.nullish(),
					ageRange: answer.nullish(),
					grapeVarieties: answerList.optional(),
					possibleCountries: answerList.optional(),
					worldOrigin: answer.nullish(),
				})
				.optional(),
			final: phaseAnswers(answer.nullable()).optional(),
		})
		.nullish(),

	// Only the shape is checked here; ownership and the upload itself are checked by the route.
	photoKey: z.string().max(200).nullish(),
	// The optional reveal on the save page, for a taster who already knows the wine.
	reveal: revealSchema.nullish(),
	// Tasted as part of a flight: links the tasting to the taster's entry for that wine.
	flight: z.object({ code: z.string().max(12), wineNumber: z.number().int().min(1).max(12) }).nullish(),
});

export type TastingCreateInput = z.infer<typeof tastingCreateSchema>;
