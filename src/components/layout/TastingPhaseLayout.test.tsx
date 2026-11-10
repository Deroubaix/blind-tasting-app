// @vitest-environment jsdom
import React from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import TastingPhaseLayout from './TastingPhaseLayout';

const nav = vi.hoisted(() => ({ replace: vi.fn(), toast: vi.fn(), data: { wineType: 'Red' } as object }));

vi.mock('next/navigation', () => ({
	usePathname: () => '/tastings/sight',
	useRouter: () => ({ replace: nav.replace, push: vi.fn() }),
}));
vi.mock('../tasting/TastingContext', () => ({
	useTastingContext: () => ({ tastingData: nav.data, updateTastingData: vi.fn() }),
}));
vi.mock('../toast/ToastProvider', () => ({ useToastProvider: () => ({ showToast: nav.toast }) }));
vi.mock('./TastingPageHeader', () => ({ default: () => null }));
vi.mock('./PhaseHeading', () => ({ default: () => null }));
vi.mock('./TastingFooter', () => ({ default: () => null }));
vi.mock('../tasting/PhaseTabs', () => ({ default: () => null, StartOverButton: () => null }));

beforeEach(() => {
	nav.data = { wineType: 'Red' };
	nav.replace.mockClear();
	nav.toast.mockClear();
});
afterEach(cleanup);

const renderLayout = (footer: { nextDisabled?: boolean; nextLoading?: boolean } = {}) => {
	const onNext = vi.fn();
	const onBack = vi.fn();
	render(
		<TastingPhaseLayout
			wineType="red"
			title="Sight"
			description=""
			footer={{ nextLabel: 'Next', onNext, onBack, ...footer }}
		>
			<button type="button">inside</button>
		</TastingPhaseLayout>,
	);
	return { onNext, onBack };
};

const cmdEnter = () => fireEvent.keyDown(window, { key: 'Enter', metaKey: true });

describe('TastingPhaseLayout shortcuts', () => {
	it('goes next like the button', () => {
		const { onNext } = renderLayout();
		cmdEnter();
		expect(onNext).toHaveBeenCalledTimes(1);
	});

	it('does nothing while Next is disabled or busy', () => {
		expect(renderLayout({ nextDisabled: true }).onNext).not.toHaveBeenCalled();
		cmdEnter();
		cleanup();
		const { onNext } = renderLayout({ nextLoading: true });
		cmdEnter();
		expect(onNext).not.toHaveBeenCalled();
	});

	it('goes back on Escape', () => {
		const { onBack } = renderLayout();
		fireEvent.keyDown(document.body, { key: 'Escape' });
		expect(onBack).toHaveBeenCalledTimes(1);
	});

	it('leaves Escape to a menu that claimed it', () => {
		const { onBack } = renderLayout();
		const claim = (e: KeyboardEvent) => e.preventDefault();
		document.addEventListener('keydown', claim);
		fireEvent.keyDown(document.body, { key: 'Escape' });
		document.removeEventListener('keydown', claim);
		expect(onBack).not.toHaveBeenCalled();
	});

	it('ignores both keys while a dialog is open', () => {
		const { onNext, onBack } = renderLayout();
		const dialog = document.createElement('div');
		dialog.setAttribute('aria-modal', 'true');
		document.body.append(dialog);
		cmdEnter();
		fireEvent.keyDown(document.body, { key: 'Escape' });
		dialog.remove();
		expect(onNext).not.toHaveBeenCalled();
		expect(onBack).not.toHaveBeenCalled();
	});
});

describe('TastingPhaseLayout with no tasting', () => {
	it('sends a reloaded page back to the start, saying why', () => {
		nav.data = {};
		renderLayout();
		expect(nav.replace).toHaveBeenCalledWith('/tastings/start');
		expect(nav.toast).toHaveBeenCalledTimes(1);
	});

	it('stays put when there is a tasting', () => {
		renderLayout();
		expect(nav.replace).not.toHaveBeenCalled();
	});
});
