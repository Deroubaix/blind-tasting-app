'use client';

import React, { type ReactNode, useEffect, useLayoutEffect, useRef } from 'react';
import TastingPageHeader from './TastingPageHeader';
import PhaseHeading from './PhaseHeading';
import TastingFooter from './TastingFooter';
import PhaseTabs, { StartOverButton } from '../tasting/PhaseTabs';
import { usePathname, useRouter } from 'next/navigation';
import { useTastingContext } from '../tasting/TastingContext';
import { advanceFurthestPhase } from '../tasting/phaseCompletion';
import { useToastProvider } from '../toast/ToastProvider';
import { useText } from '../../i18n/LanguageProvider';
import { tastingText } from '../../i18n/tasting';

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
	const router = useRouter();
	const { showToast } = useToastProvider();
	const text = useText(tastingText);

	// The sheet lives only in memory, so after a reload or a deep link there is nothing to fill in or
	// save. Checked once on arrival: Start over empties it on purpose and navigates itself.
	const arrivedEmpty = useRef(!tastingData.wineType);
	useEffect(() => {
		if (arrivedEmpty.current) {
			showToast({ title: text.lost.title, children: text.lost.body, color: 'error' });
			router.replace('/tastings/start');
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

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

	const latestFooter = useRef(footer);
	useLayoutEffect(() => {
		latestFooter.current = footer;
	});

	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			// A menu took the key, or a dialog is open over the page: neither is a page shortcut.
			if (e.defaultPrevented || document.querySelector('[aria-modal="true"]')) {
				return;
			}
			const tag = (e.target as HTMLElement).tagName;
			const isEditable = tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable;

			// Same rule as the Next button: no shortcut past unanswered required questions.
			if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && !footer.nextLoading && !footer.nextDisabled) {
				e.preventDefault();
				if (isEditable) {
					// Leaving the box adds what was typed; Next then runs with it, on the next render.
					(e.target as HTMLElement).blur();
					setTimeout(() => latestFooter.current.onNext());
				} else {
					footer.onNext();
				}
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
				{text.skipToSheet}
			</a>
			<TastingPageHeader wineType={wineType} timerPage={timerPage} timerDestination={timerDestination} />
			<div className="tasting-phase-wrap">
				<PhaseTabs wineType={wineType} />
				<main id="main" className="tasting-phase-main">
					<PhaseHeading
						title={title}
						description={description}
						aside={<StartOverButton className="start-over phase-head__start-over" />}
					/>
					{children}
				</main>
				<TastingFooter
					{...footer}
					start={<StartOverButton className="start-over tasting-footer__start-over" />}
				/>
			</div>
		</div>
	);
}
