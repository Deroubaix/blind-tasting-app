// @vitest-environment jsdom
import React from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import TastingPhaseLayout from './TastingPhaseLayout';

vi.mock('next/navigation', () => ({ usePathname: () => '/red-wine/sight' }));
vi.mock('../tasting/TastingContext', () => ({
	useTastingContext: () => ({ tastingData: {}, updateTastingData: vi.fn() }),
}));
vi.mock('./TastingPageHeader', () => ({ default: () => null }));
vi.mock('./PhaseHeading', () => ({ default: () => null }));
vi.mock('./TastingFooter', () => ({ default: () => null }));
vi.mock('../tasting/PhaseTabs', () => ({ default: () => null }));

afterEach(cleanup);

const renderWith = (footer: { nextDisabled?: boolean; nextLoading?: boolean }) => {
	const onNext = vi.fn();
	render(
		<TastingPhaseLayout
			wineType="red"
			title="Sight"
			description=""
			footer={{ nextLabel: 'Next', onNext, ...footer }}
		>
			<p />
		</TastingPhaseLayout>,
	);
	fireEvent.keyDown(window, { key: 'Enter', metaKey: true });
	return onNext;
};

describe('TastingPhaseLayout Cmd+Enter', () => {
	it('goes next like the button', () => {
		expect(renderWith({})).toHaveBeenCalledTimes(1);
	});

	it('does nothing while Next is disabled or busy', () => {
		expect(renderWith({ nextDisabled: true })).not.toHaveBeenCalled();
		cleanup();
		expect(renderWith({ nextLoading: true })).not.toHaveBeenCalled();
	});
});
