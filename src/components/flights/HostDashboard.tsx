'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import { IconArrowRight, IconChecks, IconCopy } from '@tabler/icons-react';
import { useModalProvider } from '../modal/ModalProvider';
import { useToastProvider } from '../toast/ToastProvider';
import { JsonApiError } from '../../utils/ErrorUtils';
import { type FlightMemberView, type FlightView, type FlightWineView } from '../../types/Flight';
import { formatCode } from '../../utils/flightLogic';
import {
	Avatar,
	FlightHead,
	StatusPill,
	avatarState,
	clockText,
	flightService,
	formatTimer,
	useNow,
} from './FlightBits';
import { flightsText } from '../../i18n/flights';
import { commonText } from '../../i18n/common';
import { useLang, useText } from '../../i18n/LanguageProvider';
import { formatAverage } from '../../utils/NumberUtils';

type Text = (typeof flightsText)['en'];

function progressText(flight: FlightView, t: Text): string {
	const revealed = flight.wines.filter((wine) => wine.revealed).length;
	if (revealed === flight.wineCount) {
		return t.bits.allRevealed(flight.wineCount);
	}
	if (revealed) {
		return t.bits.revealedOf(revealed, flight.wineCount);
	}
	return flight.members.some((m) => m.tastingWine || m.submittedCount) ? t.host.underWay : t.bits.status.notstarted;
}

function tasterLine(member: FlightMemberView, flight: FlightView, now: number, t: Text): string {
	if (member.tastingWine) {
		return member.endsAt && new Date(member.endsAt).getTime() <= now
			? t.host.outOfTime(member.tastingWine)
			: t.host.tastingWine(member.tastingWine);
	}
	if (member.waitingOn) {
		return t.host.waiting(member.waitingOn);
	}
	if (member.submittedCount === flight.wineCount) {
		return `${t.bits.submittedOf(member.submittedCount, flight.wineCount)}${member.outOf ? ` · ${member.total} / ${member.outOf}` : ''}`;
	}
	return member.submittedCount
		? t.bits.submittedOf(member.submittedCount, flight.wineCount)
		: t.bits.status.notstarted;
}

function JoinCard({ code }: { code: string }) {
	// Only ever rendered in the browser, after the flight has loaded.
	const t = useText(flightsText).host;
	const link = `${window.location.origin}/f/${code}`;
	const [qr, setQr] = useState('');
	const { showToast } = useToastProvider();

	useEffect(() => {
		QRCode.toString(link, { type: 'svg', margin: 1, color: { dark: '#27201d', light: '#fffbf4' } })
			.then(setQr)
			.catch(() => setQr(''));
	}, [link]);

	const copy = async () => {
		try {
			await navigator.clipboard.writeText(link);
			showToast({ title: t.linkCopied, children: t.sendIt, color: 'success', autoCloseMs: 3000 });
		} catch {
			showToast({ title: t.copyFailed, children: link, color: 'error' });
		}
	};

	return (
		<section className="flight-card flight-join" aria-labelledby="flight-join-heading">
			<span className="tasting-card__label" id="flight-join-heading">
				{t.joinCode}
			</span>
			<p className="flight-join__code" aria-label={t.joinCodeAria(code.split('').join(' '))}>
				{formatCode(code)}
			</p>
			<div className="flight-join__share">
				{qr && (
					<span
						className="flight-join__qr"
						role="img"
						aria-label={t.qrAria}
						// Generated locally from the link above; no user input reaches it.
						dangerouslySetInnerHTML={{ __html: qr }}
					/>
				)}
				<div className="flight-join__link">
					<span>{link.replace(/^https?:\/\//, '')}</span>
					<button type="button" className="btn-quiet btn-quiet--sm" onClick={copy}>
						<IconCopy size={14} aria-hidden="true" />
						{t.copyLink}
					</button>
				</div>
			</div>
		</section>
	);
}

function TastersCard({ flight }: { flight: FlightView }) {
	const text = useText(flightsText);
	const t = text.host;
	const now = useNow();
	return (
		<section className="flight-card" aria-labelledby="flight-tasters-heading">
			<div className="flight-card__head">
				<span className="tasting-card__label" id="flight-tasters-heading">
					{text.bits.tastersHeading}
				</span>
				<span className="flight-muted">{t.joinedCount(flight.members.length)}</span>
			</div>
			{flight.members.length === 0 ? (
				<div className="empty-state empty-state--boxed flight-empty">
					<strong>{t.emptyTitle}</strong>
					<span>{t.emptyNote}</span>
				</div>
			) : (
				<ul className="flight-tasters">
					{flight.members.map((member) => (
						<li key={member.id} className="flight-tasters__row">
							<Avatar person={member} />
							<span className="flight-tasters__text">
								<span className="flight-tasters__name">{member.name}</span>
								<span className="flight-muted">{tasterLine(member, flight, now, text)}</span>
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
	const { lang } = useLang();
	const text = useText(flightsText);
	const t = text.host;
	const countWords = { submitted: t.countSubmitted, tasting: t.countTasting, notstarted: t.countNotStarted };
	const statuses = flight.members.map((member) => wine.statuses[member.id] ?? 'notstarted');
	const counts = (['submitted', 'tasting', 'notstarted'] as const)
		.map((status) => [statuses.filter((s) => s === status).length, status] as const)
		.filter(([n]) => n)
		.map(([n, status]) => countWords[status](n));
	const allSubmitted = flight.members.length > 0 && statuses.every((s) => s === 'submitted');
	const started = statuses.some((s) => s !== 'notstarted');

	const pill = wine.revealed ? (
		<StatusPill status="revealed" />
	) : allSubmitted ? (
		<StatusPill status="allsubmitted" />
	) : started ? (
		<StatusPill status="tasting" />
	) : (
		<StatusPill status="notstarted" />
	);

	return (
		<li className={`flight-wine${wine.submitted && !wine.revealed ? ' flight-wine--active' : ''}`}>
			<span className="flight-wine__n">{wine.number}</span>
			<div className="flight-wine__body">
				<div className="flight-wine__row">
					<strong>{wine.revealed ? wine.title : text.bits.wineN(wine.number)}</strong>
					{pill}
				</div>
				{wine.revealed ? (
					<div className="flight-wine__row">
						<span className="flight-wine__detail">
							{t.average(
								formatAverage(wine.average, lang),
								wine.outOf,
								wine.submitted,
								flight.members.length,
							)}{' '}
							· {t.best(String(wine.best ?? '—'), wine.outOf)}
						</span>
						<Link href={`/flights/${flight.code}/wines/${wine.number}`} className="flight-wine__link">
							{text.bits.results}
						</Link>
					</div>
				) : (
					<>
						<div className="flight-wine__row">
							<span className="flight-people">
								{flight.members.map((member) => {
									const status = wine.statuses[member.id] ?? 'notstarted';
									return (
										<Avatar
											key={member.id}
											person={member}
											size="sm"
											state={avatarState(status)}
											title={`${member.name}: ${text.bits.statusLower[status]}`}
										/>
									);
								})}
							</span>
							<span className="flight-wine__detail">
								{counts.length ? counts.join(' · ') : t.waitingForTasters}
							</span>
						</div>
						{wine.submitted ? (
							<Link
								href={`/flights/${flight.code}/wines/${wine.number}/reveal`}
								className="btn-primary flight-wine__action"
							>
								{text.bits.revealWine(wine.number)}
							</Link>
						) : (
							started && <span className="flight-wine__locked">{t.locked}</span>
						)}
					</>
				)}
			</div>
		</li>
	);
}

export default function HostDashboard({ flight, reload }: { flight: FlightView; reload: () => Promise<void> }) {
	const { lang } = useLang();
	const text = useText(flightsText);
	const t = text.host;
	const common = useText(commonText);
	const { openModal, closeModal } = useModalProvider();
	const { showToast } = useToastProvider();
	const allRevealed = flight.wines.every((wine) => wine.revealed);
	const anyRevealed = flight.wines.some((wine) => wine.revealed);

	const confirmEnd = () =>
		openModal({
			modalId: 'end-flight',
			title: t.endTitle,
			closeOnClickOutside: true,
			closeOnEsc: true,
			children: (
				<div className="dialog">
					<p className="dialog__lead">{t.endLead}</p>
					<p className="dialog__note">{t.endNote}</p>
					<div className="dialog__actions">
						<button className="btn-quiet" onClick={() => closeModal('end-flight')}>
							{t.keepOpen}
						</button>
						<button
							className="btn-primary"
							onClick={async () => {
								closeModal('end-flight');
								try {
									await flightService.end(flight.code);
									await reload();
								} catch (error) {
									showToast({
										title: t.notEnded,
										children: JsonApiError.create(error).message,
										color: 'error',
									});
								}
							}}
						>
							{t.end}
						</button>
					</div>
				</div>
			),
		});

	return (
		<main className="flight-main">
			<FlightHead
				crumb={`${text.bits.flight} · ${t.hosting}${flight.ended ? ` · ${text.bits.ended}` : ''}`}
				title={flight.name}
				sub={[
					common.grid[flight.grid].short,
					common.wines(flight.wineCount),
					formatTimer(flight.timerSeconds, lang),
					progressText(flight, text),
				].join(' · ')}
				actions={
					<>
						{anyRevealed && (
							<Link href={`/flights/${flight.code}/summary`} className="btn-primary">
								{text.bits.summary} <IconArrowRight size={16} aria-hidden="true" />
							</Link>
						)}
						{!flight.ended && (
							<button type="button" className="btn-quiet" onClick={confirmEnd}>
								{t.end}
							</button>
						)}
					</>
				}
			/>

			<div className="flight-dashboard">
				<div className="flight-dashboard__side">
					{!flight.ended && <JoinCard code={flight.code} />}
					<TastersCard flight={flight} />
				</div>

				<div className="flight-dashboard__wines">
					{allRevealed && (
						<div className="flight-notice flight-banner">
							<IconChecks size={18} aria-hidden="true" />
							<strong>
								{flight.wineCount === 1 ? t.oneRevealed : t.allWinesRevealed(flight.wineCount)}
							</strong>
							<span className="flight-muted">{t.inArchive}</span>
						</div>
					)}
					<div className="flight-dashboard__wines-head">
						<h2>{t.winesHeading}</h2>
						<span>{t.revealHint}</span>
					</div>
					<ol className="flight-wines">
						{flight.wines.map((wine) => (
							<WineCard key={wine.number} wine={wine} flight={flight} />
						))}
					</ol>
					<p className="flight-legend" aria-hidden="true">
						<span className="flight-legend__item flight-legend__item--filled">
							{text.bits.status.submitted}
						</span>
						<span className="flight-legend__item flight-legend__item--dashed">
							{text.bits.status.tasting}
						</span>
						<span className="flight-legend__item flight-legend__item--faint">
							{text.bits.status.notstarted}
						</span>
					</p>
				</div>
			</div>
		</main>
	);
}
