'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { IconCheck } from '@tabler/icons-react';
import { JsonApiError } from '../../utils/ErrorUtils';
import { type FlightSummary } from '../../types/Flight';
import { Avatar, FlightMessage, flightService, formatTimer, useRequireLogin } from './FlightBits';
import { formatDate } from '../../utils/DateUtils';
import { plural } from './flightLogic';

export default function FlightSummaryClient({ code }: { code: string }) {
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
			.catch((err) => setError(JsonApiError.create(err).message || 'The summary could not be loaded.'));
	}, [ready, code]);

	if (error) {
		return <FlightMessage>{error}</FlightMessage>;
	}
	if (!summary) {
		return <div className="archives-loading">Loading…</div>;
	}

	const revealed = summary.wines.filter((wine) => wine.revealed).length;
	const date = formatDate(summary.createdAt);

	return (
		<main className="flight-main">
			<Link href={`/flights/${code}`} className="flight-back no-underline">
				← {summary.name}
			</Link>
			<header className="flight-head">
				<div>
					<span className="page-eyebrow">
						Flight summary ·{' '}
						{revealed === summary.wines.length
							? `All ${revealed} revealed`
							: `${revealed} of ${summary.wines.length} revealed`}
					</span>
					<h1 className="flight-head__title">{summary.name}</h1>
					<p className="flight-head__sub">
						{date} · Hosted by {summary.hostName} · {plural(summary.members.length, 'taster')} ·{' '}
						{formatTimer(summary.timerSeconds)}
					</p>
				</div>
				<p className="flight-note flight-summary__archive">
					Each taster&apos;s own tastings are already in their archive.
				</p>
			</header>

			<section className="flight-card flight-results__card">
				<div className="flight-summary" role="table" aria-label="Scores by wine and taster">
					<div
						className="flight-summary__row flight-summary__row--head"
						role="row"
						style={{ ['--cols' as string]: summary.members.length }}
					>
						<span role="columnheader">Wine</span>
						{summary.members.map((member) => (
							<span key={member.id} role="columnheader" className="flight-summary__person">
								<Avatar person={member} size="sm" />
								<span className="flight-summary__first">{member.name.split(' ')[0]}</span>
							</span>
						))}
						<span role="columnheader">Group avg</span>
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
											className="flight-link no-underline"
										>
											{wine.title}
										</Link>
									) : (
										<span className="flight-muted">Not revealed yet</span>
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
													<IconCheck size={11} aria-label="Every field right" />
												)}
												{cell.score} / {cell.outOf}
											</span>
										) : (
											<span
												className="flight-status flight-status--notsubmitted"
												title={`${member.name}: not submitted`}
											>
												Not submitted
											</span>
										)}
									</span>
								);
							})}
							<span role="cell" className="flight-summary__cell">
								{wine.average ?? '—'}
								{wine.average !== null && <span className="flight-muted"> / {wine.outOf}</span>}
							</span>
						</div>
					))}

					<div
						className="flight-summary__row flight-summary__row--total"
						role="row"
						style={{ ['--cols' as string]: summary.members.length }}
					>
						<span role="rowheader">Total</span>
						{summary.members.map((member) => {
							const total = summary.totals[member.id];
							return (
								<span key={member.id} role="cell" className="flight-summary__cell">
									<strong>{total.outOf ? `${total.score} / ${total.outOf}` : '—'}</strong>
									<span className="flight-muted">
										{total.submitted === revealed
											? `All ${revealed} submitted`
											: `${total.submitted} of ${revealed} submitted`}
									</span>
								</span>
							);
						})}
						<span role="cell" className="flight-summary__cell">
							<strong>{summary.groupAverage ?? '—'}</strong>
							{summary.groupAverage !== null && summary.groupOutOf && (
								<span className="flight-muted"> / {summary.groupOutOf}</span>
							)}
						</span>
					</div>
				</div>
			</section>

			{summary.mostConfused && (
				<p className="flight-confused">
					<span className="tasting-card__label">Most confused</span>
					<span>
						<Link href={`/flights/${code}/wines/${summary.mostConfused.number}`} className="flight-link">
							Wine {summary.mostConfused.number}, {summary.mostConfused.title}
						</Link>
						: average {summary.mostConfused.average} / {summary.mostConfused.outOf}.
						{summary.mostConfused.note && ` ${summary.mostConfused.note}`}
					</span>
				</p>
			)}
			<p className="flight-note">
				Tasters stay in the order they joined. A wine is scored out of the fields its label gives.
			</p>
		</main>
	);
}
