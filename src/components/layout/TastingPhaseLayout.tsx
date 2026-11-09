'use client';

import React, { type ReactNode, useEffect } from 'react';
import TastingPageHeader from './TastingPageHeader';
import PhaseHeading from './PhaseHeading';
import TastingFooter from './TastingFooter';
import PhaseTabs from '../tasting/PhaseTabs';
import { usePathname } from 'next/navigation';
import { useTastingContext } from '../tasting/TastingContext';
import { advanceFurthestPhase } from '../tasting/phaseCompletion';

type FooterProps = {
	onReset?: () => void;
	onBack?: () => void;
	backLabel?: string;
	nextLabel: string;
	onNext: () => void;
	nextLoading?: boolean;
	nextDisabled?: boolean;
};

type TastingPhaseLayoutProps = {
	wineType: 'red' | 'white';
	title: string;
	description: ReactNode;
	timerPage?: 'sight' | 'nose' | 'palate' | 'initialConclusion' | 'finalConclusion';
	timerDestination?: string;
	footer: FooterProps;
	children: ReactNode;
};

export default function TastingPhaseLayout({
	wineType,
	title,
	description,
	timerPage,
	timerDestination,
	footer,
	children,
}: TastingPhaseLayoutProps) {
	const pathname = usePathname();
	const { tastingData, updateTastingData } = useTastingContext();
	const furthestPhase = tastingData.furthestPhase ?? 0;

	// Advancing to a phase is what completes the ones behind it (see advanceFurthestPhase).
	//
	// Guarded on there being a tasting at all: "Start over" empties the context while this
	// page is still mounted, and an unguarded stamp would carry the phase we are leaving
	// into the next tasting. It also stops a deep link marking phases nobody has done.
	useEffect(() => {
		if (!tastingData.wineType) {
			return;
		}
		const next = advanceFurthestPhase(furthestPhase, pathname);
		if (next !== furthestPhase) {
			updateTastingData({ furthestPhase: next });
		}
	}, [pathname, furthestPhase, updateTastingData, tastingData.wineType]);

	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			const tag = (e.target as HTMLElement).tagName;
			const isEditable = tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable;

			// Same rule as the Next button: no shortcut past unanswered required questions.
			if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && !footer.nextLoading && !footer.nextDisabled) {
				e.preventDefault();
				footer.onNext();
				return;
			}

			if (e.key === 'Escape' && !isEditable && footer.onBack) {
				e.preventDefault();
				footer.onBack();
			}
		};

		window.addEventListener('keydown', handler);
		return () => window.removeEventListener('keydown', handler);
	}, [footer]);

	return (
		<div className="tasting-phase-page">
			<a className="skip-link" href="#main">
				Skip to assessment
			</a>
			<TastingPageHeader wineType={wineType} timerPage={timerPage} timerDestination={timerDestination} />
			<div className="tasting-phase-wrap">
				<PhaseTabs wineType={wineType} />
				<main id="main" className="tasting-phase-main">
					<PhaseHeading title={title} description={description} />
					{children}
				</main>
				<TastingFooter {...footer} />
			</div>
		</div>
	);
}
