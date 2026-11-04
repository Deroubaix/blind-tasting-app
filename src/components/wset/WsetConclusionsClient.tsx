'use client';

import { useRouter } from 'next/navigation';
import { Fragment } from 'react';
import { IconMapPin, IconSearch } from '@tabler/icons-react';
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
	const { tastingData, updateTastingData } = useTastingContext();
	const final = tastingData.conclusion?.final ?? {};
	const { quality, readiness, reasons } = WSET_CONCLUSION_KEYS;

	const update = (patch: Record<string, string | null>) =>
		updateTastingData({ conclusion: { ...tastingData.conclusion, final: { ...final, ...patch } } });

	const answered = [final[quality], final[readiness]].filter(Boolean).length;
	const pct = Math.round((answered / 2) * 100);

	const sight = tastingData.sight ?? {};
	const sightPairs = WSET_APPEARANCE_FIELDS.filter((f) => sight[f]).map(
		(f) => [f, sight[f] as string] as [string, string],
	);
	const nose = tastingData.nose ?? {};
	const nosePairs = Object.keys(WSET_NOSE_ASSESSMENTS)
		.filter((key) => nose[key]?.length)
		.map((key) => [key, nose[key].join(' · ')] as [string, string]);
	const aromas = Object.entries(nose)
		.filter(([key, values]) => !(key in WSET_NOSE_ASSESSMENTS) && values?.length)
		.flatMap(([, values]) => values)
		.join(' · ');
	const palate = tastingData.palate ?? {};
	const palatePairs = Object.keys(WSET_PALATE[wineType])
		.filter((key) => palate[key])
		.map((key) => [key, palate[key] as string] as [string, string]);
	const flavours = Array.isArray(palate[WSET_FLAVOUR_KEY]) ? (palate[WSET_FLAVOUR_KEY] as string[]).join(' · ') : '';

	return (
		<TastingPhaseLayout
			wineType={wineType}
			progress={pct}
			timerPage="finalConclusion"
			timerDestination={`/tastings/save?wineType=${wineType}`}
			phase="Phase 04"
			title="Conclusions"
			description="Judge the quality on balance, length, intensity and complexity, and say whether the wine is ready. Give your reasons; the examiner marks those too."
			footer={{
				onBack: () => router.push(`/tastings/palate?wineType=${wineType}`),
				backLabel: 'Back to Palate',
				nextLabel: 'Review & Save',
				onNext: () => router.push(`/tastings/save?wineType=${wineType}`),
			}}
		>
			<div className="fc-layout">
				<div className="fc-form wset-conclusions">
					<OptionCard
						label="Quality level"
						options={WSET_QUALITY}
						value={final[quality] ?? undefined}
						onChange={(v) => update({ [quality]: v })}
						required
					/>
					<OptionCard
						label="Readiness for drinking"
						options={WSET_READINESS}
						value={final[readiness] ?? undefined}
						onChange={(v) => update({ [readiness]: v })}
						required
					/>
					<div className="tasting-card">
						<label className="tasting-card__label" htmlFor="wset-reasons">
							Reasons <span className="wset-optional">balance · length · intensity · complexity</span>
						</label>
						<textarea
							id="wset-reasons"
							className="tasting-textarea"
							rows={3}
							maxLength={200}
							placeholder="e.g. High acidity balances the sugar; long finish; pronounced, complex nose with tertiary notes…"
							value={final[reasons] ?? ''}
							onChange={(e) => update({ [reasons]: e.target.value || null })}
						/>
					</div>

					<div className="wset-group">
						<div className="nose-section-divider">
							<span className="section-label">The wine itself</span>
						</div>
						<p className="wset-lede">
							Optional. Not asked at Level 3, but good practice, and scored when the reveal names the
							wine.
						</p>
					</div>
					<div className="fc-grid">
						<ChipSearchField
							id="wset-grape"
							className="fc-field"
							labelClassName="tasting-card__label"
							label="Grape Variety or Blend"
							value={final.grapeVariety}
							onChange={(v) => update({ grapeVariety: v })}
							suggestions={GRAPE_VARIETALS}
							placeholder="e.g. Riesling"
							icon={<IconSearch size={14} className="tasting-search-icon" aria-hidden="true" />}
						/>
						<ChipSearchField
							id="wset-country"
							className="fc-field"
							labelClassName="tasting-card__label"
							label="Country of Origin"
							value={final.countryOfOrigin}
							onChange={(v) => update({ countryOfOrigin: v })}
							suggestions={WINE_COUNTRIES}
							placeholder="e.g. Germany"
							icon={<IconMapPin size={14} className="tasting-search-icon" aria-hidden="true" />}
						/>
						<ChipSearchField
							id="wset-region"
							className="fc-field"
							labelClassName="tasting-card__label"
							label="Region and Appellation"
							value={final.regionAppellation}
							onChange={(v) => update({ regionAppellation: v })}
							suggestions={WINE_REGIONS}
							placeholder="e.g. Mosel"
							icon={<IconMapPin size={14} className="tasting-search-icon" aria-hidden="true" />}
						/>
						<div className="fc-field fc-field--half">
							<label className="tasting-card__label" htmlFor="wset-vintage">
								Vintage
							</label>
							<VintageInput
								id="wset-vintage"
								value={final.vintage ?? ''}
								onChange={(v) => update({ vintage: v })}
							/>
						</div>
					</div>
				</div>

				<div className="fc-analysis">
					<div className="fc-analysis__header">
						<span className="section-label">Your Analysis</span>
						<span className="fc-analysis__subtitle">What you recorded</span>
					</div>
					<Recap label="Appearance" pairs={sightPairs} />
					<Recap label="Nose" pairs={nosePairs} />
					{aromas && (
						<div className="fc-analysis__row">
							<div className="fc-analysis__row-label">Aromas</div>
							<div className="fc-analysis__row-value">{aromas}</div>
						</div>
					)}
					<Recap label="Palate" pairs={palatePairs} />
					{flavours && (
						<div className="fc-analysis__row">
							<div className="fc-analysis__row-label">Flavours</div>
							<div className="fc-analysis__row-value">{flavours}</div>
						</div>
					)}
				</div>
			</div>
		</TastingPhaseLayout>
	);
}
