'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IconBottle, IconGlassFull } from '@tabler/icons-react';
import { useModalProvider } from '../modal/ModalProvider';
import { useToastProvider } from '../toast/ToastProvider';
import { useTastingContext } from '../tasting/TastingContext';
import { PHASE_ORDER } from '../tasting/phaseCompletion';
import { unlockAudio } from '../../utils/beep';
import { JsonApiError } from '../../utils/ErrorUtils';
import { type FlightView, type MyWineView } from '../../types/Flight';
import { Avatar, StatusPill, clockText, flightService, formatTimer, useNow } from './FlightBits';
import { formatTime } from '../../utils/DateUtils';
import { flightsText } from '../../i18n/flights';
import { commonText } from '../../i18n/common';
import { useLang, useText } from '../../i18n/LanguageProvider';

const CHOOSE_MODAL = 'flight-wine-type';

export default function TasterFlight({ flight, reload }: { flight: FlightView; reload: () => Promise<void> }) {
	const { lang } = useLang();
	const text = useText(flightsText);
	const t = text.taster;
	const common = useText(commonText);
	const router = useRouter();
	const now = useNow();
	const { tastingData, resetTastingData, updateTastingData } = useTastingContext();
	const { openModal, closeModal } = useModalProvider();
	const { showToast } = useToastProvider();
	const mine = flight.mine ?? [];
	const revealed = flight.wines.filter((wine) => wine.revealed).length;
	const hostFirst = flight.host.name.split(' ')[0];

	const begin = async (number: number, wineType: 'Red' | 'White') => {
		closeModal(CHOOSE_MODAL);
		unlockAudio();
		try {
			const { endsAt } = await flightService.start(flight.code, number);
			resetTastingData();
			updateTastingData({
				wineType,
				grid: flight.grid,
				timerEnabled: endsAt !== null,
				timerSeconds: flight.timerSeconds,
				timerMode: endsAt !== null ? 'exam' : undefined,
				timerEndsAt: endsAt ?? undefined,
				soundEnabled: true,
				wineName: `${flight.name} · ${text.bits.wineN(number)}`,
				conclusion: { initial: {}, final: {} },
				flight: { code: flight.code, name: flight.name, wineNumber: number, wineCount: flight.wineCount },
			});
			router.push(`/tastings/sight?wineType=${wineType.toLowerCase()}`);
		} catch (error) {
			showToast({
				title: t.couldNotOpen,
				children: JsonApiError.create(error).message,
				color: 'error',
			});
			await reload();
		}
	};

	const open = (wine: MyWineView) => {
		// Same wine still in this browser: carry on where the taster left off.
		const current = tastingData.flight;
		if (wine.status === 'tasting' && current?.code === flight.code && current.wineNumber === wine.number) {
			const furthest = Math.min(tastingData.furthestPhase ?? 0, PHASE_ORDER.length - 1);
			router.push(`${PHASE_ORDER[furthest]}?wineType=${tastingData.wineType?.toLowerCase() ?? 'red'}`);
			return;
		}
		openModal({
			modalId: CHOOSE_MODAL,
			title: text.bits.wineN(wine.number),
			closeOnClickOutside: true,
			closeOnEsc: true,
			children: (
				<div className="dialog">
					<p className="dialog__lead">{t.whatColor}</p>
					<p className="dialog__note">
						{wine.status === 'tasting' ? t.notKept : flight.timerSeconds ? t.clockNow : t.untimedFlight}
					</p>
					<div className="flight-color">
						<button type="button" className="flight-color__btn" onClick={() => begin(wine.number, 'Red')}>
							<IconGlassFull size={20} aria-hidden="true" />
							{common.red}
						</button>
						<button type="button" className="flight-color__btn" onClick={() => begin(wine.number, 'White')}>
							<IconBottle size={20} aria-hidden="true" />
							{common.white}
						</button>
					</div>
				</div>
			),
		});
	};

	const stillTasting = (number: number) =>
		Object.values(flight.wines.find((w) => w.number === number)?.statuses ?? {}).filter(
			(status) => status === 'tasting' || status === 'notstarted',
		).length;

	return (
		<main className="flight-main flight-main--narrow">
			<header className="page-head">
				<div>
					<span className="page-head__eyebrow">{`${text.bits.flight}${flight.ended ? ` · ${text.bits.ended}` : ''}`}</span>
					<h1 className="page-head__title">{flight.name}</h1>
					<p className="page-head__sub">
						{text.bits.hostedBy(flight.host.name)} · {common.grid[flight.grid].short} ·{' '}
						{common.wines(flight.wineCount)} · {formatTimer(flight.timerSeconds, lang)} ·{' '}
						{text.bits.revealedOf(revealed, flight.wineCount)}
					</p>
				</div>
				<div className="flight-people" aria-label={text.bits.tastersHeading}>
					{flight.members.map((member) => (
						<Avatar key={member.id} person={member} size="sm" />
					))}
				</div>
			</header>

			<ol className="flight-list">
				{mine.map((wine) => {
					const info = flight.wines.find((w) => w.number === wine.number);
					let title: string;
					let detail: string;
					if (info?.revealed) {
						title = info.title ?? text.bits.wineN(wine.number);
						detail = wine.status === 'submitted' ? (info.detail ?? '') : t.revealedBefore;
					} else if (wine.status === 'submitted') {
						const left = stillTasting(wine.number);
						title = t.waitingFor(hostFirst);
						detail = `${t.submitted}${wine.submittedAt ? t.at(formatTime(wine.submittedAt, lang)) : ''}${left ? t.stillTasting(left) : ''}`;
					} else if (wine.status === 'tasting') {
						title = wine.endsAt ? t.timeLeft(clockText(wine.endsAt, now) ?? '') : text.bits.untimed;
						detail = t.carryOn;
					} else {
						title = t.ready;
						detail = flight.timerSeconds ? t.clockOnOpen : text.bits.untimed;
					}

					return (
						<li
							key={wine.number}
							className={`flight-list__row${wine.status === 'tasting' ? ' flight-list__row--active' : ''}`}
						>
							<span className="flight-list__number">{wine.number}</span>
							<div className="flight-list__text">
								<StatusPill
									status={
										info?.revealed
											? wine.status === 'submitted'
												? 'revealed'
												: 'notsubmitted'
											: wine.status
									}
								/>
								<span className="flight-list__title">{title}</span>
								<span className="flight-muted">{detail}</span>
							</div>
							{wine.score !== null && (
								<span className="score-tag">
									{wine.score} / {wine.outOf}
								</span>
							)}
							{info?.revealed ? (
								<Link
									href={`/flights/${flight.code}/wines/${wine.number}`}
									className="text-link text-link--sm"
								>
									{text.bits.results}
								</Link>
							) : wine.status === 'tasting' ? (
								<button
									type="button"
									className="btn-primary btn-primary--sm"
									onClick={() => open(wine)}
								>
									{t.continue}
								</button>
							) : wine.status === 'notstarted' && !flight.ended ? (
								<button type="button" className="btn-quiet btn-quiet--sm" onClick={() => open(wine)}>
									{t.start}
								</button>
							) : null}
						</li>
					);
				})}
			</ol>

			<p className="flight-note">
				{t.note(hostFirst)}
				{revealed > 0 && (
					<>
						{' '}
						<Link href={`/flights/${flight.code}/summary`} className="text-link text-link--sm">
							{text.bits.summary}
						</Link>
					</>
				)}
			</p>
		</main>
	);
}
