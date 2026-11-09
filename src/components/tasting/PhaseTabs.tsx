'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTastingContext } from './TastingContext';
import { phaseComplete } from './phaseCompletion';
import { type Grid, gridOf } from '../../data/grids';
import { type TimerPhase } from '../../data/timerData';
import { useModalProvider } from '../modal/ModalProvider';
import { useText } from '../../i18n/LanguageProvider';
import { layoutText } from '../../i18n/layout';
import { tastingText } from '../../i18n/tasting';

const NAV_ITEMS = {
	cms: [
		{ href: '/tastings/sight', phase: 'sight' },
		{ href: '/tastings/nose', phase: 'nose' },
		{ href: '/tastings/palate', phase: 'palate' },
		{ href: '/tastings/initial-conclusion', phase: 'initialConclusion' },
		{ href: '/tastings/final-conclusion', phase: 'finalConclusion' },
	],
	// The SAT has four steps; its conclusions live on the final-conclusion route.
	wset: [
		{ href: '/tastings/sight', phase: 'sight' },
		{ href: '/tastings/nose', phase: 'nose' },
		{ href: '/tastings/palate', phase: 'palate' },
		{ href: '/tastings/final-conclusion', phase: 'finalConclusion' },
	],
} satisfies Record<Grid, { href: string; phase: TimerPhase }[]>;

const START_OVER_MODAL = 'tasting-start-over';

/** The phases as tabs, a tick on each one done, and Start over at the end of the row. */
export default function PhaseTabs({ wineType }: { wineType?: string }) {
	const pathname = usePathname();
	const router = useRouter();
	const { tastingData, resetTastingData } = useTastingContext();
	const { openModal, closeModal } = useModalProvider();
	const t = useText(tastingText).sidebar;
	const f = useText(layoutText).tastingFooter;
	const grid = gridOf(tastingData.grid);

	// Discarding a whole session is worth the interruption: nothing is persisted until the
	// save step, so this has to name what goes before it goes.
	const startOver = () => {
		openModal({
			modalId: START_OVER_MODAL,
			title: f.startOverQ,
			className: 'StartOverModal',
			closeOnClickOutside: true,
			closeOnEsc: true,
			children: (
				<div className="dialog">
					<p className="dialog__lead">{f.clears(tastingData.flight?.wineNumber ?? null)}</p>
					<p className="dialog__note">{tastingData.flight ? f.clockRuns : f.nothingSaved}</p>
					<div className="dialog__actions">
						<button className="btn-quiet" onClick={() => closeModal(START_OVER_MODAL)}>
							{f.keepTasting}
						</button>
						<button
							className="btn-primary"
							onClick={() => {
								closeModal(START_OVER_MODAL);
								const flight = tastingData.flight;
								resetTastingData();
								router.push(flight ? `/flights/${flight.code}` : '/tastings/start');
							}}
						>
							{f.startOver}
						</button>
					</div>
				</div>
			),
		});
	};

	return (
		<div className="phase-tabs">
			<nav className="phase-tabs__nav" aria-label={t.phases}>
				{NAV_ITEMS[grid].map(({ href, phase }) => {
					const active = pathname === href;
					const done = !active && phaseComplete(href, tastingData);
					return (
						<Link
							key={href}
							href={wineType ? `${href}?wineType=${wineType}` : href}
							aria-current={active ? 'step' : undefined}
							className={`phase-tabs__tab${done ? ' phase-tabs__tab--done' : ''}`}
						>
							{t.short[grid][phase]}
							{done && (
								<>
									<span className="phase-tabs__tick" aria-hidden="true">
										✓
									</span>
									<span className="visually-hidden"> ({t.done})</span>
								</>
							)}
						</Link>
					);
				})}
			</nav>
			<button type="button" className="phase-tabs__start-over" onClick={startOver}>
				{f.startOver}
			</button>
		</div>
	);
}
