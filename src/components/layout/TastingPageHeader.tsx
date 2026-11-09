'use client';

import React, { useCallback, useRef, useState } from 'react';
import Link from 'next/link';
import Wordmark from './Wordmark';
import { BRAND } from '../../data/brand';
import Prefs from './Prefs';
import useDismiss from '../../hooks/useDismiss';
import { useRouter } from 'next/navigation';
import { IconPlayerPauseFilled } from '@tabler/icons-react';
import { useAuthProvider } from '../auth/AuthProvider';
import { useModalProvider } from '../modal/ModalProvider';
import { pauseClock, resumeClock } from '../../data/timerClock';
import { unlockAudio } from '../../utils/beep';
import TimerConditional from './TimerConditional';
import { useTastingContext } from '../tasting/TastingContext';
import { gridOf } from '../../data/grids';
import { useText } from '../../i18n/LanguageProvider';
import { commonText } from '../../i18n/common';
import { layoutText } from '../../i18n/layout';
import { tastingText } from '../../i18n/tasting';

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
	const t = useText(layoutText);
	const c = useText(commonText);
	const sidebar = useText(tastingText).sidebar;
	const { user, isInitialLoading, signOut } = useAuthProvider();
	const { tastingData, updateTastingData } = useTastingContext();
	const { openModal, closeModal } = useModalProvider();
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const avatarRef = useRef<HTMLButtonElement>(null);
	const router = useRouter();
	const isLoggedIn = !isInitialLoading && !!user;
	const showTimer = !!timerPage && !!timerDestination && !!tastingData.timerEnabled;
	const paused = !!tastingData.timerPausedAt;

	// Pausing covers the sheet, so the pause is for stepping away — a phone call, a refill — and
	// not extra thinking time with the answers still in reach.
	const pause = () => {
		unlockAudio();
		updateTastingData((current) => pauseClock(current, Date.now()));
		const modalId = 'tasting-paused';
		openModal({
			modalId,
			title: t.tastingHeader.paused,
			className: 'TimeUpModal',
			closeOnClickOutside: false,
			closeOnEsc: true,
			onClose: () => updateTastingData((current) => resumeClock(current, Date.now())),
			children: (
				<div className="dialog">
					<p className="dialog__lead">{t.tastingHeader.clockStopped}</p>
					<p className="dialog__note">{t.tastingHeader.carriesOn}</p>
					<button className="btn-primary dialog__action" onClick={() => closeModal(modalId)}>
						{t.tastingHeader.resume}
					</button>
				</div>
			),
		});
	};

	const closeDropdown = useCallback(() => setDropdownOpen(false), []);
	useDismiss(dropdownOpen, closeDropdown, dropdownRef, avatarRef);

	const handleLogout = async () => {
		setDropdownOpen(false);
		await signOut();
		router.push('/');
	};

	const flight = tastingData.flight;
	const flightLabel = flight && timerPage ? t.tastingHeader.flightWine(flight.wineNumber, flight.wineCount) : null;

	const initials = user?.displayName?.[0]?.toUpperCase() ?? '';

	const wineWord = wineType === 'red' ? c.red : wineType === 'white' ? c.white : null;
	const context =
		flightLabel ?? (wineWord ? sidebar.wineGrid(wineWord, c.grid[gridOf(tastingData.grid)].short) : null);

	return (
		<header className="tasting-page-header">
			<Link href="/" className="tasting-page-header__logo" aria-label={BRAND.name}>
				<Wordmark size="sm" />
			</Link>

			{timerPage && context && <span className="tasting-page-header__context">{context}</span>}

			<div className="tasting-page-header__center">
				{timerPage && !tastingData.timerEnabled && (
					<span className="tasting-page-header__timer-label">{t.tastingHeader.untimed}</span>
				)}
				{showTimer && (
					<>
						<div
							className={`tasting-page-header__clock${paused ? ' tasting-page-header__clock--paused' : ''}`}
						>
							<span className="tasting-page-header__timer-label" data-low={t.tastingHeader.low}>
								{paused ? t.tastingHeader.paused : t.tastingHeader.timeRemaining}
							</span>
							<div className="tasting-page-header__timer-display">
								<TimerConditional page={timerPage!} destination={timerDestination!} />
							</div>
						</div>
						{/* Not in a flight: its clock is the server's, shared with the host. */}
						{!tastingData.flight && (
							<button
								type="button"
								className="tasting-page-header__pause"
								onClick={pause}
								disabled={paused}
								aria-label={t.tastingHeader.pauseTimer}
							>
								<IconPlayerPauseFilled size={16} aria-hidden="true" />
							</button>
						)}
					</>
				)}
			</div>

			<div className="tasting-page-header__right">
				{cancelHref ? (
					<Link href={cancelHref} className="tasting-page-header__cancel">
						{c.cancel}
					</Link>
				) : (
					<>
						{isLoggedIn && (
							<div className="nav-pop" ref={dropdownRef}>
								<button
									ref={avatarRef}
									type="button"
									className="tasting-page-header__avatar"
									onClick={() => setDropdownOpen((o) => !o)}
									aria-label={t.header.accountMenu}
									aria-expanded={dropdownOpen}
								>
									{initials}
								</button>
								{dropdownOpen && (
									<div className="nav-menu nav-menu--account">
										<div className="nav-menu__profile">
											<span className="nav-profile__name">{user.displayName}</span>
											<span className="nav-profile__email">{user.email}</span>
										</div>
										<div className="nav-menu__sep" />
										<Link href="/archives" className="nav-menu__item" onClick={closeDropdown}>
											{t.header.archive}
										</Link>
										<Link href="/progress" className="nav-menu__item" onClick={closeDropdown}>
											{t.header.progress}
										</Link>
										<Link href="/flights" className="nav-menu__item" onClick={closeDropdown}>
											{t.header.flights}
										</Link>
										<Link href="/account" className="nav-menu__item" onClick={closeDropdown}>
											{t.header.account}
										</Link>
										<div className="nav-menu__sep" />
										<Prefs />
										<div className="nav-menu__sep" />
										<button
											type="button"
											className="nav-menu__item nav-menu__item--quiet"
											onClick={handleLogout}
										>
											{t.header.logOut}
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
