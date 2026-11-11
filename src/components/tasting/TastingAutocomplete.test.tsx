// @vitest-environment jsdom
import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import TastingAutocomplete from './TastingAutocomplete';
import { termIn } from '../../i18n/terms';

afterEach(cleanup);

// Same shape as useTerm's function, whose second argument a bare .map() would fill with an index.
const pt = (value: string, question?: string) => termIn('pt', value, question);

function renderBox(typed: string) {
	const onConfirm = vi.fn();
	render(
		<TastingAutocomplete
			suggestions={['France', 'Italy', 'Portugal']}
			labelOf={pt}
			value={typed}
			onChange={() => {}}
			onConfirm={onConfirm}
			ariaLabel="Country"
		/>,
	);
	return onConfirm;
}

describe('TastingAutocomplete with translated labels', () => {
	it('suggests the Portuguese name and confirms the stored one', () => {
		const onConfirm = renderBox('fran');
		fireEvent.focus(screen.getByRole('combobox'));
		const option = screen.getByRole('option', { name: 'França' });
		fireEvent.mouseDown(option);
		expect(onConfirm).toHaveBeenCalledWith('France');
	});

	it('resolves a typed Portuguese name on Enter', () => {
		const onConfirm = renderBox('itália');
		fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Enter' });
		expect(onConfirm).toHaveBeenCalledWith('Italy');
	});

	it('keeps text outside the list as typed', () => {
		const onConfirm = renderBox('Moldávia');
		fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Enter' });
		expect(onConfirm).toHaveBeenCalledWith('Moldávia');
	});
});

describe('TastingAutocomplete with text typed but not added', () => {
	it('adds it when the taster leaves the box', () => {
		const onConfirm = renderBox('França');
		fireEvent.blur(screen.getByRole('combobox'));
		expect(onConfirm).toHaveBeenCalledWith('France');
	});

	it('adds it when the page closes, e.g. Next or the clock', () => {
		const onConfirm = renderBox('Moldávia');
		cleanup();
		expect(onConfirm).toHaveBeenCalledWith('Moldávia');
	});

	it('adds nothing for an empty box', () => {
		const empty = renderBox('  ');
		fireEvent.blur(screen.getByRole('combobox'));
		cleanup();
		expect(empty).not.toHaveBeenCalled();
	});
});
