'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconEye, IconWind, IconGlass, IconBrain, IconSquareCheck, IconCheck } from '@tabler/icons-react';
import useAuthenticatedUser from '../../hooks/UseAuthenticatedUser';
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
		{ href: '/tastings/sight', Icon: IconEye, phase: 'sight' },
		{ href: '/tastings/nose', Icon: IconWind, phase: 'nose' },
		{ href: '/tastings/palate', Icon: IconGlass, phase: 'palate' },
		{ href: '/tastings/initial-conclusion', Icon: IconBrain, phase: 'initialConclusion' },
		{ href: '/tastings/final-conclusion', Icon: IconSquareCheck, phase: 'finalConclusion' },
	],
	// The SAT has four steps; its conclusions live on the final-conclusion route.
	wset: [
		{ href: '/tastings/sight', Icon: IconEye, phase: 'sight' },
		{ href: '/tastings/nose', Icon: IconWind, phase: 'nose' },
		{ href: '/tastings/palate', Icon: IconGlass, phase: 'palate' },
		{ href: '/tastings/final-conclusion', Icon: IconSquareCheck, phase: 'finalConclusion' },
	],
} satisfies Record<Grid, { href: string; Icon: unknown; phase: TimerPhase }[]>;

type LeftSidebarProps = {
	wineType?: string;
	progress?: number;
};

export default function LeftSidebar({ wineType, progress }: LeftSidebarProps) {
	const pathname = usePathname();
	const { user, isInitialLoading } = useAuthenticatedUser();
	const { tastingData } = useTastingContext();
	const t = useText(tastingText).sidebar;
	const common = useText(commonText);
	const isLoggedIn = !isInitialLoading && !!user;
	const grid = gridOf(tastingData.grid);
	const navItems = NAV_ITEMS[grid];
	const currentPhase = navItems.find((item) => item.href === pathname)?.phase;
	const currentPhaseName = currentPhase ? common.phase[grid][currentPhase] : '';
	const role = grid === 'wset' ? t.study(common.grid.wset.short) : t.masterStudy;

	const completedCount = navItems.filter(({ href }) => phaseComplete(href, tastingData)).length;

	return (
		<aside className="tasting-sidebar">
			<div className="tasting-sidebar__brand">
				<div className="tasting-sidebar__title">The Sommelier&apos;s Ledger</div>
				{isLoggedIn ? (
					<>
						<div className="tasting-sidebar__username">{user?.displayName || user?.email}</div>
						<div className="tasting-sidebar__role">{role}</div>
					</>
				) : (
					<div className="tasting-sidebar__app-name">{t.appName[grid]}</div>
				)}
			</div>

			<div className="tasting-sidebar__exam-progress">
				<div className="tasting-sidebar__exam-label">
					{t.progress}
					<span className="tasting-sidebar__exam-count">
						{completedCount} / {navItems.length}
					</span>
				</div>
				<div className="tasting-sidebar__exam-segments">
					{navItems.map(({ href }) => {
						const done = phaseComplete(href, tastingData);
						const active = pathname === href;
						const cls = done
							? ' tasting-sidebar__exam-segment--done'
							: active
								? ' tasting-sidebar__exam-segment--active'
								: '';
						return <div key={href} className={`tasting-sidebar__exam-segment${cls}`} />;
					})}
				</div>
			</div>

			{progress !== undefined && currentPhaseName && (
				<div className="tasting-sidebar__progress-section">
					<div className="tasting-sidebar__progress-label">
						{t.phaseProgress(currentPhaseName)}
						<span className="tasting-sidebar__progress-pct">{progress}%</span>
					</div>
					<div className="tasting-sidebar__progress-track">
						{/* width is dynamic — only necessary inline style */}
						<div className="tasting-sidebar__progress-fill" style={{ width: `${progress}%` }} />
					</div>
				</div>
			)}

			<nav className="tasting-sidebar__nav">
				{navItems.map(({ href, Icon, phase }) => {
					const active = pathname === href;
					const done = phaseComplete(href, tastingData);
					const linkHref = wineType ? `${href}?wineType=${wineType}` : href;
					return (
						<Link
							key={href}
							href={linkHref}
							className={`tasting-nav-item${active ? ' tasting-nav-item--active' : ''}`}
						>
							<Icon size={16} />
							<span className="tasting-nav-item__label">{common.phase[grid][phase]}</span>
							<span className="tasting-nav-item__short">{t.short[grid][phase]}</span>
							{done ? (
								<IconCheck size={15} strokeWidth={2.5} className="tasting-nav-item__check" />
							) : (
								<span className="tasting-nav-item__dot" />
							)}
						</Link>
					);
				})}
			</nav>
		</aside>
	);
}
