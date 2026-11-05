'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IconPointFilled, IconX } from '@tabler/icons-react';
import RevealFields from '../archives/RevealFields';
import { type Reveal, isRevealed } from '../../utils/revealScore';
import { useToastProvider } from '../toast/ToastProvider';
import { JsonApiError } from '../../utils/ErrorUtils';
import { FlightMessage, clockText, flightService, useFlight, useNow, useRequireLogin } from './FlightBits';
import { flightsText } from '../../i18n/flights';
import { commonText } from '../../i18n/common';
import { useText } from '../../i18n/LanguageProvider';

const listNames = (names: string[], and: string) =>
	names.length <= 1 ? (names[0] ?? '') : `${names.slice(0, -1).join(', ')} ${and} ${names.at(-1)}`;

export default function FlightRevealClient({ code, number }: { code: string; number: number }) {
	const text = useText(flightsText);
	const t = text.reveal;
	const common = useText(commonText);
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
		return <div className="archives-loading">{common.loading}</div>;
	}
	if (flight.role !== 'host') {
		return <FlightMessage>{t.onlyHost}</FlightMessage>;
	}
	if (!wine) {
		return <FlightMessage>{t.noWine(number)}</FlightMessage>;
	}

	const tasting = flight.members.filter((member) => wine.statuses[member.id] === 'tasting');
	const submitted = wine.submitted;

	const save = async () => {
		setSaving(true);
		try {
			await flightService.reveal(code, number, draft);
			router.push(`/flights/${code}/wines/${number}`);
		} catch (err) {
			showToast({ title: t.notRevealed, children: JsonApiError.create(err).message, color: 'error' });
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
					<Link
						href={`/flights/${code}`}
						className="reveal-form__close no-underline"
						aria-label={common.close}
					>
						<IconX size={22} aria-hidden="true" />
					</Link>
					<div className="reveal-form__sheet-title">
						<span>{text.bits.revealWine(number)}</span>
						<span className="reveal-form__sheet-sub">{flight.name}</span>
					</div>
				</div>
				<div className="reveal-form__body">
					<span className="reveal-eyebrow">{t.eyebrow(number, flight.wineCount)}</span>
					<h1 className="reveal-form__heading" id="flight-reveal-heading">
						{t.heading(number)}
					</h1>
					<p className="reveal-form__lede">{flight.grid === 'wset' ? t.ledeWset : t.ledeCms}</p>

					{!revealed && tasting.length > 0 && (
						<div className="flight-warning" role="note">
							<IconPointFilled size={16} aria-hidden="true" />
							<div>
								<p className="flight-warning__lead">
									{t.haveSubmitted(submitted, flight.members.length)}{' '}
									{tasting.length === 1
										? t.oneTasting(
												tasting[0].name,
												tasting[0].endsAt ? clockText(tasting[0].endsAt, now) : null,
											)
										: t.manyTasting(
												listNames(
													tasting.map((m) => m.name),
													t.and,
												),
											)}
								</p>
								<p className="flight-muted">{t.closes(number, tasting.length === 1)}</p>
								<Link href={`/flights/${code}`} className="outline flight-btn-small no-underline">
									{t.waitFor(tasting.length === 1 ? tasting[0].name.split(' ')[0] : null)}
								</Link>
							</div>
						</div>
					)}

					<RevealFields
						grid={flight.grid}
						value={draft}
						onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))}
					/>
				</div>

				<div className="reveal-form__actions">
					<button
						type="button"
						className="btn-primary reveal-form__save"
						onClick={save}
						disabled={saving || !isRevealed(draft) || !submitted}
					>
						{saving ? t.revealing : revealed ? t.saveCorrection : t.revealAll}
					</button>
					<Link href={`/flights/${code}`} className="reveal-btn-quiet reveal-form__cancel no-underline">
						{common.cancel}
					</Link>
					<span className="reveal-form__footnote">{t.footnote(number)}</span>
				</div>
			</section>
		</main>
	);
}
