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
});

export type TastingCreateInput = z.infer<typeof tastingCreateSchema>;
