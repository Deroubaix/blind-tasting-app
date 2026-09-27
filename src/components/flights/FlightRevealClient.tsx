'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IconPointFilled, IconX } from '@tabler/icons-react';
import RevealFields from '../archives/RevealFields';
import { type Reveal, isRevealed } from '../archives/revealScore';
import { useToastProvider } from '../../toast/ToastProvider';
import { JsonApiError } from '../../utils/ErrorUtils';
import { FlightMessage, clockText, flightService, useFlight, useNow, useRequireLogin } from './FlightBits';

const listNames = (names: string[]) =>
	names.length <= 1 ? (names[0] ?? '') : `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`;

export default function FlightRevealClient({ code, number }: { code: string; number: number }) {
	const ready = useRequireLogin(`/flights/${code}/wines/${number}/reveal`);
	const { flight, error } = useFlight(code, ready);
	const router = useRouter();
	const now = useNow();
	const { showToast } = useToastProvider();
	const [draft, setDraft] = useState<Reveal>({});
	const [saving, setSaving] = useState(false);
	const wine = flight?.wines.find((w) => w.number === number);

	// Correcting a reveal starts from what was entered.
	const revealed = wine?.revealed ?? false;
	useEffect(() => {
		if (revealed) {
			flightService
				.results(code, number)
				.then((results) => setDraft(results.reveal))
				.catch(() => undefined);
		}
	}, [revealed, code, number]);

	if (error && !flight) {
		return <FlightMessage>{error}</FlightMessage>;
	}
	if (!flight) {
		return <div className="archives-loading">Loading…</div>;
	}
	if (flight.role !== 'host') {
		return <FlightMessage>Only the host reveals the wines.</FlightMessage>;
	}
	if (!wine) {
		return <FlightMessage>This flight has no wine {number}.</FlightMessage>;
	}

	const tasting = flight.members.filter((member) => wine.statuses[member.id] === 'tasting');
	const submitted = wine.submitted;

	const save = async () => {
		setSaving(true);
		try {
			await flightService.reveal(code, number, draft);
			router.push(`/flights/${code}/wines/${number}`);
		} catch (err) {
			showToast({ title: 'Not revealed', children: JsonApiError.create(err).message, color: 'error' });
			setSaving(false);
		}
	};

	return (
		<main className="flight-main flight-main--narrow">
			<Link href={`/flights/${code}`} className="flight-back no-underline">
				← {flight.name}
			</Link>

			<section className="reveal-card reveal-form flight-reveal" aria-labelledby="flight-reveal-heading">
				{/* Phone only: the form is a full-screen sheet with its own header. */}
				<div className="reveal-form__sheet-head">
					<Link href={`/flights/${code}`} className="reveal-form__close no-underline" aria-label="Close">
						<IconX size={22} aria-hidden="true" />
					</Link>
					<div className="reveal-form__sheet-title">
						<span>Reveal wine {number}</span>
						<span className="reveal-form__sheet-sub">{flight.name}</span>
					</div>
				</div>
				<div className="reveal-form__body">
					<span className="reveal-eyebrow">
						Reveal · Wine {number} of {flight.wineCount}
					</span>
					<h1 className="reveal-form__heading" id="flight-reveal-heading">
						What was wine {number}?
					</h1>
					<p className="reveal-form__lede">
						Copy it from the label once. Everyone who submitted is scored at the same moment.
					</p>

					{!revealed && tasting.length > 0 && (
						<div className="flight-warning" role="note">
							<IconPointFilled size={16} aria-hidden="true" />
							<div>
								<p className="flight-warning__lead">
									{submitted} of {flight.members.length} have submitted.{' '}
									{tasting.length === 1
										? `${tasting[0].name} is still tasting${tasting[0].endsAt ? ` (${clockText(tasting[0].endsAt, now)} left)` : ''}.`
										: `${listNames(tasting.map((m) => m.name))} are still tasting.`}
								</p>
								<p className="flight-muted">
									If you reveal now, wine {number} closes for{' '}
									{tasting.length === 1 ? 'them' : 'them all'}. They&apos;ll be shown as Not
									submitted, not scored 0, and left out of the average.
								</p>
								<Link href={`/flights/${code}`} className="outline flight-btn-small no-underline">
									Wait for {tasting.length === 1 ? tasting[0].name.split(' ')[0] : 'them'}
								</Link>
							</div>
						</div>
					)}

					<RevealFields value={draft} onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))} />
				</div>

				<div className="reveal-form__actions">
					<button
						type="button"
						className="btn-primary reveal-form__save"
						onClick={save}
						disabled={saving || !isRevealed(draft) || !submitted}
					>
						{saving ? 'Revealing…' : revealed ? 'Save correction' : 'Reveal to everyone'}
					</button>
					<Link href={`/flights/${code}`} className="reveal-btn-quiet reveal-form__cancel no-underline">
						Cancel
					</Link>
					<span className="reveal-form__footnote">Opens the results for wine {number}.</span>
				</div>
			</section>
		</main>
	);
}
