'use client';

import { useRouter } from 'next/navigation';
import { Fragment, useState } from 'react';
import { IconChevronDown, IconChevronUp, IconMapPin, IconSearch } from '@tabler/icons-react';
import { commonText } from '../../i18n/common';
import { useText } from '../../i18n/LanguageProvider';
import { wsetText } from '../../i18n/wset';
import { useTerm } from '../../i18n/useTerm';
import { useTastingContext } from '../tasting/TastingContext';
import TastingPhaseLayout from '../layout/TastingPhaseLayout';
import { ChipSearchField, VintageInput } from '../tasting/ConclusionInputs';
import { GRAPE_VARIETALS, WINE_COUNTRIES, WINE_REGIONS } from '../tasting/autocompleteData';
import { OptionCard } from './WsetBits';
import {
	WSET_APPEARANCE_FIELDS,
	WSET_CONCLUSION_KEYS,
	WSET_FLAVOUR_KEY,
	WSET_NOSE_ASSESSMENTS,
	WSET_PALATE,
	WSET_QUALITY,
	WSET_READINESS,
} from './wsetFields';

function Recap({ label, pairs }: { label: string; pairs: [string, string][] }) {
	if (!pairs.length) {
		return null;
	}
	return (
		<div className="fc-analysis__row">
			<div className="fc-analysis__row-label">{label}</div>
			<dl className="fc-analysis__pairs">
				{pairs.map(([key, value]) => (
					<Fragment key={key}>
						<dt className="fc-analysis__pair-key">{key}</dt>
						<dd className="fc-analysis__pair-value">{value}</dd>
					</Fragment>
				))}
			</dl>
		</div>
	);
}

/**
 * The SAT's conclusions: quality level and readiness, each with its reasons. Naming the wine is not
 * part of the Level 3 paper, so the identity fields are offered as optional practice and scored
 * only if the reveal gives them.
 */
export default function WsetConclusionsClient({ wineType }: { wineType: 'red' | 'white' }) {
	const router = useRouter();
	const t = useText(wsetText).conclusions;
	const phases = useText(commonText).phase.wset;
	const term = useTerm();
	const { tastingData, updateTastingData } = useTastingContext();
	const final = tastingData.conclusion?.final ?? {};
	const { quality, readiness, reasons } = WSET_CONCLUSION_KEYS;
	// Closed by default where it stacks above the form; beside the form it is always open.
	const [notesOpen, setNotesOpen] = useState(false);

	const update = (patch: Record<string, string | null>) =>
		updateTastingData({ conclusion: { ...tastingData.conclusion, final: { ...final, ...patch } } });

	const sight = tastingData.sight ?? {};
	const sightPairs = WSET_APPEARANCE_FIELDS.filter((f) => sight[f]).map(
		(f) => [term(f), term(sight[f] as string, f)] as [string, string],
	);
	const nose = tastingData.nose ?? {};
	const nosePairs = Object.keys(WSET_NOSE_ASSESSMENTS)
		.filter((key) => nose[key]?.length)
		.map((key) => [term(key), nose[key].map((v) => term(v, key)).join(' · ')] as [string, string]);
	const aromas = Object.entries(nose)
		.filter(([key, values]) => !(key in WSET_NOSE_ASSESSMENTS) && values?.length)
		.flatMap(([, values]) => values)
		.map((v) => term(v))
		.join(' · ');
	const palate = tastingData.palate ?? {};
	const palatePairs = Object.keys(WSET_PALATE[wineType])
		.filter((key) => palate[key])
		.map((key) => [term(key), term(palate[key] as string, key)] as [string, string]);
	const flavours = Array.isArray(palate[WSET_FLAVOUR_KEY])
		? (palate[WSET_FLAVOUR_KEY] as string[]).map((v) => term(v)).join(' · ')
		: '';

	return (
		<TastingPhaseLayout
			wineType={wineType}
			timerPage="finalConclusion"
			timerDestination={`/tastings/save?wineType=${wineType}`}
			title={phases.finalConclusion}
			description={t.description}
			footer={{
				onBack: () => router.push(`/tastings/palate?wineType=${wineType}`),
				backLabel: t.back,
				nextLabel: t.next,
				onNext: () => router.push(`/tastings/save?wineType=${wineType}`),
			}}
		>
			<div className="fc-layout">
				{/* Before the form in the markup, as on CMS: on narrow screens it shows above it. */}
				<section className={`fc-notes${notesOpen ? ' fc-notes--open' : ''}`} aria-labelledby="fc-notes-title">
					<h2 className="fc-notes__title" id="fc-notes-title">
						{t.analysis}
					</h2>
					<button
						type="button"
						className="fc-notes__toggle"
						aria-expanded={notesOpen}
						aria-controls="fc-notes-full"
						onClick={() => setNotesOpen((open) => !open)}
					>
						{notesOpen ? t.hideNotes : t.showNotes}
						{notesOpen ? (
							<IconChevronUp size={16} aria-hidden="true" />
						) : (
							<IconChevronDown size={16} aria-hidden="true" />
						)}
					</button>
					<div className="fc-notes__full" id="fc-notes-full">
						<Recap label={phases.sight} pairs={sightPairs} />
						<Recap label={phases.nose} pairs={nosePairs} />
						{aromas && (
							<div className="fc-analysis__row">
								<div className="fc-analysis__row-label">{t.aromas}</div>
								<div className="fc-analysis__row-value">{aromas}</div>
							</div>
						)}
						<Recap label={phases.palate} pairs={palatePairs} />
						{flavours && (
							<div className="fc-analysis__row">
								<div className="fc-analysis__row-label">{t.flavours}</div>
								<div className="fc-analysis__row-value">{flavours}</div>
							</div>
						)}
					</div>
				</section>

				<div className="fc-form wset-conclusions">
					<OptionCard
						label={t.quality}
						options={WSET_QUALITY}
						value={final[quality] ?? undefined}
						onChange={(v) => update({ [quality]: v })}
						required
					/>
					<OptionCard
						label={t.readiness}
						options={WSET_READINESS}
						value={final[readiness] ?? undefined}
						onChange={(v) => update({ [readiness]: v })}
						required
					/>
					<div className="tasting-card">
						<label className="tasting-card__label" htmlFor="wset-reasons">
							{t.reasons} <span className="tasting-aside">{t.reasonsHint}</span>
						</label>
						<textarea
							id="wset-reasons"
							className="tasting-textarea"
							rows={3}
							maxLength={200}
							placeholder={t.reasonsPlaceholder}
							value={final[reasons] ?? ''}
							onChange={(e) => update({ [reasons]: e.target.value || null })}
						/>
					</div>

					<div className="wset-group sheet-group">
						<h2 className="section-label">{t.wineItself}</h2>
						<p className="wset-lede">{t.identityLede}</p>
					</div>
					<div className="tasting-grid">
						<ChipSearchField
							id="wset-grape"
							className="fc-field"
							labelClassName="tasting-card__label"
							label={t.grape}
							value={final.grapeVariety}
							onChange={(v) => update({ grapeVariety: v })}
							suggestions={GRAPE_VARIETALS}
							placeholder={t.grapePlaceholder}
							icon={<IconSearch size={14} className="tasting-search-icon" aria-hidden="true" />}
						/>
						<ChipSearchField
							id="wset-country"
							className="fc-field"
							labelClassName="tasting-card__label"
							label={t.country}
							value={final.countryOfOrigin}
							onChange={(v) => update({ countryOfOrigin: v })}
							suggestions={WINE_COUNTRIES}
							labelOf={term}
							placeholder={t.countryPlaceholder}
							icon={<IconMapPin size={14} className="tasting-search-icon" aria-hidden="true" />}
						/>
						<ChipSearchField
							id="wset-region"
							className="fc-field"
							labelClassName="tasting-card__label"
							label={t.region}
							value={final.regionAppellation}
							onChange={(v) => update({ regionAppellation: v })}
							suggestions={WINE_REGIONS}
							placeholder={t.regionPlaceholder}
							icon={<IconMapPin size={14} className="tasting-search-icon" aria-hidden="true" />}
						/>
						<div className="fc-field fc-field--half">
							<label className="tasting-card__label" htmlFor="wset-vintage">
								{t.vintage}
							</label>
							<VintageInput
								id="wset-vintage"
								value={final.vintage ?? ''}
								onChange={(v) => update({ vintage: v })}
							/>
						</div>
					</div>
				</div>
			</div>
		</TastingPhaseLayout>
	);
}
