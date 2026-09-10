'use client';

import React, { type ReactNode, useEffect } from 'react';
import TastingPageHeader from './TastingPageHeader';
import PhaseHeading from './PhaseHeading';
import TastingFooter from './TastingFooter';
import LeftSidebar from '../tasting/LeftSideBar';
import { usePathname } from 'next/navigation';
import { useTastingContext } from '../tasting/TastingContext';
import { phaseIndex } from '../tasting/phaseCompletion';

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
	/** Owned here rather than by each phase page: the phone header strip shows the
	 *  phase and title too, and the two must not be able to disagree. */
	phase: string;
	title: string;
	description: ReactNode;
	progress?: number;
	timerPage?: 'sight' | 'nose' | 'palate' | 'initialConclusion' | 'finalConclusion';
	timerDestination?: string;
	footer: FooterProps;
	children: ReactNode;
};

export default function TastingPhaseLayout({
	wineType,
	phase,
	title,
	description,
	progress,
	timerPage,
	timerDestination,
	footer,
	children,
}: TastingPhaseLayoutProps) {
	const pathname = usePathname();
	const { tastingData, updateTastingData } = useTastingContext();
	const furthestPhase = tastingData.furthestPhase ?? 0;

	// Advancing to a phase is what completes the ones behind it. Only ever moves
	// forward, so stepping back to review does not reset the sidebar.
	//
	// Guarded on there being a tasting at all: "Start over" empties the context while this
	// page is still mounted, and an unguarded stamp would carry the phase we are leaving
	// into the next tasting. It also stops a deep link marking phases nobody has done.
	useEffect(() => {
		if (!tastingData.wineType) {
			return;
		}
		const index = phaseIndex(pathname);
		if (index > furthestPhase) {
			updateTastingData({ furthestPhase: index });
		}
	}, [pathname, furthestPhase, updateTastingData, tastingData.wineType]);

	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			const tag = (e.target as HTMLElement).tagName;
			const isEditable = tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable;

			if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && !footer.nextLoading) {
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
			<TastingPageHeader
				wineType={wineType}
				phase={phase}
				title={title}
				timerPage={timerPage}
				timerDestination={timerDestination}
			/>
			<div className="tasting-phase-body">
				<LeftSidebar wineType={wineType} progress={progress} />
				<main id="main" className="tasting-phase-main">
					<div className="tasting-phase-content">
						<PhaseHeading phase={phase} title={title} description={description} />
						{children}
					</div>
				</main>
			</div>
			<TastingFooter {...footer} />
		</div>
	);
}
