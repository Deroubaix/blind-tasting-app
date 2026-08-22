'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthProvider } from '../auth/AuthProvider';
import TimerConditional from './TimerConditional';
import { useTastingContext } from '../tasting/TastingContext';

type TastingPageHeaderProps = {
	wineType?: 'red' | 'white';
	timerPage?: 'sight' | 'nose' | 'palate' | 'initialConclusion' | 'finalConclusion';
	timerDestination?: string;
	cancelHref?: string;
};

export default function TastingPageHeader({
	wineType,
	timerPage,
	timerDestination,
	cancelHref,
}: TastingPageHeaderProps) {
	const { user, isInitialLoading, signOut } = useAuthProvider();
	const { tastingData } = useTastingContext();
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const router = useRouter();
	const isLoggedIn = !isInitialLoading && !!user;
	const showTimer = !!timerPage && !!timerDestination && !!tastingData.timerEnabled;

	useEffect(() => {
		if (!dropdownOpen) {
			return;
		}
		const handler = (e: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
				setDropdownOpen(false);
			}
		};
		document.addEventListener('mousedown', handler);
		return () => document.removeEventListener('mousedown', handler);
	}, [dropdownOpen]);

	const handleLogout = async () => {
		setDropdownOpen(false);
		await signOut();
		router.push('/');
	};

	const wineLabel =
		wineType === 'red' ? 'Red Wine Assessment' : wineType === 'white' ? 'White Wine Assessment' : null;

	const initials = user?.displayName?.[0]?.toUpperCase() ?? '';

	return (
		<header className={`tasting-page-header${showTimer ? '' : ' tasting-page-header--no-timer'}`}>
			<Link href="/" className="tasting-page-header__logo">
				The Sommelier<em className="logo-serif">&apos;s</em> Ledger
			</Link>

			<div className="tasting-page-header__center">
				{showTimer && (
					<>
						<span className="tasting-page-header__timer-label">Time Remaining</span>
						<div className="tasting-page-header__timer-display">
							<TimerConditional page={timerPage!} destination={timerDestination!} />
						</div>
					</>
				)}
			</div>

			<div className="tasting-page-header__right">
				{cancelHref ? (
					<Link href={cancelHref} className="tasting-page-header__cancel">
						Cancel
					</Link>
				) : (
					<>
						{wineLabel && <span className="tasting-page-header__wine-label">{wineLabel}</span>}
						{isLoggedIn && (
							<div className="nav-user" ref={dropdownRef}>
								<button
									className="tasting-page-header__avatar"
									onClick={() => setDropdownOpen((o) => !o)}
									aria-label="Account menu"
									aria-expanded={dropdownOpen}
									aria-haspopup="true"
								>
									{initials}
								</button>
								{dropdownOpen && (
									<div className="nav-dropdown" role="menu">
										<div className="nav-dropdown__profile">
											<span className="nav-dropdown__name">{user.displayName}</span>
											<span className="nav-dropdown__email">{user.email}</span>
										</div>
										<div className="nav-dropdown__divider" />
										<button
											className="nav-dropdown__item nav-dropdown__item--logout"
											role="menuitem"
											onClick={handleLogout}
										>
											Log Out
										</button>
									</div>
								)}
							</div>
						)}
					</>
				)}
			</div>
		</header>
	);
}
