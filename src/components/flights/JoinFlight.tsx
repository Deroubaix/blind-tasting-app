'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconArrowRight, IconCheck } from '@tabler/icons-react';
import { useAuthProvider } from '../auth/AuthProvider';
import { useToastProvider } from '../../toast/ToastProvider';
import { JsonApiError } from '../../utils/ErrorUtils';
import { type FlightView } from '../../types/Flight';
import { CODE_LENGTH, normalizeCode } from './flightLogic';
import { Avatar, flightService, formatTimer, useRequireLogin } from './FlightBits';
import { formatTimerSeconds } from '../../data/timerData';
import { flightsText } from '../../i18n/flights';
import { commonText } from '../../i18n/common';
import { useLang, useText } from '../../i18n/LanguageProvider';

/** Someone who has the link but hasn't joined: who's hosting, what's poured, and Join. */
export function JoinInvite({ flight, onJoined }: { flight: FlightView; onJoined: () => Promise<void> }) {
	const text = useText(flightsText);
	const t = text.join;
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
			showToast({ title: t.couldNotJoin, children: JsonApiError.create(error).message, color: 'error' });
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
				<span className="page-eyebrow">{t.invited}</span>
				<h1 className="flight-invite__title" id="flight-invite-heading">
					{flight.name}
				</h1>
				<p className="flight-muted">{text.bits.hostedBy(flight.host.name)}</p>

				<dl className="flight-facts">
					<div>
						<dt>{t.wines}</dt>
						<dd>{flight.wineCount}</dd>
					</div>
					<div>
						<dt>{t.perWine}</dt>
						<dd>{flight.timerSeconds ? formatTimerSeconds(flight.timerSeconds) : text.bits.untimed}</dd>
					</div>
					<div>
						<dt>{t.alreadyIn}</dt>
						<dd className="flight-facts__people">
							{flight.members.length
								? flight.members.map((member) => <Avatar key={member.id} person={member} size="sm" />)
								: t.noOneYet}
						</dd>
					</div>
				</dl>

				{flight.ended ? (
					<p className="flight-message">{t.ended}</p>
				) : (
					<>
						<p className="flight-invite__me">
							{t.joiningAs} <strong>{user?.displayName}</strong>{' '}
							<button type="button" className="flight-link-button" onClick={notMe}>
								{t.notYou}
							</button>
						</p>
						<button
							type="button"
							className="btn-primary flight-invite__join"
							onClick={join}
							disabled={joining}
						>
							{joining ? t.joining : t.join}
							<IconArrowRight size={16} aria-hidden="true" />
						</button>
						<p className="flight-note">{t.note}</p>
					</>
				)}
			</section>
		</main>
	);
}

/** Typing the code from the host's screen. */
export function JoinCodeClient() {
	const { lang } = useLang();
	const text = useText(flightsText);
	const t = text.join;
	const common = useText(commonText);
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
					? text.bits.notFound
					: apiError.statusCode === 429
						? apiError.message
						: t.lookupFailed,
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
			showToast({ title: t.couldNotJoin, children: JsonApiError.create(err).message, color: 'error' });
			setJoining(false);
		}
	};

	if (!ready) {
		return <div className="archives-loading">{common.loading}</div>;
	}

	return (
		<main className="flight-main flight-main--invite">
			<section className="flight-card flight-invite">
				<span className="page-eyebrow">{t.eyebrow}</span>
				<h1 className="flight-invite__title">{t.title}</h1>
				<p className="flight-muted">{t.sub}</p>

				<label className="flight-code-input__label" htmlFor="flight-code">
					{t.codeLabel}
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
								<IconCheck size={14} aria-hidden="true" /> {t.found}
							</span>
							<strong>{found.name}</strong>
							<span className="flight-muted">
								{text.bits.hostedBy(found.host.name)} · {common.grid[found.grid].short} ·{' '}
								{common.wines(found.wineCount)} · {formatTimer(found.timerSeconds, lang)}
							</span>
							{found.members.length > 0 && (
								<span className="flight-found__people">
									{found.members.map((member) => (
										<Avatar key={member.id} person={member} size="sm" />
									))}
									<span className="flight-muted">{t.alreadyInCount(found.members.length)}</span>
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
					{found?.ended ? t.endedButton : joining ? t.joining : t.join}
					<IconArrowRight size={16} aria-hidden="true" />
				</button>
			</section>
		</main>
	);
}
