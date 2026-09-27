'use client';

import { useRouter } from 'next/navigation';
import { Fragment } from 'react';
import { IconSearch, IconMapPin } from '@tabler/icons-react';
import { useTastingContext } from '../tasting/TastingContext';
import TastingPhaseLayout from '../layout/TastingPhaseLayout';
import { ChipSearchField, VintageInput } from './ConclusionInputs';
import TastingCustomSelect from './TastingCustomSelect';
import { GRAPE_VARIETALS, WINE_COUNTRIES, WINE_REGIONS } from './autocompleteData';
import { sightFields } from '../sight/sightFields';
import { NOSE_ASSESSMENTS } from '../nose/noseFields';
import { BALANCE_NOTE, CONFIRM_ROWS, PALATE_OPTIONS, confirmKey } from '../palate/palateFields';
import { fcAnsweredCount, FC_REQUIRED, STYLE_CATEGORIES } from './conclusionFields';
import QualityLevelSelect from './QualityLevelSelect';

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
			['Possible Grape Varieties', (initial?.grapeVarieties ?? []).join(' · ')],
			['Climate', initial?.climate],
			['Age Range', initial?.ageRange],
		] as [string, string | null | undefined][]
	)
		.filter(([, value]) => Boolean(value))
		.map(([key, value]) => [key, value as string] as [string, string]);
	const possibleOriginSummary = (initial?.possibleCountries ?? []).join(' · ');
	const finalIdentity = [vintage, grapeVariety, qualityLevel, styleCategory, countryOfOrigin]
		.filter(Boolean)
		.join(' · ');

	const conclusionPct = Math.round((fcAnsweredCount(fc) / FC_REQUIRED.length) * 100);

	// No flush needed before navigating — the answers are already in the context.
	const handleNext = () => router.push(`/tastings/save?wineType=${wineType}`);
	const handleBack = () => router.push(`/tastings/initial-conclusion?wineType=${wineType}`);

	return (
		<TastingPhaseLayout
			wineType={wineType}
			progress={conclusionPct}
			timerPage="finalConclusion"
			timerDestination={`/tastings/save?wineType=${wineType}`}
			phase="Phase 05"
			title="Final Conclusion"
			description="Commit to a single, specific identification — grape variety or blend, country, region and appellation, and vintage. Add quality level and style where appropriate."
			footer={{
				onBack: handleBack,
				backLabel: 'Back to Initial Conclusion',
				nextLabel: 'Review & Save',
				onNext: handleNext,
			}}
		>
			<div className="fc-layout">
				{/* ── Left: the declaration ── */}
				<div className="fc-form">
					<div className="fc-grid">
						<ChipSearchField
							id="fc-grape"
							className="fc-field"
							labelClassName="tasting-card__label"
							label="Grape Variety or Blend"
							value={grapeVariety}
							onChange={(v) => updateFC({ grapeVariety: v })}
							suggestions={GRAPE_VARIETALS}
							placeholder="e.g. Pinot Noir"
							icon={<IconSearch size={14} className="tasting-search-icon" aria-hidden="true" />}
						/>
						<ChipSearchField
							id="fc-country"
							className="fc-field"
							labelClassName="tasting-card__label"
							label="Country of Origin"
							value={countryOfOrigin}
							onChange={(v) => updateFC({ countryOfOrigin: v })}
							suggestions={WINE_COUNTRIES}
							placeholder="e.g. France"
							icon={<IconMapPin size={14} className="tasting-search-icon" aria-hidden="true" />}
						/>
						<ChipSearchField
							id="fc-region"
							className="fc-field"
							labelClassName="tasting-card__label"
							label="Region and Appellation"
							value={regionAppellation}
							onChange={(v) => updateFC({ regionAppellation: v })}
							suggestions={WINE_REGIONS}
							placeholder="e.g. Burgundy — Côte de Nuits"
							icon={<IconMapPin size={14} className="tasting-search-icon" aria-hidden="true" />}
						/>

						{/* Quality level and style category are "where appropriate" on the grid, so each
						    can be left blank or cleared, and neither counts toward completion. */}
						<div className="fc-field">
							<span className="tasting-card__label" id="fc-quality-label">
								Official Quality Level
							</span>
							<QualityLevelSelect
								labelId="fc-quality-label"
								value={qualityLevel}
								onChange={setQualityLevel}
							/>
						</div>

						<div className="fc-field">
							<span className="tasting-card__label" id="fc-style-label">
								Official Style Category
							</span>
							<TastingCustomSelect
								options={STYLE_CATEGORIES}
								labelId="fc-style-label"
								value={styleCategory}
								onChange={setStyleCategory}
								placeholder="Where appropriate…"
								clearLabel="Not applicable"
							/>
						</div>

						<div className="fc-field fc-field--half">
							<label className="tasting-card__label" htmlFor="fc-vintage">
								Vintage
							</label>
							<VintageInput id="fc-vintage" value={vintage} onChange={(v) => updateFC({ vintage: v })} />
						</div>
					</div>
				</div>
				{/* ── Right: what you recorded. A reference, so it scrolls on its own ── */}
				<div className="fc-analysis">
					<div className="fc-analysis__header">
						<span className="section-label">Your Analysis</span>
						<span className="fc-analysis__subtitle">What you recorded</span>
					</div>

					<AnalysisPairs label="Sight" pairs={sightPairs} />
					<AnalysisPairs label="Nose" pairs={nosePairs} />
					<AnalysisRow label="Aroma Descriptors" value={noseDescriptors} />
					<AnalysisPairs label="Palate Structure" pairs={palatePairs} />
					<AnalysisPairs label="Initial Call" pairs={initialPairs} />
					<AnalysisRow label="Possible Countries" value={possibleOriginSummary} />

					{finalIdentity && (
						<>
							<div className="fc-analysis__divider" />
							<div className="fc-analysis__row">
								<div className="fc-analysis__row-label">Final Identity</div>
								<div className="fc-analysis__row-value fc-analysis__row-value--identity">
									{finalIdentity}
								</div>
							</div>
						</>
					)}
				</div>
			</div>
		</TastingPhaseLayout>
	);
}
