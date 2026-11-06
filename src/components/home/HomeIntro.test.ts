import { describe, expect, it } from 'vitest';
import { sampleScorecard } from './HomeIntro';

describe('the home page sample scorecard', () => {
	it.each(['en', 'pt'] as const)('scores 3 / 5 with one close and one wrong (%s)', (lang) => {
		const card = sampleScorecard(lang);
		expect(card.fields.map((f) => f.status)).toEqual(['correct', 'correct', 'close', 'wrong', 'correct']);
		expect([card.score, card.outOf]).toEqual([3, 5]);
	});
});
