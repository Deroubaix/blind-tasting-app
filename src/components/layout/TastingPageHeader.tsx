'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IconPlayerPauseFilled, IconPlayerPlayFilled } from '@tabler/icons-react';
import { useAuthProvider } from '../auth/AuthProvider';
import { useModalProvider } from '../modal/ModalProvider';
import { pauseClock, resumeClock } from '../../data/timerClock';
import { unlockAudio } from '../../utils/beep';
import TimerConditional from './TimerConditional';
import splitPhaseLabel from './phaseLabel';
import { useTastingContext } from '../tasting/TastingContext';

type TastingPageHeaderProps = {
	wineType?: 'red' | 'white';
	/** Phone only — the strip carries the phase and title the desktop page shows in body copy. */
	phase?: string;
	title?: string;
	timerPage?: 'sight' | 'nose' | 'palate' | 'initialConclusion' | 'finalConclusion';
	timerDestination?: string;
	cancelHref?: string;
};

export default function TastingPageHeader({
	wineType,
	phase,
	title,
	timerPage,
	timerDestination,
	cancelHref,
}: TastingPageHeaderProps) {
	const { user, isInitialLoading, signOut } = useAuthProvider();
	const { tastingData, updateTastingData } = useTastingContext();
	const { openModal, closeModal } = useModalProvider();
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
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
			title: 'Paused',
			className: 'TimeUpModal',
			closeOnClickOutside: false,
			closeOnEsc: true,
			onClose: () => updateTastingData((current) => resumeClock(current, Date.now())),
			children: (
				<div className="timeup">
					<p className="timeup__lead">The clock is stopped.</p>
					<p className="timeup__note">It carries on from where it was when you resume.</p>
					<button className="btn-primary timeup__action" onClick={() => closeModal(modalId)}>
						Resume
						<IconPlayerPlayFilled size={14} aria-hidden="true" />
					</button>
				</div>
			),
		});
	};

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

	const flight = tastingData.flight;
	const flightLabel = flight && timerPage ? `Flight · Wine ${flight.wineNumber} of ${flight.wineCount}` : null;
	const wineLabel =
		flightLabel ??
		(wineType === 'red' ? 'Red Wine Assessment' : wineType === 'white' ? 'White Wine Assessment' : null);

	const initials = user?.displayName?.[0]?.toUpperCase() ?? '';

	const wineWord = wineType === 'red' ? 'Red' : wineType === 'white' ? 'White' : null;
	const { name: phaseName, number: phaseNumber } = splitPhaseLabel(phase ?? '');

	return (
		<header className={`tasting-page-header${showTimer ? '' : ' tasting-page-header--no-timer'}`}>
			<Link href="/" className="tasting-page-header__logo">
				The Sommelier<em className="logo-serif">&apos;s</em> Ledger
			</Link>

			{title && (
				<div className="tasting-page-header__phase">
					<span className="tasting-page-header__phase-label">
						{flightLabel ?? (
							<>
								{wineWord && <>{wineWord} &middot; </>}
								{phaseName}
								{phaseNumber && <span className="tasting-page-header__phase-num"> {phaseNumber}</span>}
							</>
						)}
					</span>
					<span className="tasting-page-header__phase-title">{title}</span>
				</div>
			)}

			<div className="tasting-page-header__center">
				{showTimer && (
					<>
						<div className="tasting-page-header__clock">
							<span className="tasting-page-header__timer-label">
								{paused ? 'Paused' : 'Time Remaining'}
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
								aria-label="Pause the timer"
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
										<Link
											href="/archives"
											className="nav-dropdown__item"
											role="menuitem"
											onClick={() => setDropdownOpen(false)}
										>
											Archive
										</Link>
										<Link
											href="/flights"
											className="nav-dropdown__item"
											role="menuitem"
											onClick={() => setDropdownOpen(false)}
										>
											Flights
										</Link>
										<Link
											href="/account"
											className="nav-dropdown__item"
											role="menuitem"
											onClick={() => setDropdownOpen(false)}
										>
											Account
										</Link>
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
