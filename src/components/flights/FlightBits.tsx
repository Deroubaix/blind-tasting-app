'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IconCheck, IconChecks, IconMinus, IconPointFilled } from '@tabler/icons-react';
import { useAuthProvider } from '../auth/AuthProvider';
import ClientFlightService from '../../services/client/ClientFlightService';
import { JsonApiError } from '../../utils/ErrorUtils';
import { type FlightPerson, type FlightView } from '../../types/Flight';
import { type EntryStatus } from '../../utils/flightLogic';
import { formatTimerSeconds } from '../../data/timerData';
import { type Lang } from '../../i18n';
import { flightsText } from '../../i18n/flights';
import { useText } from '../../i18n/LanguageProvider';

export const flightService = new ClientFlightService();

/** Sends a signed-out visitor to log in and back. True once a user is known. */
export function useRequireLogin(returnTo: string): boolean {
	const { user, isInitialLoading } = useAuthProvider();
	const router = useRouter();
	useEffect(() => {
		if (!isInitialLoading && !user) {
			router.push(`/login?r=${encodeURIComponent(returnTo)}`);
		}
	}, [user, isInitialLoading, router, returnTo]);
	return !isInitialLoading && !!user;
}

/** The flight, refreshed every few seconds while the page is open, so statuses stay current. */
export function useFlight(code: string, enabled: boolean) {
	const t = useText(flightsText).bits;
	const [flight, setFlight] = useState<FlightView | null>(null);
	const [error, setError] = useState<'notFound' | 'loadFailed' | null>(null);

	const reload = useCallback(
		() =>
			flightService
				.get(code)
				.then((next) => {
					setFlight(next);
					setError(null);
				})
				.catch((err) => {
					const apiError = JsonApiError.create(err);
					setError(apiError.statusCode === 404 ? 'notFound' : 'loadFailed');
				}),
		[code],
	);

	useEffect(() => {
		if (!enabled) {
			return;
		}
		const first = setTimeout(reload, 0);
		const id = setInterval(() => {
			if (document.visibilityState === 'visible') {
				void reload();
			}
		}, 4000);
		return () => {
			clearTimeout(first);
			clearInterval(id);
		};
	}, [enabled, reload]);

	return { flight, error: error && t[error], reload };
}

/** Re-renders every second, for clocks counting down. */
export function useNow(): number {
	const [now, setNow] = useState(() => Date.now());
	useEffect(() => {
		const id = setInterval(() => setNow(Date.now()), 1000);
		return () => clearInterval(id);
	}, []);
	return now;
}

export function clockText(endsAt: string | number | null, now: number): string | null {
	if (endsAt === null) {
		return null;
	}
	return formatTimerSeconds(Math.max(0, Math.round((new Date(endsAt).getTime() - now) / 1000)));
}

export function formatTimer(seconds: number | null, lang: Lang): string {
	const t = flightsText[lang].bits;
	return seconds ? t.perWine(formatTimerSeconds(seconds)) : t.untimed;
}

/** A taster's initial. Filled once submitted, dashed while tasting, faint before they start. */
export function Avatar({
	person,
	state = 'filled',
	size = 'md',
	title,
}: {
	person: FlightPerson;
	state?: 'filled' | 'dashed' | 'faint';
	size?: 'sm' | 'md' | 'lg';
	title?: string;
}) {
	return (
		<span
			className={`flight-avatar flight-avatar--${size} flight-avatar--${state} flight-avatar--t${person.tint}`}
			title={title ?? person.name}
			aria-label={title ?? person.name}
			role="img"
		>
			{person.initial}
		</span>
	);
}

export const avatarState = (status: EntryStatus): 'filled' | 'dashed' | 'faint' =>
	status === 'submitted' ? 'filled' : status === 'tasting' ? 'dashed' : 'faint';

const STATUS_ICONS: Record<EntryStatus | 'revealed' | 'allsubmitted', typeof IconCheck> = {
	notstarted: IconMinus,
	tasting: IconPointFilled,
	submitted: IconCheck,
	notsubmitted: IconMinus,
	revealed: IconChecks,
	allsubmitted: IconCheck,
};

/** A status as an icon and a word, never color alone. */
export function StatusPill({ status, word }: { status: keyof typeof STATUS_ICONS; word?: string }) {
	const fallback = useText(flightsText).bits.status[status];
	const Icon = STATUS_ICONS[status];
	return (
		<span className={`flight-status flight-status--${status}`}>
			<Icon size={12} stroke={2.2} aria-hidden="true" />
			{word ?? fallback}
		</span>
	);
}

/** A flight page's head: the way back to the list, the flight's name and facts, and its actions. */
export function FlightHead({
	crumb,
	title,
	sub,
	actions,
	children,
}: {
	crumb: string;
	title: string;
	sub: string;
	actions?: React.ReactNode;
	children?: React.ReactNode;
}) {
	const t = useText(flightsText).bits;
	return (
		<header className="flight-head">
			<div className="flight-head__text">
				<p className="flight-head__crumb">
					<Link href="/flights">{t.yourFlights}</Link> › {crumb}
				</p>
				<h1>{title}</h1>
				<p className="flight-head__sub">{sub}</p>
				{children}
			</div>
			{actions && <div className="flight-head__actions">{actions}</div>}
		</header>
	);
}

export function FlightMessage({ children }: { children: React.ReactNode }) {
	return <div className="empty-state flight-message">{children}</div>;
}
