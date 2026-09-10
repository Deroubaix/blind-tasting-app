'use client';

import { useRouter } from 'next/navigation';
import { Fragment, useState } from 'react';
import { IconSearch, IconMapPin, IconCalendar } from '@tabler/icons-react';
import { useTastingContext } from '../tasting/TastingContext';
import TastingPhaseLayout from '../layout/TastingPhaseLayout';
import TastingAutocomplete from './TastingAutocomplete';
import TastingCustomSelect from './TastingCustomSelect';
import { GRAPE_VARIETALS, WINE_COUNTRIES, WINE_REGIONS } from './autocompleteData';
import { SIGHT_MAIN_FIELDS, SIGHT_EVIDENCE_LABELS, SIGHT_EVIDENCE_ABSENT } from '../sight/sightFields';
import { NOSE_ASSESSMENTS } from '../nose/noseFields';
import { fcAnsweredCount, FC_REQUIRED } from './conclusionFields';

const qualityTiers = ['Regional', 'Village', 'Premier Cru', 'Grand Cru', 'Single Vineyard', 'Estate'];

// Values like "Medium (-)" or "High" mean nothing alone, so the attribute they answer
// travels with them — flattened, five "Medium (-)" in a row name neither acid nor tannin.
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

	// The five committed answers write straight through to the shared context. Local state would
	// be lost when the phase timer expires — TimerWrapper navigates with a bare `router.push`,
	// so nothing gets a chance to flush. Only the autocomplete text boxes stay local.
	const fc = tastingData.conclusion?.final ?? {};
	const grapeVariety = fc['grapeVariety'] ?? '';
	const countryOfOrigin = fc['countryOfOrigin'] ?? '';
	const regionAppellation = fc['regionAppellation'] ?? '';
	const qualityLevel = fc['qualityLevel'] ?? '';
	const vintage = fc['vintage'] ?? '';

	const [grapeInput, setGrapeInput] = useState('');
	const [countryInput, setCountryInput] = useState('');
	const [regionInput, setRegionInput] = useState('');

	const updateFC = (patch: Record<string, string | null>) =>
		updateTastingData({ conclusion: { ...tastingData.conclusion, final: { ...fc, ...patch } } });

	const setGrapeVariety = (v: string) => updateFC({ grapeVariety: v });
	const setCountryOfOrigin = (v: string) => updateFC({ countryOfOrigin: v });
	const setRegionAppellation = (v: string) => updateFC({ regionAppellation: v });
	const setQualityLevel = (v: string) => updateFC({ qualityLevel: v });
	const setVintage = (v: string) => updateFC({ vintage: v });

	// Summaries of prior phases. Each keeps its attribute name; only self-describing
	// lists (aroma descriptors, countries) go flat.
	const sight = tastingData.sight ?? {};
	const sightPairs = SIGHT_MAIN_FIELDS.filter((f) => sight[f]).map((f) => [f, sight[f]] as [string, string]);

	// A recap lists what was found; "No" answers are the default state, so they collapse to one line.
	const evidenceFound = Object.entries(SIGHT_EVIDENCE_LABELS)
		.filter(([key]) => sight[key] && !SIGHT_EVIDENCE_ABSENT.includes(sight[key]))
		.map(([, label]) => label)
		.join(' · ');
	const evidenceAnswered = Object.keys(SIGHT_EVIDENCE_LABELS).some((key) => sight[key]);
	const evidenceSummary = evidenceFound || (evidenceAnswered ? 'None noted' : '');

	// Nose splits two ways: assessments are ambiguous without their attribute, descriptors are not.
	const nose = tastingData.nose ?? {};
	const nosePairs = Object.entries(nose)
		.filter(([key, values]) => NOSE_ASSESSMENTS.has(key) && values?.length)
		.map(([key, values]) => [key, values.join(' · ')] as [string, string]);
	const noseDescriptors = Object.entries(nose)
		.filter(([key, values]) => !NOSE_ASSESSMENTS.has(key) && values?.length)
		.flatMap(([, values]) => values)
		.join(' · ');

	const palatePairs = Object.entries(tastingData.palate ?? {})
		.filter(([, value]) => Boolean(value))
		.map(([key, value]) => [key, value] as [string, string]);

	const initial = tastingData.conclusion?.initial;
	const initialPairs = (
		[
			['World Origin', initial?.worldOrigin],
			['Climate', initial?.climate],
			['Age Range', initial?.ageRange],
			['Grape Varieties', (initial?.grapeVarieties ?? []).join(' · ')],
		] as [string, string | null | undefined][]
	)
		.filter(([, value]) => Boolean(value))
		.map(([key, value]) => [key, value as string] as [string, string]);
	const possibleOriginSummary = (initial?.possibleCountries ?? []).join(' · ');
	const finalIdentity = [vintage, grapeVariety, qualityLevel, countryOfOrigin].filter(Boolean).join(' · ');

	const conclusionPct = Math.round((fcAnsweredCount(fc) / FC_REQUIRED.length) * 100);

	// No flush needed before navigating — the answers are already in the context.
	const handleNext = () => router.push(`/tastings/save?wineType=${wineType}`);
	const handleBack = () => router.push(`/tastings/initial-conclusion?wineType=${wineType}`);

	const confirm = (input: string, setter: (v: string) => void, inputSetter: (v: string) => void) => {
		const v = input.trim();
		if (v) {
			setter(v);
		}
		inputSetter('');
	};

	return (
		<TastingPhaseLayout
			wineType={wineType}
			progress={conclusionPct}
			timerPage="finalConclusion"
			timerDestination={`/tastings/save?wineType=${wineType}`}
			phase="Phase 05"
			title="Final Conclusion"
			description="Commit to a single, specific identification — grape variety, country, region, quality level, and vintage."
			footer={{
				onBack: handleBack,
				backLabel: 'Back to Initial Conclusion',
				nextLabel: 'Review & Save',
				onNext: handleNext,
			}}
		>
			<div className="fc-layout">
				{/* ── Left: what you recorded ── */}
				<div className="fc-analysis">
					<div className="fc-analysis__header">
						<span className="section-label">Your Analysis</span>
						<span className="fc-analysis__subtitle">What you recorded</span>
					</div>

					<AnalysisPairs label="Color & Sight" pairs={sightPairs} />
					<AnalysisRow label="Physical Evidence" value={evidenceSummary} />
					<AnalysisPairs label="Nose" pairs={nosePairs} />
					<AnalysisRow label="Aroma Descriptors" value={noseDescriptors} />
					<AnalysisPairs label="Palate Structure" pairs={palatePairs} />
					<AnalysisPairs label="Initial Call" pairs={initialPairs} />
					<AnalysisRow label="Possible Origin" value={possibleOriginSummary} />

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

				{/* ── Right: form ── */}
				<div className="fc-right">
					<div className="fc-grid">
						{/* Grape Variety/Blend */}
						<div className="fc-field">
							<label className="tasting-card__label">Grape Variety / Blend</label>
							<div className="tasting-search-row">
								<TastingAutocomplete
									suggestions={GRAPE_VARIETALS}
									value={grapeInput}
									onChange={setGrapeInput}
									onConfirm={(v) => confirm(v, setGrapeVariety, setGrapeInput)}
									placeholder="e.g., Pinot Noir"
									icon={<IconSearch size={14} className="tasting-search-icon" />}
								/>
								<button
									className="tasting-confirm-btn"
									aria-label="Add grape variety"
									onClick={() => confirm(grapeInput, setGrapeVariety, setGrapeInput)}
								>
									Add
								</button>
							</div>
							{grapeVariety && (
								<div className="tasting-chips">
									<span className="tasting-chip">
										{grapeVariety}
										<button className="tasting-chip__remove" onClick={() => setGrapeVariety('')}>
											×
										</button>
									</span>
								</div>
							)}
						</div>

						{/* Country of Origin */}
						<div className="fc-field">
							<label className="tasting-card__label">Country of Origin</label>
							<div className="tasting-search-row">
								<TastingAutocomplete
									suggestions={WINE_COUNTRIES}
									value={countryInput}
									onChange={setCountryInput}
									onConfirm={(v) => confirm(v, setCountryOfOrigin, setCountryInput)}
									placeholder="e.g., France"
									icon={<IconMapPin size={14} className="tasting-search-icon" />}
								/>
								<button
									className="tasting-confirm-btn"
									aria-label="Add country of origin"
									onClick={() => confirm(countryInput, setCountryOfOrigin, setCountryInput)}
								>
									Add
								</button>
							</div>
							{countryOfOrigin && (
								<div className="tasting-chips">
									<span className="tasting-chip">
										{countryOfOrigin}
										<button className="tasting-chip__remove" onClick={() => setCountryOfOrigin('')}>
											×
										</button>
									</span>
								</div>
							)}
						</div>

						{/* Region/Appellation */}
						<div className="fc-field">
							<label className="tasting-card__label">Region / Appellation</label>
							<div className="tasting-search-row">
								<TastingAutocomplete
									suggestions={WINE_REGIONS}
									value={regionInput}
									onChange={setRegionInput}
									onConfirm={(v) => confirm(v, setRegionAppellation, setRegionInput)}
									placeholder="e.g., Burgundy — Côte de Nuits"
									icon={<IconMapPin size={14} className="tasting-search-icon" />}
								/>
								<button
									className="tasting-confirm-btn"
									aria-label="Add region or appellation"
									onClick={() => confirm(regionInput, setRegionAppellation, setRegionInput)}
								>
									Add
								</button>
							</div>
							{regionAppellation && (
								<div className="tasting-chips">
									<span className="tasting-chip">
										{regionAppellation}
										<button
											className="tasting-chip__remove"
											onClick={() => setRegionAppellation('')}
										>
											×
										</button>
									</span>
								</div>
							)}
						</div>

						{/* Quality Level */}
						<div className="fc-field">
							<label className="tasting-card__label">Quality Level</label>
							<TastingCustomSelect
								options={qualityTiers}
								value={qualityLevel}
								onChange={setQualityLevel}
								placeholder="Select quality tier…"
							/>
						</div>

						{/* Vintage */}
						<div className="fc-field fc-field--half">
							<label className="tasting-card__label">Vintage</label>
							<div className="tasting-search-row">
								<div className="tasting-search-input-wrap">
									<IconCalendar size={14} className="tasting-search-icon" />
									<input
										className="tasting-search-input"
										placeholder="Enter the harvest year"
										maxLength={4}
										value={vintage}
										onChange={(e) => setVintage(e.target.value.replace(/\D/g, ''))}
										onBlur={() => {
											if (!vintage) {
												return;
											}
											const year = parseInt(vintage, 10);
											const max = new Date().getFullYear();
											if (year < 1900) {
												setVintage('1900');
											} else if (year > max) {
												setVintage(String(max));
											}
										}}
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</TastingPhaseLayout>
	);
}
