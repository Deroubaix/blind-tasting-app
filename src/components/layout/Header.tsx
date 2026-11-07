'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { IconChevronDown, IconChevronRight, IconMenu2, IconX } from '@tabler/icons-react';
import useAuthenticatedUser from '../../hooks/useAuthenticatedUser';
import useDismiss from '../../hooks/useDismiss';
import { useAuthProvider } from '../auth/AuthProvider';
import Wordmark from './Wordmark';
import CodeForm from './CodeForm';
import Prefs from './Prefs';
import LanguageSwitch from '../../i18n/LanguageSwitch';
import { useText } from '../../i18n/LanguageProvider';
import { commonText } from '../../i18n/common';
import { layoutText } from '../../i18n/layout';

type Open = 'start' | 'flights' | 'account' | 'sheet' | 'menu' | null;
type HeaderText = (typeof layoutText)['en']['header'];

/** A link with a line of explanation under it: the Start and Flights menus. */
function MenuLink({ href, title, note, onPick }: { href: string; title: string; note: string; onPick: () => void }) {
	return (
		<Link href={href} className="nav-menu__item" onClick={onPick}>
			{title}
			<small>{note}</small>
		</Link>
	);
}

/** The three ways in: the Start menu, the phone's Start sheet. */
function StartChoices({
	t,
	loggedIn,
	id,
	onPick,
}: {
	t: HeaderText;
	loggedIn: boolean;
	id: string;
	onPick: () => void;
}) {
	return (
		<>
			<MenuLink
				href="/tastings/start"
				title={t.solo}
				note={t.soloNote + (loggedIn ? '' : t.soloNoteLoggedOut)}
				onPick={onPick}
			/>
			<MenuLink
				href="/flights/new"
				title={t.host}
				note={t.hostNote + (loggedIn ? '' : t.hostNoteLoggedOut)}
				onPick={onPick}
			/>
			<div className="nav-menu__sep" />
			<div className="nav-menu__code">
				<CodeForm
					id={id}
					label={t.haveCode}
					hint={t.codeHint + (loggedIn ? '' : t.codeHintLoggedOut)}
					onGo={onPick}
				/>
			</div>
		</>
	);
}

/** A button and the panel it opens under itself. Only one is open at a time. */
function NavPop({
	label,
	open,
	onToggle,
	onClose,
	buttonClass,
	panelClass = '',
	ariaLabel,
	children,
}: {
	label: React.ReactNode;
	open: boolean;
	onToggle: () => void;
	onClose: () => void;
	buttonClass: string;
	panelClass?: string;
	ariaLabel?: string;
	children: React.ReactNode;
}) {
	const ref = useRef<HTMLDivElement>(null);
	const button = useRef<HTMLButtonElement>(null);
	useDismiss(open, onClose, ref, button);
	return (
		<div className="nav-pop" ref={ref}>
			<button
				ref={button}
				type="button"
				className={`${buttonClass}${open ? ' is-open' : ''}`}
				aria-expanded={open}
				aria-label={ariaLabel}
				onClick={onToggle}
			>
				{label}
				<IconChevronDown size={14} stroke={2.4} className="nav-pop__chevron" aria-hidden="true" />
			</button>
			{open && <div className={`nav-menu ${panelClass}`.trim()}>{children}</div>}
		</div>
	);
}

/** A full-screen or bottom-sheet dialog on the phone: closes on its ×, Escape, or the dimmed page. */
function PhoneDialog({
	className,
	label,
	head,
	closeLabel,
	onClose,
	trigger,
	children,
}: {
	className: string;
	label: string;
	head: React.ReactNode;
	closeLabel: string;
	onClose: () => void;
	trigger: React.RefObject<HTMLButtonElement | null>;
	children: React.ReactNode;
}) {
	const closeBtn = useRef<HTMLButtonElement>(null);
	const sheet = useRef<HTMLDivElement>(null);
	useEffect(() => {
		closeBtn.current?.focus();
		const returnTo = trigger.current;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				onClose();
				return;
			}
			// aria-modal promises the page behind is out of reach, so Tab wraps inside the sheet.
			if (e.key !== 'Tab' || !sheet.current) {
				return;
			}
			const focusable = sheet.current.querySelectorAll<HTMLElement>(
				'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
			);
			const first = focusable[0];
			const last = focusable[focusable.length - 1];
			if (!first) {
				return;
			}
			if (e.shiftKey && document.activeElement === first) {
				e.preventDefault();
				last.focus();
			} else if (
				!e.shiftKey &&
				(document.activeElement === last || !sheet.current.contains(document.activeElement))
			) {
				e.preventDefault();
				first.focus();
			}
		};
		document.addEventListener('keydown', onKey);
		return () => {
			document.removeEventListener('keydown', onKey);
			returnTo?.focus();
		};
	}, [onClose, trigger]);
	return (
		<>
			<div className="phone-scrim" aria-hidden="true" onClick={onClose} />
			<div ref={sheet} className={className} role="dialog" aria-modal="true" aria-label={label}>
				<div className={`${className}__head`}>
					{head}
					<button
						ref={closeBtn}
						type="button"
						className="nav-icon-btn"
						onClick={onClose}
						aria-label={closeLabel}
					>
						<IconX size={22} aria-hidden="true" />
					</button>
				</div>
				{children}
			</div>
		</>
	);
}

export default function Header() {
	const t = useText(layoutText).header;
	const c = useText(commonText);
	const [open, setOpen] = useState<Open>(null);
	const pathname = usePathname();
	const [lastPathname, setLastPathname] = useState(pathname);
	const { user, isInitialLoading } = useAuthenticatedUser();
	const { signOut } = useAuthProvider();
	const router = useRouter();
	const sheetBtn = useRef<HTMLButtonElement>(null);
	const menuBtn = useRef<HTMLButtonElement>(null);
	const isLoggedIn = !isInitialLoading && !!user;
	const initials = user?.displayName?.[0]?.toUpperCase() ?? '';

	const close = useCallback(() => setOpen(null), []);
	const toggle = (which: Open) => () => setOpen((o) => (o === which ? null : which));

	// Close every menu on navigation, during render rather than in an effect.
	if (pathname !== lastPathname) {
		setLastPathname(pathname);
		setOpen(null);
	}

	const phoneOpen = open === 'sheet' || open === 'menu';
	useEffect(() => {
		document.body.classList.toggle('menu-open', phoneOpen);
		return () => document.body.classList.remove('menu-open');
	}, [phoneOpen]);

	const handleLogout = async () => {
		close();
		await signOut();
		router.push('/');
	};

	const learnLinks = [
		{ href: '/#solo', label: t.tasteSolo },
		{ href: '/#group', label: t.tasteGroup },
		{ href: '/#after', label: t.afterReveal },
	];
	const youLinks = [
		{ href: '/archives', label: t.archive },
		{ href: '/progress', label: t.progress },
		{ href: '/flights', label: t.yourFlights },
		{ href: '/account', label: t.account },
	];

	return (
		<header className="site-header">
			<Link href="/" className="site-header__logo" aria-label={c.home}>
				<Wordmark />
			</Link>

			{!isInitialLoading && (
				<nav className="site-header__links" aria-label={t.navLabel}>
					{isLoggedIn ? (
						<>
							<Link href="/archives" className="site-header__link">
								{t.archive}
							</Link>
							<Link href="/progress" className="site-header__link">
								{t.progress}
							</Link>
							<NavPop
								label={t.flights}
								open={open === 'flights'}
								onToggle={toggle('flights')}
								onClose={close}
								buttonClass="site-header__link site-header__link--pop"
							>
								<MenuLink
									href="/flights/new"
									title={t.hostFlight}
									note={t.hostFlightNote}
									onPick={close}
								/>
								<MenuLink
									href="/flights/join"
									title={t.joinCode}
									note={t.joinCodeNote}
									onPick={close}
								/>
								<div className="nav-menu__sep" />
								<MenuLink
									href="/flights"
									title={t.yourFlights}
									note={t.yourFlightsNote}
									onPick={close}
								/>
							</NavPop>
						</>
					) : (
						learnLinks.map((link) => (
							<Link key={link.href} href={link.href} className="site-header__link">
								{link.label}
							</Link>
						))
					)}
				</nav>
			)}

			<div className="site-header__right">
				{!isInitialLoading && !isLoggedIn && (
					<>
						<Link href="/login" className="site-header__link site-header__wide">
							{t.logIn}
						</Link>
						<LanguageSwitch className="site-header__wide" />
					</>
				)}

				<div className="site-header__wide">
					<NavPop
						label={t.start}
						open={open === 'start'}
						onToggle={toggle('start')}
						onClose={close}
						buttonClass="btn-primary site-header__start"
						panelClass="nav-menu--start"
					>
						<StartChoices t={t} loggedIn={isLoggedIn} id="start-code" onPick={close} />
					</NavPop>
				</div>

				{isLoggedIn && (
					<div className="site-header__wide">
						<NavPop
							label={
								<span className="nav-avatar" aria-hidden="true">
									{initials}
								</span>
							}
							ariaLabel={t.accountMenu}
							open={open === 'account'}
							onToggle={toggle('account')}
							onClose={close}
							buttonClass="site-header__account"
							panelClass="nav-menu--account"
						>
							<div className="nav-menu__profile">
								<span className="nav-profile__name">{user.displayName}</span>
								<span className="nav-profile__email">{user.email}</span>
							</div>
							<div className="nav-menu__sep" />
							<Link href="/account" className="nav-menu__item" onClick={close}>
								{t.account}
							</Link>
							<div className="nav-menu__sep" />
							<Prefs />
							<div className="nav-menu__sep" />
							<button
								type="button"
								className="nav-menu__item nav-menu__item--quiet"
								onClick={handleLogout}
							>
								{t.logOut}
							</button>
						</NavPop>
					</div>
				)}

				<button
					ref={sheetBtn}
					type="button"
					className="btn-primary site-header__start site-header__narrow"
					aria-haspopup="dialog"
					aria-expanded={open === 'sheet'}
					onClick={() => setOpen('sheet')}
				>
					{t.start}
				</button>
				{!isInitialLoading && (
					<button
						ref={menuBtn}
						type="button"
						className="nav-icon-btn site-header__narrow"
						onClick={() => setOpen('menu')}
						aria-label={t.openMenu}
						aria-haspopup="dialog"
						aria-expanded={open === 'menu'}
					>
						{isLoggedIn ? (
							<span className="nav-avatar" aria-hidden="true">
								{initials}
							</span>
						) : (
							<IconMenu2 size={24} aria-hidden="true" />
						)}
					</button>
				)}
			</div>

			{open === 'sheet' && (
				<PhoneDialog
					className="start-sheet"
					label={t.start}
					head={<span className="start-sheet__title">{t.start}</span>}
					closeLabel={t.close}
					onClose={close}
					trigger={sheetBtn}
				>
					<div className="nav-menu nav-menu--sheet">
						<StartChoices t={t} loggedIn={isLoggedIn} id="sheet-code" onPick={close} />
					</div>
				</PhoneDialog>
			)}

			{open === 'menu' && (
				<PhoneDialog
					className="site-menu"
					label={t.menu}
					head={
						isLoggedIn ? (
							<span className="nav-profile">
								<span className="nav-avatar" aria-hidden="true">
									{initials}
								</span>
								<span className="nav-profile__text">
									<span className="nav-profile__name">{user.displayName}</span>
									<span className="nav-profile__email">{user.email}</span>
								</span>
							</span>
						) : (
							<Wordmark size="sm" />
						)
					}
					closeLabel={t.closeMenu}
					onClose={close}
					trigger={menuBtn}
				>
					<div className="site-menu__body">
						<MenuGroup
							title={t.start}
							links={[
								{ href: '/tastings/start', label: t.solo },
								{ href: '/flights/new', label: t.host },
								{ href: '/flights/join', label: t.haveCode },
							]}
							onPick={close}
						/>
						<MenuGroup
							title={isLoggedIn ? t.you : t.learn}
							links={isLoggedIn ? youLinks : learnLinks}
							onPick={close}
						/>
						<div className="site-menu__group">
							{isLoggedIn ? (
								<button
									type="button"
									className="site-menu__link site-menu__link--quiet"
									onClick={handleLogout}
								>
									{t.logOut}
								</button>
							) : (
								<>
									<Link href="/login" className="site-menu__link" onClick={close}>
										{t.logIn}
									</Link>
									<Link href="/signup" className="site-menu__link" onClick={close}>
										{t.signUp}
									</Link>
								</>
							)}
						</div>
						<div className="site-menu__foot">
							<Prefs />
						</div>
					</div>
				</PhoneDialog>
			)}
		</header>
	);
}

function MenuGroup({
	title,
	links,
	onPick,
}: {
	title: string;
	links: { href: string; label: string }[];
	onPick: () => void;
}) {
	return (
		<nav className="site-menu__group" aria-label={title}>
			<span className="site-menu__group-title" aria-hidden="true">
				{title}
			</span>
			{links.map((link) => (
				<Link key={link.href} href={link.href} className="site-menu__link" onClick={onPick}>
					{link.label}
					<IconChevronRight size={18} aria-hidden="true" />
				</Link>
			))}
		</nav>
	);
}
