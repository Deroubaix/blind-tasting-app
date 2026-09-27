'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IconBottle, IconGlassFull } from '@tabler/icons-react';
import { useModalProvider } from '../modal/ModalProvider';
import { useToastProvider } from '../../toast/ToastProvider';
import { useTastingContext } from '../tasting/TastingContext';
import { PHASE_ORDER } from '../tasting/phaseCompletion';
import { unlockAudio } from '../../utils/beep';
import { JsonApiError } from '../../utils/ErrorUtils';
import { type FlightView, type MyWineView } from '../../types/Flight';
import { Avatar, StatusPill, clockText, flightService, formatTimer, useNow } from './FlightBits';

const CHOOSE_MODAL = 'flight-wine-type';

export default function TasterFlight({ flight, reload }: { flight: FlightView; reload: () => Promise<void> }) {
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
				timerEnabled: endsAt !== null,
				timerSeconds: flight.timerSeconds,
				timerMode: endsAt !== null ? 'exam' : undefined,
				timerEndsAt: endsAt ?? undefined,
				soundEnabled: true,
				wineName: `${flight.name} · Wine ${number}`,
				conclusion: { initial: {}, final: {} },
				flight: { code: flight.code, name: flight.name, wineNumber: number, wineCount: flight.wineCount },
			});
			router.push(`/tastings/sight?wineType=${wineType.toLowerCase()}`);
		} catch (error) {
			showToast({
				title: 'Could not open the wine',
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
			title: `Wine ${wine.number}`,
			closeOnClickOutside: true,
			closeOnEsc: true,
			children: (
				<div className="confirm-dialog">
					<p className="confirm-dialog__lead">What color is it?</p>
					<p className="confirm-dialog__note">
						{wine.status === 'tasting'
							? 'Your answers for this wine were not kept on this device, so the sheet starts empty. The clock carries on from when you first opened it.'
							: flight.timerSeconds
								? 'The clock starts now.'
								: 'This flight is untimed.'}
					</p>
					<div className="flight-colour">
						<button type="button" className="flight-colour__btn" onClick={() => begin(wine.number, 'Red')}>
							<IconGlassFull size={20} aria-hidden="true" />
							Red
						</button>
						<button
							type="button"
							className="flight-colour__btn"
							onClick={() => begin(wine.number, 'White')}
						>
							<IconBottle size={20} aria-hidden="true" />
							White
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
			<header className="flight-head">
				<div>
					<span className="flight-eyebrow">Flight{flight.ended ? ' · Ended' : ''}</span>
					<h1 className="flight-head__title">{flight.name}</h1>
					<p className="flight-head__sub">
						Hosted by {flight.host.name} · {flight.wineCount} wines · {formatTimer(flight.timerSeconds)} ·{' '}
						{revealed} of {flight.wineCount} revealed
					</p>
				</div>
				<div className="flight-head__people" aria-label="Tasters">
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
						title = info.title ?? `Wine ${wine.number}`;
						detail = wine.status === 'submitted' ? (info.detail ?? '') : 'Not submitted';
					} else if (wine.status === 'submitted') {
						const left = stillTasting(wine.number);
						title = `Waiting for ${hostFirst} to reveal`;
						detail = `Submitted${wine.submittedAt ? ` at ${new Date(wine.submittedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}` : ''}${left ? ` · ${left} still tasting` : ''}`;
					} else if (wine.status === 'tasting') {
						title = 'In progress';
						detail = wine.endsAt ? `${clockText(wine.endsAt, now)} left on the clock` : 'Untimed';
					} else {
						title = 'Not started';
						detail = flight.timerSeconds ? 'The clock starts when you open it' : 'Untimed';
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
								<span className="flight-score">
									{wine.score} / {wine.outOf}
								</span>
							)}
							{info?.revealed ? (
								<Link
									href={`/flights/${flight.code}/wines/${wine.number}`}
									className="flight-link no-underline"
								>
									Results →
								</Link>
							) : wine.status === 'tasting' ? (
								<button
									type="button"
									className="btn-primary flight-btn-small"
									onClick={() => open(wine)}
								>
									Continue
								</button>
							) : wine.status === 'notstarted' && !flight.ended ? (
								<button type="button" className="outline flight-btn-small" onClick={() => open(wine)}>
									Start
								</button>
							) : null}
						</li>
					);
				})}
			</ol>

			<p className="flight-note">
				Taste in any order. You&apos;ll see the results for each wine once {hostFirst} reveals it.
				{revealed > 0 && (
					<>
						{' '}
						<Link href={`/flights/${flight.code}/summary`} className="flight-link">
							Flight summary
						</Link>
					</>
				)}
			</p>
		</main>
	);
}
