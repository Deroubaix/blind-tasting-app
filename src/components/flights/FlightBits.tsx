'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconCheck, IconChecks, IconMinus, IconPointFilled } from '@tabler/icons-react';
import { useAuthProvider } from '../auth/AuthProvider';
import ClientFlightService from '../../services/client/ClientFlightService';
import { JsonApiError } from '../../utils/ErrorUtils';
import { type FlightPerson, type FlightView } from '../../types/Flight';
import { type EntryStatus } from './flightLogic';

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
	const [flight, setFlight] = useState<FlightView | null>(null);
	const [error, setError] = useState<string | null>(null);

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
					setError(
						apiError.statusCode === 404 ? 'No flight has that code.' : 'The flight could not be loaded.',
					);
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

	return { flight, error, reload };
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
	const left = Math.max(0, Math.round((new Date(endsAt).getTime() - now) / 1000));
	return `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
}

export function formatTimer(seconds: number | null): string {
	return seconds ? `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')} per wine` : 'Untimed';
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

const STATUS_WORDS: Record<EntryStatus | 'revealed' | 'allsubmitted', { word: string; Icon: typeof IconCheck }> = {
	notstarted: { word: 'Not started', Icon: IconMinus },
	tasting: { word: 'In progress', Icon: IconPointFilled },
	submitted: { word: 'Submitted', Icon: IconCheck },
	notsubmitted: { word: 'Not submitted', Icon: IconMinus },
	revealed: { word: 'Revealed', Icon: IconChecks },
	allsubmitted: { word: 'All submitted', Icon: IconCheck },
};

/** A status as an icon and a word, never colour alone. */
export function StatusPill({ status, word }: { status: keyof typeof STATUS_WORDS; word?: string }) {
	const { word: fallback, Icon } = STATUS_WORDS[status];
	return (
		<span className={`flight-status flight-status--${status}`}>
			<Icon size={12} stroke={2.2} aria-hidden="true" />
			{word ?? fallback}
		</span>
	);
}

export function FlightMessage({ children }: { children: React.ReactNode }) {
	return <div className="flight-message">{children}</div>;
}
