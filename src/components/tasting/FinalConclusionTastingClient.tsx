'use client';

import { useRouter } from 'next/navigation';
import { Fragment, useState } from 'react';
import { IconChevronDown, IconChevronUp, IconMapPin, IconSearch } from '@tabler/icons-react';
import { useTastingContext } from '../tasting/TastingContext';
import TastingPhaseLayout from '../layout/TastingPhaseLayout';
import { ChipSearchField, VintageInput } from './ConclusionInputs';
import TastingCustomSelect from './TastingCustomSelect';
import { GRAPE_VARIETALS, WINE_COUNTRIES, WINE_REGIONS } from './autocompleteData';
import { sightFields } from '../sight/sightFields';
import { NOSE_ASSESSMENTS } from '../nose/noseFields';
import { BALANCE_NOTE, CONFIRM_ROWS, PALATE_OPTIONS, confirmKey } from '../palate/palateFields';
import { STYLE_CATEGORIES } from './conclusionFields';
import QualityLevelSelect from './QualityLevelSelect';
import { useText } from '../../i18n/LanguageProvider';
import { commonText } from '../../i18n/common';
import { tastingText } from '../../i18n/tasting';

// Values like "Medium−" or "High" mean nothing alone, so the attribute they answer
// travels with them — flattened, five "Medium−" in a row name neither acid nor tannin.
function AnalysisPairs({ label, pairs }: { label: string; pairs: [string, string][] }) {
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

// For self-describing values only — aroma descriptors, country names.
function AnalysisRow({ label, value }: { label: string; value: string }) {
	if (!value) {
		return null;
	}
	return (
		<div className="fc-analysis__row">
			<div className="fc-analysis__row-label">{label}</div>
			<div className="fc-analysis__row-value">{value}</div>
		</div>
	);
}

export default function FinalConclusionTastingClient({ wineType }: { wineType: 'red' | 'white' }) {
	const router = useRouter();
	const { tastingData, updateTastingData } = useTastingContext();
	const text = useText(tastingText);
	const t = text.final;
	const phaseName = useText(commonText).phase.cms;
	// Closed by default where it stacks above the form; beside the form it is always open.
	const [notesOpen, setNotesOpen] = useState(false);

	// The committed answers write straight through to the shared context. Local state would
	// be lost when the phase timer expires. Only the search boxes' typing stays local.
	const fc = tastingData.conclusion?.final ?? {};
	const grapeVariety = fc['grapeVariety'] ?? '';
	const countryOfOrigin = fc['countryOfOrigin'] ?? '';
	const regionAppellation = fc['regionAppellation'] ?? '';
	const qualityLevel = fc['qualityLevel'] ?? '';
	const styleCategory = fc['styleCategory'] ?? '';
	const vintage = fc['vintage'] ?? '';

	const updateFC = (patch: Record<string, string | null>) =>
		updateTastingData({ conclusion: { ...tastingData.conclusion, final: { ...fc, ...patch } } });

	const setQualityLevel = (v: string) => updateFC({ qualityLevel: v });
	const setStyleCategory = (v: string) => updateFC({ styleCategory: v });

	// Summaries of prior phases. Each keeps its attribute name; only self-describing
	// lists (aroma descriptors, countries) go flat.
	const sight = tastingData.sight ?? {};
	const sightPairs = sightFields(wineType)
		.map((f) => [f, Array.isArray(sight[f]) ? (sight[f] as string[]).join(' · ') : sight[f]])
		.filter(([, value]) => Boolean(value)) as [string, string][];

	// Nose splits two ways: assessments are ambiguous without their attribute, descriptors are not.
	const nose = tastingData.nose ?? {};
	const nosePairs = Object.entries(nose)
		.filter(([key, values]) => NOSE_ASSESSMENTS.has(key) && values?.length)
		.map(([key, values]) => [key, values.join(' · ')] as [string, string]);
	const noseDescriptors = Object.entries(nose)
		.filter(([key, values]) => !NOSE_ASSESSMENTS.has(key) && values?.length)
		.flatMap(([, values]) => values)
		.join(' · ');

	// Grid order, not tap order.
	const palate = tastingData.palate ?? {};
	const palatePairs = [...Object.keys(PALATE_OPTIONS[wineType]), BALANCE_NOTE, ...CONFIRM_ROWS.map(confirmKey)]
		.filter((key) => Boolean(palate[key]))
		.map((key) => [key, palate[key]] as [string, string]);

	const initial = tastingData.conclusion?.initial;
	const initialPairs = (
		[
			[text.initial.grapes, (initial?.grapeVarieties ?? []).join(' · ')],
			[text.initial.climate, initial?.climate],
			[text.initial.ageRange, initial?.ageRange],
		] as [string, string | null | undefined][]
	)
		.filter(([, value]) => Boolean(value))
		.map(([key, value]) => [key, value as string] as [string, string]);
	const possibleOriginSummary = (initial?.possibleCountries ?? []).join(' · ');
	const initialLine = [
		(initial?.grapeVarieties ?? []).join(' / '),
		initial?.climate,
		possibleOriginSummary,
		initial?.ageRange,
	]
		.filter(Boolean)
		.join(' · ');
	const finalIdentity = [vintage, grapeVariety, qualityLevel, styleCategory, countryOfOrigin]
		.filter(Boolean)
		.join(' · ');

	// No flush needed before navigating — the answers are already in the context.
	const handleNext = () => router.push(`/tastings/save?wineType=${wineType}`);
	const handleBack = () => router.push(`/tastings/initial-conclusion?wineType=${wineType}`);

	return (
		<TastingPhaseLayout
			wineType={wineType}
			timerPage="finalConclusion"
			timerDestination={`/tastings/save?wineType=${wineType}`}
			title={phaseName.finalConclusion}
			description={t.description}
			footer={{
				onBack: handleBack,
				backLabel: t.back,
				nextLabel: t.next,
				onNext: handleNext,
			}}
		>
			<div className="fc-layout">
				{/* What you recorded: a reference beside the form, a closable summary above it when narrow. */}
				<section className={`fc-notes${notesOpen ? ' fc-notes--open' : ''}`} aria-labelledby="fc-notes-title">
					<h2 className="fc-notes__title" id="fc-notes-title">
						{t.yourAnalysis}
					</h2>
					{initialLine && (
						<p className="fc-notes__one">
							<span>{t.initialCall}:</span> {initialLine}
						</p>
					)}
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
						<AnalysisPairs label={phaseName.sight} pairs={sightPairs} />
						<AnalysisPairs label={phaseName.nose} pairs={nosePairs} />
						<AnalysisRow label={t.aromaDescriptors} value={noseDescriptors} />
						<AnalysisPairs label={t.palateStructure} pairs={palatePairs} />
						<AnalysisPairs label={t.initialCall} pairs={initialPairs} />
						<AnalysisRow label={text.initial.countries} value={possibleOriginSummary} />

						{finalIdentity && (
							<>
								<div className="fc-analysis__divider" />
								<div className="fc-analysis__row">
									<div className="fc-analysis__row-label">{t.finalIdentity}</div>
									<div className="fc-analysis__row-value fc-analysis__row-value--identity">
										{finalIdentity}
									</div>
								</div>
							</>
						)}
					</div>
				</section>

				<div className="fc-form">
					<div className="tasting-grid">
						<ChipSearchField
							id="fc-grape"
							className="fc-field"
							labelClassName="tasting-card__label"
							label={t.grape}
							value={grapeVariety}
							onChange={(v) => updateFC({ grapeVariety: v })}
							suggestions={GRAPE_VARIETALS}
							placeholder={t.grapePlaceholder}
							icon={<IconSearch size={14} className="tasting-search-icon" aria-hidden="true" />}
						/>
						<ChipSearchField
							id="fc-country"
							className="fc-field"
							labelClassName="tasting-card__label"
							label={t.country}
							value={countryOfOrigin}
							onChange={(v) => updateFC({ countryOfOrigin: v })}
							suggestions={WINE_COUNTRIES}
							placeholder={t.countryPlaceholder}
							icon={<IconMapPin size={14} className="tasting-search-icon" aria-hidden="true" />}
						/>
						<ChipSearchField
							id="fc-region"
							className="fc-field"
							labelClassName="tasting-card__label"
							label={t.region}
							value={regionAppellation}
							onChange={(v) => updateFC({ regionAppellation: v })}
							suggestions={WINE_REGIONS}
							placeholder={t.regionPlaceholder}
							icon={<IconMapPin size={14} className="tasting-search-icon" aria-hidden="true" />}
						/>

						{/* Quality level and style category are "where appropriate" on the grid, so each
						    can be left blank or cleared, and neither counts toward completion. */}
						<div className="fc-field">
							<span className="tasting-card__label" id="fc-quality-label">
								{t.qualityLevel}
							</span>
							<QualityLevelSelect
								labelId="fc-quality-label"
								value={qualityLevel}
								onChange={setQualityLevel}
							/>
						</div>

						<div className="fc-field">
							<span className="tasting-card__label" id="fc-style-label">
								{t.styleCategory}
							</span>
							<TastingCustomSelect
								options={STYLE_CATEGORIES}
								labelId="fc-style-label"
								value={styleCategory}
								onChange={setStyleCategory}
								placeholder={text.inputs.whereAppropriate}
								clearLabel={text.inputs.notApplicable}
							/>
						</div>

						<div className="fc-field fc-field--half">
							<label className="tasting-card__label" htmlFor="fc-vintage">
								{t.vintage}
							</label>
							<VintageInput id="fc-vintage" value={vintage} onChange={(v) => updateFC({ vintage: v })} />
						</div>
					</div>
				</div>
			</div>
		</TastingPhaseLayout>
	);
}
