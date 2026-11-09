// @vitest-environment jsdom
import React from 'react';
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import RevealScorecard from './RevealScorecard';
import { compareReveal } from '../../utils/revealScore';

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
	it('names every status in words, not just colour', () => {
		const { container } = render(<RevealScorecard comparison={comparison} onEdit={() => {}} />);
		const rows = within(container.querySelector('.scorecard__rows') as HTMLElement);
		for (const word of ['Correct', 'Close', 'Not called', 'Not applicable']) {
			expect(rows.getAllByText(word).length).toBeGreaterThan(0);
		}
	});

	it('gives the label only where the call differs from it', () => {
		const { container } = render(<RevealScorecard comparison={comparison} onEdit={() => {}} />);
		const labels = [...container.querySelectorAll('.scorecard__fix')].map((el) => el.lastChild?.textContent);
		expect(labels).toEqual(['Chambolle-Musigny', '2018']); // region close, vintage not called
	});

	it('marks a field left blank', () => {
		render(<RevealScorecard comparison={comparison} onEdit={() => {}} />);
		expect(screen.getAllByText('Left blank').length).toBeGreaterThan(0);
	});

	it('reports the shortlist', () => {
		const { container } = render(<RevealScorecard comparison={comparison} onEdit={() => {}} />);
		expect(container.querySelector('.scorecard__shortlist')?.textContent).toMatch(
			/the grape.*Yes.*the country.*No/,
		);
	});

	it('offers Edit reveal', () => {
		const onEdit = vi.fn();
		render(<RevealScorecard comparison={comparison} onEdit={onEdit} />);
		screen.getByRole('button', { name: 'Edit reveal' }).click();
		expect(onEdit).toHaveBeenCalled();
	});

	it('links a flight wine to its results instead of offering an edit', () => {
		render(<RevealScorecard comparison={comparison} flightHref="/flights/ABC123/wines/1" />);
		expect(screen.queryByRole('button', { name: 'Edit reveal' })).toBeNull();
		expect(screen.getByRole('link', { name: 'Flight results' }).getAttribute('href')).toBe(
			'/flights/ABC123/wines/1',
		);
	});
});
