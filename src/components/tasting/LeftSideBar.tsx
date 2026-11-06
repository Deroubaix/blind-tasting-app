'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTastingContext } from './TastingContext';
import { phaseComplete } from './phaseCompletion';
import { type Grid, gridOf } from '../../data/grids';
import { type TimerPhase } from '../../data/timerData';
import { useText } from '../../i18n/LanguageProvider';
import { commonText } from '../../i18n/common';
import { tastingText } from '../../i18n/tasting';

// The phone stepper shows the short name; both render and CSS picks one per breakpoint.
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

type LeftSidebarProps = {
	wineType?: string;
	progress?: number;
};

export default function LeftSidebar({ wineType, progress }: LeftSidebarProps) {
	const pathname = usePathname();
	const { tastingData } = useTastingContext();
	const t = useText(tastingText).sidebar;
	const common = useText(commonText);
	const grid = gridOf(tastingData.grid);
	const navItems = NAV_ITEMS[grid];
	const currentPhase = navItems.find((item) => item.href === pathname)?.phase;
	const currentPhaseName = currentPhase ? common.phase[grid][currentPhase] : '';
	const wineWord = wineType === 'red' ? common.red : wineType === 'white' ? common.white : null;

	return (
		<aside className="tasting-sidebar">
			{wineWord && <p className="tasting-sidebar__wine">{t.wineGrid(wineWord, common.grid[grid].short)}</p>}

			<nav className="tasting-sidebar__nav" aria-label={t.phases}>
				{navItems.map(({ href, phase }, i) => {
					const active = pathname === href;
					const done = phaseComplete(href, tastingData);
					const linkHref = wineType ? `${href}?wineType=${wineType}` : href;
					return (
						<Link
							key={href}
							href={linkHref}
							aria-current={active ? 'page' : undefined}
							className={`tasting-nav-item${active ? ' tasting-nav-item--active' : ''}${done ? ' tasting-nav-item--done' : ''}`}
						>
							<span className="tasting-nav-item__num" aria-hidden="true">
								{i + 1}
							</span>
							<span className="tasting-nav-item__label">{common.phase[grid][phase]}</span>
							<span className="tasting-nav-item__short">{t.short[grid][phase]}</span>
						</Link>
					);
				})}
			</nav>

			{progress !== undefined && currentPhaseName && (
				<div className="tasting-sidebar__progress">
					<span className="tasting-sidebar__progress-label">
						{t.phaseProgress(currentPhaseName, progress)}
					</span>
					<span className="tasting-sidebar__progress-track">
						{/* width is dynamic — only necessary inline style */}
						<span className="tasting-sidebar__progress-fill" style={{ width: `${progress}%` }} />
					</span>
				</div>
			)}
		</aside>
	);
}
