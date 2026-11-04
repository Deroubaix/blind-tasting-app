'use client';
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { IconChevronDown, IconChevronRight, IconMenu2, IconX } from '@tabler/icons-react';
import useAuthenticatedUser from '../../hooks/UseAuthenticatedUser';
import { useAuthProvider } from '../auth/AuthProvider';
import { CODE_LENGTH, normalizeCode } from '../flights/flightLogic';
import Wordmark from './Wordmark';

/** Typing a code straight into the menu: the flight page handles joining, or logging in first. */
function JoinCodeField({ loggedIn, onGo }: { loggedIn: boolean; onGo: (code: string) => void }) {
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
				Join a flight
			</label>
			<div className="site-menu__join-row">
				<input
					id="menu-flight-code"
					className="site-menu__join-input"
					placeholder="Flight code"
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
					Join
				</button>
			</div>
			<span className="site-menu__join-hint">
				It&apos;s on the host&apos;s screen.{loggedIn ? '' : " You'll be asked to log in or sign up."}
			</span>
		</form>
	);
}

export default function Header() {
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
				{ href: '/flights/new', label: 'Host a flight' },
				{ href: '/archives', label: 'Archive' },
				{ href: '/flights', label: 'Flights' },
				{ href: '/account', label: 'Account' },
			]
		: [
				{ href: '/#flights', label: 'Flights' },
				{ href: '/#grid', label: 'How it works' },
			];

	return (
		<header className="site-header">
			<Link href="/" className="site-header__logo no-underline" aria-label="Home">
				<Wordmark />
			</Link>

			<nav className="site-header__nav" aria-label="Main">
				{!isLoggedIn && (
					<>
						<Link href="/#flights" className="site-header__link">
							Flights
						</Link>
						<Link href="/#grid" className="site-header__link">
							How it works
						</Link>
					</>
				)}
				<Link href="/flights/join" className="site-header__link site-header__link--accent">
					Join a flight
				</Link>
				{!isInitialLoading && !isLoggedIn && (
					<Link href="/login" className="site-header__link">
						Log in
					</Link>
				)}
			</nav>

			{/* Logged in, the Start button only shows on the phone; desktop has the account menu instead. */}
			{!isInitialLoading && (
				<Link
					href="/tastings/start"
					className={`btn-primary site-header__cta no-underline${isLoggedIn ? ' site-header__cta--phone' : ''}`}
				>
					<span className="site-header__cta-long">Start a tasting</span>
					<span className="site-header__cta-short">Start</span>
				</Link>
			)}

			{isLoggedIn && (
				<div className="nav-user site-header__user" ref={dropdownRef}>
					<button
						className="site-header__account"
						onClick={() => setDropdownOpen((o) => !o)}
						aria-label="Account menu"
						aria-expanded={dropdownOpen}
						aria-haspopup="true"
					>
						<span className="nav-avatar" aria-hidden="true">
							{initials}
						</span>
						{firstName}
						<IconChevronDown size={14} aria-hidden="true" />
					</button>
					{dropdownOpen && (
						<div className="nav-dropdown" role="menu">
							<div className="nav-dropdown__profile">
								<span className="nav-dropdown__name">{user.displayName}</span>
								<span className="nav-dropdown__email">{user.email}</span>
							</div>
							<div className="nav-dropdown__divider" />
							{[
								['/archives', 'Archive'],
								['/flights', 'Flights'],
								['/account', 'Account'],
							].map(([href, label]) => (
								<Link
									key={href}
									href={href}
									className="nav-dropdown__item"
									role="menuitem"
									onClick={() => setDropdownOpen(false)}
								>
									{label}
								</Link>
							))}
							<div className="nav-dropdown__divider nav-dropdown__divider--double" />
							<button
								className="nav-dropdown__item nav-dropdown__item--logout"
								role="menuitem"
								onClick={handleLogout}
							>
								Log out
							</button>
						</div>
					)}
				</div>
			)}

			<button
				type="button"
				className="site-header__menu-btn"
				onClick={() => setShowMenu(true)}
				aria-label="Open menu"
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
				<div className="site-menu" role="dialog" aria-modal="true" aria-label="Menu">
					<div className="site-menu__head">
						<Wordmark size="sm" />
						<button type="button" className="site-menu__close" onClick={closeMenu} aria-label="Close menu">
							<IconX size={26} aria-hidden="true" />
						</button>
					</div>
					<div className="site-menu__body">
						{isLoggedIn && (
							<div className="site-menu__profile">
								<span className="site-menu__initial">{initials}</span>
								<span>
									<strong>{user.displayName}</strong>
									<span>{user.email}</span>
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
						<Link
							href="/tastings/start"
							className="btn-primary site-menu__start no-underline"
							onClick={closeMenu}
						>
							Start a tasting →
						</Link>
						<nav className="site-menu__links" aria-label="Menu">
							{menuLinks.map((link) => (
								<Link key={link.href} href={link.href} className="site-menu__link" onClick={closeMenu}>
									{link.label}
									<IconChevronRight size={18} aria-hidden="true" />
								</Link>
							))}
						</nav>
						<div className="site-menu__foot">
							{isLoggedIn ? (
								<button type="button" className="site-menu__foot-link" onClick={handleLogout}>
									Log out
								</button>
							) : (
								<>
									<Link href="/login" className="site-menu__foot-link" onClick={closeMenu}>
										Log in
									</Link>
									<Link href="/signup" className="site-menu__foot-link" onClick={closeMenu}>
										Sign up
									</Link>
								</>
							)}
						</div>
					</div>
				</div>
			)}
		</header>
	);
}
