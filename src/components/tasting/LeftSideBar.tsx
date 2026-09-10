'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconEye, IconWind, IconGlass, IconBrain, IconSquareCheck, IconCheck } from '@tabler/icons-react';
import useAuthenticatedUser from '../../hooks/UseAuthenticatedUser';
import { useTastingContext } from './TastingContext';
import { phaseComplete } from './phaseCompletion';

// shortLabel is what the phone stepper shows — five segments across 390px cannot
// carry "Initial Conclusion". Both render; CSS picks one per breakpoint.
const navItems = [
	{ href: '/tastings/sight', Icon: IconEye, label: 'Sight', shortLabel: 'Sight' },
	{ href: '/tastings/nose', Icon: IconWind, label: 'Nose', shortLabel: 'Nose' },
	{ href: '/tastings/palate', Icon: IconGlass, label: 'Palate', shortLabel: 'Palate' },
	{ href: '/tastings/initial-conclusion', Icon: IconBrain, label: 'Initial Conclusion', shortLabel: 'Initial' },
	{ href: '/tastings/final-conclusion', Icon: IconSquareCheck, label: 'Final Conclusion', shortLabel: 'Final' },
];

const phaseNames: Record<string, string> = {
	'/tastings/sight': 'Sight',
	'/tastings/nose': 'Nose',
	'/tastings/palate': 'Palate',
	'/tastings/initial-conclusion': 'Initial Conclusion',
	'/tastings/final-conclusion': 'Final Conclusion',
};

type LeftSidebarProps = {
	wineType?: string;
	progress?: number;
};

export default function LeftSidebar({ wineType, progress }: LeftSidebarProps) {
	const pathname = usePathname();
	const { user, isInitialLoading } = useAuthenticatedUser();
	const { tastingData } = useTastingContext();
	const isLoggedIn = !isInitialLoading && !!user;
	const currentPhaseName = phaseNames[pathname] ?? '';

	const completedCount = navItems.filter(({ href }) => phaseComplete(href, tastingData)).length;

	return (
		<aside className="tasting-sidebar">
			<div className="tasting-sidebar__brand">
				<div className="tasting-sidebar__title">The Ledger</div>
				{isLoggedIn ? (
					<>
						<div className="tasting-sidebar__username">{user?.displayName || user?.email}</div>
						<div className="tasting-sidebar__role">Master Level Study</div>
					</>
				) : (
					<div className="tasting-sidebar__app-name">Wine Tasting App</div>
				)}
			</div>

			<div className="tasting-sidebar__exam-progress">
				<div className="tasting-sidebar__exam-label">
					Progress
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
						{currentPhaseName} Progress:
						<span className="tasting-sidebar__progress-pct">{progress}%</span>
					</div>
					<div className="tasting-sidebar__progress-track">
						{/* width is dynamic — only necessary inline style */}
						<div className="tasting-sidebar__progress-fill" style={{ width: `${progress}%` }} />
					</div>
				</div>
			)}

			<nav className="tasting-sidebar__nav">
				{navItems.map(({ href, Icon, label, shortLabel }) => {
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
							<span className="tasting-nav-item__label">{label}</span>
							<span className="tasting-nav-item__short">{shortLabel}</span>
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
