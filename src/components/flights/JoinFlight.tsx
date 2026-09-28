'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconArrowRight, IconCheck } from '@tabler/icons-react';
import { useAuthProvider } from '../auth/AuthProvider';
import { useToastProvider } from '../../toast/ToastProvider';
import { JsonApiError } from '../../utils/ErrorUtils';
import { type FlightView } from '../../types/Flight';
import { CODE_LENGTH, normalizeCode, plural } from './flightLogic';
import { Avatar, flightService, formatTimer, useRequireLogin } from './FlightBits';
import { formatTimerSeconds } from '../../data/timerData';

/** Someone who has the link but hasn't joined: who's hosting, what's poured, and Join. */
export function JoinInvite({ flight, onJoined }: { flight: FlightView; onJoined: () => Promise<void> }) {
	const { user, signOut } = useAuthProvider();
	const { showToast } = useToastProvider();
	const router = useRouter();
	const [joining, setJoining] = useState(false);

	const join = async () => {
		setJoining(true);
		try {
			await flightService.join(flight.code);
			await onJoined();
		} catch (error) {
			showToast({ title: 'Could not join', children: JsonApiError.create(error).message, color: 'error' });
			setJoining(false);
		}
	};

	const notMe = async () => {
		await signOut();
		router.push(`/login?r=${encodeURIComponent(`/flights/${flight.code}`)}`);
	};

	return (
		<main className="flight-main flight-main--invite">
			<section className="flight-card flight-invite" aria-labelledby="flight-invite-heading">
				<span className="page-eyebrow">You&apos;re invited to a flight</span>
				<h1 className="flight-invite__title" id="flight-invite-heading">
					{flight.name}
				</h1>
				<p className="flight-muted">Hosted by {flight.host.name}</p>

				<dl className="flight-facts">
					<div>
						<dt>Wines</dt>
						<dd>{flight.wineCount}</dd>
					</div>
					<div>
						<dt>Per wine</dt>
						<dd>{flight.timerSeconds ? formatTimerSeconds(flight.timerSeconds) : 'Untimed'}</dd>
					</div>
					<div>
						<dt>Already in</dt>
						<dd className="flight-facts__people">
							{flight.members.length
								? flight.members.map((member) => <Avatar key={member.id} person={member} size="sm" />)
								: 'No one yet'}
						</dd>
					</div>
				</dl>

				{flight.ended ? (
					<p className="flight-message">This flight has ended, so it can&apos;t be joined.</p>
				) : (
					<>
						<p className="flight-invite__me">
							Joining as <strong>{user?.displayName}</strong>{' '}
							<button type="button" className="flight-link-button" onClick={notMe}>
								Not you?
							</button>
						</p>
						<button
							type="button"
							className="btn-primary flight-invite__join"
							onClick={join}
							disabled={joining}
						>
							{joining ? 'Joining…' : 'Join flight'}
							<IconArrowRight size={16} aria-hidden="true" />
						</button>
						<p className="flight-note">Your tastings from this flight are saved to your own archive.</p>
					</>
				)}
			</section>
		</main>
	);
}

/** Typing the code from the host's screen. */
export function JoinCodeClient() {
	const ready = useRequireLogin('/flights/join');
	const router = useRouter();
	const { showToast } = useToastProvider();
	const [code, setCode] = useState('');
	const [found, setFound] = useState<FlightView | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [joining, setJoining] = useState(false);

	// Only the latest lookup counts: a slow answer for an earlier code must not win.
	const latest = useRef('');
	const change = async (value: string) => {
		const next = normalizeCode(value).slice(0, CODE_LENGTH);
		latest.current = next;
		setCode(next);
		setFound(null);
		setError(null);
		if (next.length !== CODE_LENGTH) {
			return;
		}
		try {
			const flight = await flightService.get(next);
			if (latest.current !== next) {
				return;
			}
			if (flight.role !== 'visitor') {
				router.push(`/flights/${flight.code}`);
				return;
			}
			setFound(flight);
		} catch (err) {
			if (latest.current !== next) {
				return;
			}
			const apiError = JsonApiError.create(err);
			setError(
				apiError.statusCode === 404
					? 'No flight has that code.'
					: apiError.statusCode === 429
						? apiError.message
						: 'The flight could not be looked up. Please try again.',
			);
		}
	};

	const join = async () => {
		if (!found) {
			return;
		}
		setJoining(true);
		try {
			await flightService.join(found.code);
			router.push(`/flights/${found.code}`);
		} catch (err) {
			showToast({ title: 'Could not join', children: JsonApiError.create(err).message, color: 'error' });
			setJoining(false);
		}
	};

	if (!ready) {
		return <div className="archives-loading">Loading…</div>;
	}

	return (
		<main className="flight-main flight-main--invite">
			<section className="flight-card flight-invite">
				<span className="page-eyebrow">Join a flight</span>
				<h1 className="flight-invite__title">Enter the code</h1>
				<p className="flight-muted">
					It&apos;s on the host&apos;s screen. Or scan their QR code with your camera.
				</p>

				<label className="flight-code-input__label" htmlFor="flight-code">
					Flight code
				</label>
				<input
					id="flight-code"
					className="flight-code-input"
					value={code}
					onChange={(e) => void change(e.target.value)}
					placeholder="B7KQ4M"
					autoComplete="off"
					autoCapitalize="characters"
					spellCheck={false}
					inputMode="text"
					aria-describedby="flight-code-status"
				/>
				<div id="flight-code-status" aria-live="polite">
					{error && <p className="flight-code-input__error">{error}</p>}
					{found && (
						<div className="flight-found">
							<span className="flight-found__ok">
								<IconCheck size={14} aria-hidden="true" /> Flight found
							</span>
							<strong>{found.name}</strong>
							<span className="flight-muted">
								Hosted by {found.host.name} · {plural(found.wineCount, 'wine')} ·{' '}
								{formatTimer(found.timerSeconds)}
							</span>
							{found.members.length > 0 && (
								<span className="flight-found__people">
									{found.members.map((member) => (
										<Avatar key={member.id} person={member} size="sm" />
									))}
									<span className="flight-muted">{found.members.length} already in</span>
								</span>
							)}
						</div>
					)}
				</div>

				<button
					type="button"
					className="btn-primary flight-invite__join"
					disabled={!found || found.ended || joining}
					onClick={join}
				>
					{found?.ended ? 'This flight has ended' : joining ? 'Joining…' : 'Join flight'}
					<IconArrowRight size={16} aria-hidden="true" />
				</button>
			</section>
		</main>
	);
}
