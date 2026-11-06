'use client';
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { IconChevronDown, IconChevronRight, IconMenu2, IconX } from '@tabler/icons-react';
import useAuthenticatedUser from '../../hooks/useAuthenticatedUser';
import { useAuthProvider } from '../auth/AuthProvider';
import { CODE_LENGTH, normalizeCode } from '../../utils/flightLogic';
import Wordmark from './Wordmark';
import LanguageSwitch from '../../i18n/LanguageSwitch';
import ThemeSwitch from '../../theme/ThemeSwitch';
import { useText } from '../../i18n/LanguageProvider';
import { commonText } from '../../i18n/common';
import { layoutText } from '../../i18n/layout';

/** Typing a code straight into the menu: the flight page handles joining, or logging in first. */
function JoinCodeField({ loggedIn, onGo }: { loggedIn: boolean; onGo: (code: string) => void }) {
	const t = useText(layoutText).header;
	const [code, setCode] = useState('');
	return (
		<form
			className="site-menu__join"
			onSubmit={(e) => {
				e.preventDefault();
				if (code.length === CODE_LENGTH) {
					onGo(code);
				}
			}}
		>
			<label className="site-menu__join-label" htmlFor="menu-flight-code">
				{t.joinFlight}
			</label>
			<div className="site-menu__join-row">
				<input
					id="menu-flight-code"
					className="ledger-field ledger-field--code site-menu__join-input"
					placeholder={t.flightCode}
					autoComplete="off"
					autoCapitalize="characters"
					spellCheck={false}
					value={code}
					onChange={(e) => setCode(normalizeCode(e.target.value).slice(0, CODE_LENGTH))}
				/>
				<button
					type="submit"
					className="btn-primary site-menu__join-btn"
					disabled={code.length !== CODE_LENGTH}
				>
					{t.join}
				</button>
			</div>
			<span className="site-menu__join-hint">
				{t.codeHint}
				{loggedIn ? '' : t.codeHintLoggedOut}
			</span>
		</form>
	);
}

export default function Header() {
	const t = useText(layoutText).header;
	const c = useText(commonText);
	const [showMenu, setShowMenu] = useState(false);
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const pathname = usePathname();
	const [lastPathname, setLastPathname] = useState(pathname);
	const { user, isInitialLoading } = useAuthenticatedUser();
	const { signOut } = useAuthProvider();
	const router = useRouter();
	const isLoggedIn = !isInitialLoading && !!user;
	const initials = user?.displayName?.[0]?.toUpperCase() ?? '';
	const firstName = user?.displayName?.split(' ')[0] ?? '';

	const closeMenu = () => setShowMenu(false);

	// Close both menus on navigation, during render rather than in an effect.
	if (pathname !== lastPathname) {
		setLastPathname(pathname);
		setShowMenu(false);
		setDropdownOpen(false);
	}

	useEffect(() => {
		document.body.classList.toggle('menu-open', showMenu);
		return () => document.body.classList.remove('menu-open');
	}, [showMenu]);

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
		closeMenu();
		await signOut();
		router.push('/');
	};

	const menuLinks = isLoggedIn
		? [
				{ href: '/flights/new', label: t.hostFlight },
				{ href: '/archives', label: t.archive },
				{ href: '/progress', label: t.progress },
				{ href: '/flights', label: t.flights },
				{ href: '/account', label: t.account },
			]
		: [
				{ href: '/#flights', label: t.flights },
				{ href: '/#grid', label: t.howItWorks },
			];

	return (
		<header className="site-header">
			<Link href="/" className="site-header__logo" aria-label={c.home}>
				<Wordmark />
			</Link>

			<nav className="site-header__nav" aria-label={t.navLabel}>
				{!isLoggedIn && (
					<>
						<Link href="/#flights" className="site-header__link">
							{t.flights}
						</Link>
						<Link href="/#grid" className="site-header__link">
							{t.howItWorks}
						</Link>
					</>
				)}
				<Link href="/flights/join" className="site-header__link site-header__link--accent">
					{t.joinFlight}
				</Link>
				{!isInitialLoading && !isLoggedIn && (
					<Link href="/login" className="site-header__link">
						{t.logIn}
					</Link>
				)}
				{!isInitialLoading && !isLoggedIn && <LanguageSwitch className="site-header__lang" />}
			</nav>

			{/* Logged in, the Start button only shows on the phone; desktop has the account menu instead. */}
			{!isInitialLoading && (
				<Link
					href="/tastings/start"
					className={`btn-primary site-header__cta${isLoggedIn ? ' site-header__cta--phone' : ''}`}
				>
					<span className="site-header__cta-long">{t.startTasting}</span>
					<span className="site-header__cta-short">{t.start}</span>
				</Link>
			)}

			{isLoggedIn && (
				<div className="nav-user site-header__user" ref={dropdownRef}>
					<button
						className="site-header__account"
						onClick={() => setDropdownOpen((o) => !o)}
						aria-label={t.accountMenu}
						aria-expanded={dropdownOpen}
					>
						<span className="nav-avatar" aria-hidden="true">
							{initials}
						</span>
						{firstName}
						<IconChevronDown size={14} aria-hidden="true" />
					</button>
					{dropdownOpen && (
						<div className="nav-dropdown">
							<div className="nav-dropdown__profile">
								<span className="nav-profile__name">{user.displayName}</span>
								<span className="nav-profile__email">{user.email}</span>
							</div>
							<div className="nav-dropdown__divider" />
							{[
								['/archives', t.archive],
								['/progress', t.progress],
								['/flights', t.flights],
								['/account', t.account],
							].map(([href, label]) => (
								<Link
									key={href}
									href={href}
									className="nav-dropdown__item"
									onClick={() => setDropdownOpen(false)}
								>
									{label}
								</Link>
							))}
							<div className="nav-dropdown__divider" />
							<div className="nav-dropdown__prefs">
								<LanguageSwitch />
								<ThemeSwitch />
							</div>
							<div className="nav-dropdown__divider nav-dropdown__divider--double" />
							<button className="nav-dropdown__item nav-dropdown__item--logout" onClick={handleLogout}>
								{t.logOut}
							</button>
						</div>
					)}
				</div>
			)}

			<button
				type="button"
				className="nav-icon-btn site-header__menu-btn"
				onClick={() => setShowMenu(true)}
				aria-label={t.openMenu}
				aria-expanded={showMenu}
			>
				{isLoggedIn ? (
					<span className="nav-avatar" aria-hidden="true">
						{initials}
					</span>
				) : (
					<IconMenu2 size={24} aria-hidden="true" />
				)}
			</button>

			{showMenu && (
				<div className="site-menu" role="dialog" aria-modal="true" aria-label={t.menu}>
					<div className="site-menu__head">
						<Wordmark size="sm" />
						<button type="button" className="nav-icon-btn" onClick={closeMenu} aria-label={t.closeMenu}>
							<IconX size={26} aria-hidden="true" />
						</button>
					</div>
					<div className="site-menu__body">
						{isLoggedIn && (
							<div className="nav-profile">
								<span className="nav-avatar nav-avatar--lg">{initials}</span>
								<span className="nav-profile__text">
									<strong className="nav-profile__name">{user.displayName}</strong>
									<span className="nav-profile__email">{user.email}</span>
								</span>
							</div>
						)}
						<JoinCodeField
							loggedIn={isLoggedIn}
							onGo={(code) => {
								closeMenu();
								router.push(`/flights/${code}`);
							}}
						/>
						<Link href="/tastings/start" className="btn-primary btn-primary--block" onClick={closeMenu}>
							{t.startTasting} →
						</Link>
						<nav className="site-menu__links" aria-label={t.menu}>
							{menuLinks.map((link) => (
								<Link key={link.href} href={link.href} className="site-menu__link" onClick={closeMenu}>
									{link.label}
									<IconChevronRight size={18} aria-hidden="true" />
								</Link>
							))}
						</nav>
						<div className="site-menu__foot">
							{isLoggedIn ? (
								<button
									type="button"
									className="site-menu__foot-link site-menu__foot-link--logout"
									onClick={handleLogout}
								>
									{t.logOut}
								</button>
							) : (
								<>
									<Link href="/login" className="site-menu__foot-link" onClick={closeMenu}>
										{t.logIn}
									</Link>
									<Link href="/signup" className="site-menu__foot-link" onClick={closeMenu}>
										{t.signUp}
									</Link>
								</>
							)}
							<div className="site-menu__prefs">
								<LanguageSwitch />
								<ThemeSwitch />
							</div>
						</div>
					</div>
				</div>
			)}
		</header>
	);
}
