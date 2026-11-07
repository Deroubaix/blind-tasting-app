'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { IconCheck } from '@tabler/icons-react';
import { JsonApiError } from '../../utils/ErrorUtils';
import { type FlightSummary } from '../../types/Flight';
import { Avatar, FlightHead, FlightMessage, flightService, formatTimer, useRequireLogin } from './FlightBits';
import { formatDate } from '../../utils/DateUtils';
import { flightsText } from '../../i18n/flights';
import { commonText } from '../../i18n/common';
import { useLang, useText } from '../../i18n/LanguageProvider';
import { formatAverage } from '../../utils/NumberUtils';

export default function FlightSummaryClient({ code }: { code: string }) {
	const { lang } = useLang();
	const text = useText(flightsText);
	const t = text.summary;
	const common = useText(commonText);
	const ready = useRequireLogin(`/flights/${code}/summary`);
	const [summary, setSummary] = useState<FlightSummary | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!ready) {
			return;
		}
		flightService
			.summary(code)
			.then(setSummary)
			.catch((err) => setError(JsonApiError.create(err).message));
		// The titles and notes are written on the server, so a language switch fetches them again.
	}, [ready, code, lang]);

	if (error !== null) {
		return <FlightMessage>{error || t.loadFailed}</FlightMessage>;
	}
	if (!summary) {
		return <div className="empty-state">{common.loading}</div>;
	}

	const revealed = summary.wines.filter((wine) => wine.revealed).length;
	const date = formatDate(summary.createdAt, lang);

	return (
		<main className="flight-main">
			<FlightHead
				crumb={`${text.bits.summary} · ${
					revealed === summary.wines.length
						? text.bits.allRevealed(revealed)
						: text.bits.revealedOf(revealed, summary.wines.length)
				}`}
				title={summary.name}
				sub={[
					date,
					text.bits.hostedBy(summary.hostName),
					text.bits.tasters(summary.members.length),
					formatTimer(summary.timerSeconds, lang),
				].join(' · ')}
				actions={
					<Link href={`/flights/${code}`} className="btn-quiet">
						← {summary.name}
					</Link>
				}
			/>
			<p className="flight-note">{t.inArchive}</p>

			<section className="flight-card flight-results__card">
				<div className="flight-summary" role="table" aria-label={t.tableAria}>
					<div
						className="flight-summary__row flight-summary__row--head"
						role="row"
						style={{ ['--cols' as string]: summary.members.length }}
					>
						<span role="columnheader">{text.bits.wine}</span>
						{summary.members.map((member) => (
							<span key={member.id} role="columnheader" className="flight-summary__person">
								<Avatar person={member} size="sm" />
								<span className="flight-summary__first">{member.name.split(' ')[0]}</span>
							</span>
						))}
						<span role="columnheader">{t.groupAvg}</span>
					</div>

					{summary.wines.map((wine) => (
						<div
							key={wine.number}
							className="flight-summary__row"
							role="row"
							style={{ ['--cols' as string]: summary.members.length }}
						>
							<span role="rowheader" className="flight-summary__wine">
								<span className="flight-summary__n">{wine.number}</span>
								<span>
									{wine.revealed ? (
										<Link
											href={`/flights/${code}/wines/${wine.number}`}
											className="text-link text-link--sm"
										>
											{wine.title}
										</Link>
									) : (
										<span className="flight-muted">{t.notRevealedYet}</span>
									)}
									{wine.grape && <span className="flight-muted">{wine.grape}</span>}
								</span>
							</span>
							{summary.members.map((member) => {
								const cell = wine.scores[member.id];
								return (
									<span key={member.id} role="cell" className="flight-summary__cell">
										{!wine.revealed ? (
											<span className="flight-muted">—</span>
										) : cell ? (
											<span>
												{cell.score === cell.outOf && (
													<IconCheck size={11} aria-label={t.allRight} />
												)}
												{cell.score} / {cell.outOf}
											</span>
										) : (
											<span
												className="flight-status flight-status--notsubmitted"
												title={t.notSubmittedTitle(member.name)}
											>
												{text.bits.status.notsubmitted}
											</span>
										)}
									</span>
								);
							})}
							<span role="cell" className="flight-summary__cell">
								<span>
									{formatAverage(wine.average, lang)}
									{wine.average !== null && <span className="flight-muted"> / {wine.outOf}</span>}
								</span>
							</span>
						</div>
					))}

					<div
						className="flight-summary__row flight-summary__row--total"
						role="row"
						style={{ ['--cols' as string]: summary.members.length }}
					>
						<span role="rowheader">{t.total}</span>
						{summary.members.map((member) => {
							const total = summary.totals[member.id];
							return (
								<span key={member.id} role="cell" className="flight-summary__cell">
									<strong>{total.outOf ? `${total.score} / ${total.outOf}` : '—'}</strong>
									<span className="flight-muted">
										{total.submitted === revealed
											? t.allSubmitted(revealed)
											: text.bits.submittedOf(total.submitted, revealed)}
									</span>
								</span>
							);
						})}
						<span role="cell" className="flight-summary__cell">
							<span>
								<strong>{formatAverage(summary.groupAverage, lang)}</strong>
								{summary.groupAverage !== null && summary.groupOutOf && (
									<span className="flight-muted"> / {summary.groupOutOf}</span>
								)}
							</span>
						</span>
					</div>
				</div>
			</section>

			{summary.mostConfused && (
				<p className="flight-confused">
					<span className="tasting-card__label">{t.mostConfused}</span>
					<span>
						<Link
							href={`/flights/${code}/wines/${summary.mostConfused.number}`}
							className="text-link text-link--sm"
						>
							{t.confusedWine(summary.mostConfused.number, summary.mostConfused.title)}
						</Link>
						{t.confusedAverage(
							formatAverage(summary.mostConfused.average, lang),
							summary.mostConfused.outOf,
						)}
						{summary.mostConfused.note && ` ${summary.mostConfused.note}`}
					</span>
				</p>
			)}
			<p className="flight-note">{t.footnote}</p>
		</main>
	);
}
