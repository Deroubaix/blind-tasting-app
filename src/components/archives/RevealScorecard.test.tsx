// @vitest-environment jsdom
import React from 'react';
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import RevealScorecard from './RevealScorecard';
import { compareReveal } from './revealScore';

afterEach(cleanup);

const comparison = compareReveal(
	{ grapeVariety: 'Pinot Noir', countryOfOrigin: 'France', regionAppellation: 'Gevrey-Chambertin', vintage: '' },
	{
		grapeVariety: 'Pinot Noir',
		countryOfOrigin: 'France',
		regionAppellation: 'Chambolle-Musigny',
		qualityLevel: '',
		vintage: '2018',
	},
	{ grapeVarieties: ['Pinot Noir'], possibleCountries: ['Italy'] },
);

describe('RevealScorecard', () => {
	it('gives the score in words for screen readers', () => {
		render(<RevealScorecard comparison={comparison} onEdit={() => {}} />);
		expect(screen.getByLabelText('Score: 2 out of 4')).toBeTruthy();
	});

	it('names every status in words, not just colour', () => {
		const { container } = render(<RevealScorecard comparison={comparison} onEdit={() => {}} />);
		const rows = within(container.querySelector('.reveal-rows') as HTMLElement);
		for (const word of ['Correct', 'Close', 'Not called', 'Not applicable']) {
			expect(rows.getAllByText(word).length).toBeGreaterThan(0);
		}
	});

	it('opens out only the misses, with the call struck through', () => {
		const { container } = render(<RevealScorecard comparison={comparison} onEdit={() => {}} />);
		expect(container.querySelectorAll('.reveal-miss')).toHaveLength(2); // region close, vintage not called
		expect(container.querySelector('.reveal-miss s')?.textContent).toBe('Gevrey-Chambertin');
	});

	it('reports the shortlist', () => {
		const { container } = render(<RevealScorecard comparison={comparison} onEdit={() => {}} />);
		expect(container.querySelector('.reveal-shortlist')?.textContent).toMatch(/the grape.*Yes.*the country.*No/);
	});

	it('offers Edit reveal', () => {
		const onEdit = vi.fn();
		render(<RevealScorecard comparison={comparison} onEdit={onEdit} />);
		screen.getByRole('button', { name: 'Edit reveal' }).click();
		expect(onEdit).toHaveBeenCalled();
	});
});
