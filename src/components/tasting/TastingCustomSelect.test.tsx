// @vitest-environment jsdom
import React, { useState } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import TastingCustomSelect from './TastingCustomSelect';

beforeAll(() => {
	// jsdom has no layout; the component scrolls the highlighted option into view.
	Element.prototype.scrollIntoView = () => {};
});
afterEach(cleanup);

function Harness({ clearLabel }: { clearLabel?: string }) {
	const [value, setValue] = useState('');
	return (
		<>
			<span id="label">Official Quality Level</span>
			<TastingCustomSelect
				options={['Village', 'Premier Cru', 'Grand Cru']}
				value={value}
				onChange={setValue}
				labelId="label"
				clearLabel={clearLabel}
			/>
			<output>{value || '(none)'}</output>
		</>
	);
}

const combobox = () => screen.getByRole('combobox', { name: 'Official Quality Level' });
const key = (k: string) => fireEvent.keyDown(combobox(), { key: k });

describe('TastingCustomSelect from the keyboard', () => {
	it('opens with the arrow key and picks with Enter', () => {
		render(<Harness />);
		key('ArrowDown');
		expect(combobox().getAttribute('aria-expanded')).toBe('true');
		key('ArrowDown');
		key('Enter');
		expect(screen.getByText('Premier Cru', { selector: 'output' })).toBeTruthy();
		expect(combobox().getAttribute('aria-expanded')).toBe('false');
	});

	it('jumps with End and picks with Space', () => {
		render(<Harness />);
		key('ArrowDown');
		key('End');
		key(' ');
		expect(screen.getByText('Grand Cru', { selector: 'output' })).toBeTruthy();
	});

	it('points screen readers at the highlighted option', () => {
		render(<Harness />);
		key('ArrowDown');
		const active = combobox().getAttribute('aria-activedescendant');
		expect(document.getElementById(active!)?.textContent).toBe('Village');
	});

	it('closes with Escape without choosing', () => {
		render(<Harness />);
		key('ArrowDown');
		key('Escape');
		expect(combobox().getAttribute('aria-expanded')).toBe('false');
		expect(screen.getByText('(none)')).toBeTruthy();
	});

	it('clears an optional answer with its "Not applicable" entry', () => {
		render(<Harness clearLabel="Not applicable" />);
		key('ArrowDown');
		key('ArrowDown');
		key('Enter');
		expect(screen.getByText('Village', { selector: 'output' })).toBeTruthy();
		key('ArrowDown');
		key('Home');
		key('Enter');
		expect(screen.getByText('(none)')).toBeTruthy();
	});
});
