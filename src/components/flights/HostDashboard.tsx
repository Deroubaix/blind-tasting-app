'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import { IconArrowRight, IconChecks, IconCopy } from '@tabler/icons-react';
import { useModalProvider } from '../modal/ModalProvider';
import { useToastProvider } from '../../toast/ToastProvider';
import { JsonApiError } from '../../utils/ErrorUtils';
import { type FlightMemberView, type FlightView, type FlightWineView } from '../../types/Flight';
import { formatCode } from './flightLogic';
import { Avatar, StatusPill, avatarState, clockText, flightService, formatTimer, useNow } from './FlightBits';

function progressText(flight: FlightView): string {
	const revealed = flight.wines.filter((wine) => wine.revealed).length;
	if (revealed === flight.wineCount) {
		return `All ${flight.wineCount} revealed`;
	}
	if (revealed) {
		return `${revealed} of ${flight.wineCount} revealed`;
	}
	return flight.members.some((m) => m.tastingWine || m.submittedCount) ? 'In progress' : 'Not started';
}

function tasterLine(member: FlightMemberView, flight: FlightView, now: number): string {
	if (member.tastingWine) {
		return member.endsAt && new Date(member.endsAt).getTime() <= now
			? `Out of time on wine ${member.tastingWine}`
			: `Tasting wine ${member.tastingWine}`;
	}
	if (member.waitingOn) {
		return `Submitted wine ${member.waitingOn} · waiting`;
	}
	if (member.submittedCount === flight.wineCount) {
		return `${member.submittedCount} of ${flight.wineCount} submitted${member.outOf ? ` · ${member.total} / ${member.outOf}` : ''}`;
	}
	return member.submittedCount ? `${member.submittedCount} of ${flight.wineCount} submitted` : 'Not started';
}

function JoinCard({ code }: { code: string }) {
	// Only ever rendered in the browser, after the flight has loaded.
	const link = `${window.location.origin}/f/${code}`;
	const [qr, setQr] = useState('');
	const { showToast } = useToastProvider();

	useEffect(() => {
		QRCode.toString(link, { type: 'svg', margin: 1, color: { dark: '#141313', light: '#e4e4cc' } })
			.then(setQr)
			.catch(() => setQr(''));
	}, [link]);

	const copy = async () => {
		try {
			await navigator.clipboard.writeText(link);
			showToast({ title: 'Link copied', children: 'Send it to the group.', color: 'success', autoCloseMs: 3000 });
		} catch {
			showToast({ title: 'Could not copy', children: link, color: 'error' });
		}
	};

	return (
		<section className="flight-card flight-join" aria-labelledby="flight-join-heading">
			<span className="flight-eyebrow" id="flight-join-heading">
				Join code
			</span>
			<p className="flight-join__code" aria-label={`Join code ${code.split('').join(' ')}`}>
				{formatCode(code)}
			</p>
			<div className="flight-join__share">
				{qr && (
					<span
						className="flight-join__qr"
						role="img"
						aria-label="QR code for the join link"
						// Generated locally from the link above; no user input reaches it.
						dangerouslySetInnerHTML={{ __html: qr }}
					/>
				)}
				<div className="flight-join__link">
					<span>{link.replace(/^https?:\/\//, '')}</span>
					<button type="button" className="outline flight-btn-small" onClick={copy}>
						<IconCopy size={14} aria-hidden="true" />
						Copy link
					</button>
				</div>
			</div>
		</section>
	);
}

function TastersCard({ flight }: { flight: FlightView }) {
	const now = useNow();
	return (
		<section className="flight-card" aria-labelledby="flight-tasters-heading">
			<div className="flight-card__head">
				<span className="flight-eyebrow" id="flight-tasters-heading">
					Tasters
				</span>
				<span className="flight-muted">{flight.members.length} joined</span>
			</div>
			{flight.members.length === 0 ? (
				<div className="flight-empty">
					<strong>No one&apos;s joined yet</strong>
					<span>Share the code or the link. Tasters appear here as they join.</span>
				</div>
			) : (
				<ul className="flight-tasters">
					{flight.members.map((member) => (
						<li key={member.id} className="flight-tasters__row">
							<Avatar person={member} />
							<span className="flight-tasters__text">
								<span className="flight-tasters__name">{member.name}</span>
								<span className="flight-muted">{tasterLine(member, flight, now)}</span>
							</span>
							{member.endsAt && new Date(member.endsAt).getTime() > now && (
								<span className="flight-clock">{clockText(member.endsAt, now)}</span>
							)}
						</li>
					))}
				</ul>
			)}
		</section>
	);
}

function WineCard({ wine, flight }: { wine: FlightWineView; flight: FlightView }) {
	const statuses = flight.members.map((member) => wine.statuses[member.id] ?? 'notstarted');
	const counts = (['submitted', 'tasting', 'notstarted'] as const)
		.map((status) => [statuses.filter((s) => s === status).length, status] as const)
		.filter(([n]) => n)
		.map(([n, status]) => `${n} ${status === 'notstarted' ? 'not started' : status}`);
	const allSubmitted = flight.members.length > 0 && statuses.every((s) => s === 'submitted');
	const started = statuses.some((s) => s !== 'notstarted');

	return (
		<article className={`flight-wine${wine.submitted && !wine.revealed ? ' flight-wine--ready' : ''}`}>
			<div className="flight-wine__top">
				<span className="flight-wine__label">
					Wine <span className="flight-wine__number">{wine.number}</span>
				</span>
				{wine.revealed ? (
					<StatusPill status="revealed" />
				) : allSubmitted ? (
					<StatusPill status="allsubmitted" />
				) : started ? (
					<StatusPill status="tasting" word="Tasting" />
				) : (
					<StatusPill status="notstarted" />
				)}
			</div>

			{wine.revealed ? (
				<>
					<p className="flight-wine__title">{wine.title}</p>
					<p className="flight-muted">
						Average {wine.average ?? '—'} / {wine.outOf} · {wine.submitted} of {flight.members.length}{' '}
						submitted
					</p>
					<div className="flight-wine__foot">
						<span className="flight-muted">
							Best {wine.best ?? '—'} / {wine.outOf}
						</span>
						<Link
							href={`/flights/${flight.code}/wines/${wine.number}`}
							className="flight-link no-underline"
						>
							Results →
						</Link>
					</div>
				</>
			) : (
				<>
					<div className="flight-wine__people">
						{flight.members.map((member) => {
							const status = wine.statuses[member.id] ?? 'notstarted';
							return (
								<Avatar
									key={member.id}
									person={member}
									size="sm"
									state={avatarState(status)}
									title={`${member.name}: ${status === 'notstarted' ? 'not started' : status}`}
								/>
							);
						})}
					</div>
					<p className="flight-muted">{counts.length ? counts.join(' · ') : 'Waiting for tasters'}</p>
					{wine.submitted ? (
						<Link
							href={`/flights/${flight.code}/wines/${wine.number}/reveal`}
							className="btn-primary flight-wine__reveal no-underline"
						>
							Reveal wine {wine.number}
						</Link>
					) : (
						<span className="flight-wine__locked">Reveal after first submission</span>
					)}
				</>
			)}
		</article>
	);
}

export default function HostDashboard({ flight, reload }: { flight: FlightView; reload: () => Promise<void> }) {
	const { openModal, closeModal } = useModalProvider();
	const { showToast } = useToastProvider();
	const allRevealed = flight.wines.every((wine) => wine.revealed);
	const anyRevealed = flight.wines.some((wine) => wine.revealed);

	const confirmEnd = () =>
		openModal({
			modalId: 'end-flight',
			title: 'End this flight?',
			closeOnClickOutside: true,
			closeOnEsc: true,
			children: (
				<div className="confirm-dialog">
					<p className="confirm-dialog__lead">No one else can join, and no more wines can be started.</p>
					<p className="confirm-dialog__note">Results stay available, and you can still reveal wines.</p>
					<div className="confirm-dialog__actions">
						<button className="outline confirm-dialog__cancel" onClick={() => closeModal('end-flight')}>
							Keep it open
						</button>
						<button
							className="btn-primary confirm-dialog__confirm"
							onClick={async () => {
								closeModal('end-flight');
								try {
									await flightService.end(flight.code);
									await reload();
								} catch (error) {
									showToast({
										title: 'Not ended',
										children: JsonApiError.create(error).message,
										color: 'error',
									});
								}
							}}
						>
							End flight
						</button>
					</div>
				</div>
			),
		});

	return (
		<main className="flight-main">
			<header className="flight-head">
				<div>
					<span className="flight-eyebrow">Flight · You&apos;re hosting{flight.ended ? ' · Ended' : ''}</span>
					<h1 className="flight-head__title">{flight.name}</h1>
					<p className="flight-head__sub">
						{flight.wineCount} wines · {formatTimer(flight.timerSeconds)} · {progressText(flight)}
					</p>
				</div>
				<div className="flight-head__actions">
					{anyRevealed && (
						<Link href={`/flights/${flight.code}/summary`} className="btn-primary no-underline">
							Flight summary <IconArrowRight size={16} aria-hidden="true" />
						</Link>
					)}
					{!flight.ended && (
						<button type="button" className="outline" onClick={confirmEnd}>
							End flight
						</button>
					)}
				</div>
			</header>

			<div className="flight-dashboard">
				<div className="flight-dashboard__side">
					{!flight.ended && <JoinCard code={flight.code} />}
					<TastersCard flight={flight} />
				</div>

				<div className="flight-dashboard__wines">
					{allRevealed && (
						<div className="flight-banner">
							<IconChecks size={18} aria-hidden="true" />
							<strong>All {flight.wineCount} wines revealed.</strong>
							<span className="flight-muted">
								Every taster&apos;s tastings are already in their archive.
							</span>
						</div>
					)}
					<div className="flight-wines">
						{flight.wines.map((wine) => (
							<WineCard key={wine.number} wine={wine} flight={flight} />
						))}
					</div>
					<p className="flight-legend" aria-hidden="true">
						<span className="flight-legend__item flight-legend__item--filled">Submitted</span>
						<span className="flight-legend__item flight-legend__item--dashed">Tasting</span>
						<span className="flight-legend__item flight-legend__item--faint">Not started</span>
					</p>
				</div>
			</div>
		</main>
	);
}
