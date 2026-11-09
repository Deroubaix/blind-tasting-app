'use client';

import { useRouter } from 'next/navigation';
import { useTastingContext } from '../tasting/TastingContext';
import TastingPhaseLayout from '../layout/TastingPhaseLayout';
import { SIGHT_MULTI, SIGHT_SCALES, SIGHT_YES_NO } from './sightFields';
import { type WineColorEntry, wineColors } from './sightData';
import { useLang, useText } from '../../i18n/LanguageProvider';
import { swatchDescPt, tastingText } from '../../i18n/tasting';
import { useTerm } from '../../i18n/useTerm';

export default function SightTastingClient({ wineType }: { wineType: 'red' | 'white' }) {
	const { lang } = useLang();
	const desc = (item: { hex: string; desc: string }) => (lang === 'pt' && swatchDescPt[item.hex]) || item.desc;
	const term = useTerm();
	const router = useRouter();
	const { tastingData, updateTastingData } = useTastingContext();
	const text = useText(tastingText);
	const t = text.sight;

	const selected: Record<string, string | string[]> = tastingData.sight || {};
	const isRed = wineType === 'red';

	const isChosen = (field: string, option: string) => {
		const value = selected[field];
		return Array.isArray(value) ? value.includes(option) : value === option;
	};

	// Single answers replace, and tapping the chosen one again clears it; the multi-select field
	// toggles its option in or out of a list.
	const choose = (field: string, option: string) => {
		if (SIGHT_MULTI.has(field)) {
			const current = Array.isArray(selected[field]) ? (selected[field] as string[]) : [];
			const value = current.includes(option) ? current.filter((o) => o !== option) : [...current, option];
			updateTastingData({ sight: { ...selected, [field]: value } });
			return;
		}
		const { [field]: previous, ...rest } = selected;
		updateTastingData({ sight: previous === option ? rest : { ...rest, [field]: option } });
	};

	const handleNextPhase = () => router.push(`/tastings/nose?wineType=${wineType}`);

	const colors = wineColors[wineType];

	// ─── Sub-renderers ───────────────────────────────────────────────────────────

	const renderOptions = (field: string, options: readonly string[]) => (
		<div className="tasting-options" role="group" aria-label={term(field)}>
			{options.map((opt) => {
				const on = isChosen(field, opt);
				return (
					<button
						key={opt}
						className={`tasting-option${on ? ' tasting-option--selected' : ''}`}
						aria-pressed={on}
						onClick={() => choose(field, opt)}
					>
						{term(opt, field)}
					</button>
				);
			})}
		</div>
	);

	const renderToggle = (field: string) => (
		<div className="sight-toggle-group" role="group" aria-label={term(field)}>
			{SIGHT_YES_NO.map((opt) => {
				const on = isChosen(field, opt);
				return (
					<button
						key={opt}
						className={`tasting-option${on ? ' tasting-option--selected' : ''}`}
						aria-pressed={on}
						onClick={() => choose(field, opt)}
					>
						{term(opt, field)}
					</button>
				);
			})}
		</div>
	);

	// Each swatch carries its own description on desktop. On phone only the chosen ones are
	// spelled out, below the row.
	const renderSwatches = (field: string, items: WineColorEntry[]) => {
		const chosen = items.filter((item) => isChosen(field, item.name));

		return (
			<>
				<div className="sight-swatches" role="group" aria-label={term(field)}>
					{items.map((item) => {
						const on = isChosen(field, item.name);
						return (
							<button
								key={item.name}
								className="sight-swatch-item"
								aria-pressed={on}
								onClick={() => choose(field, item.name)}
							>
								{/* background is dynamic (wine hex value) — only this one inline style */}
								<span
									className={`sight-swatch-rect${on ? ' sight-swatch-rect--selected' : ''}`}
									style={{ backgroundColor: item.hex }}
								/>
								<span className={`sight-swatch-label${on ? ' sight-swatch-label--selected' : ''}`}>
									{term(item.name)}
								</span>
								<span className="sight-swatch-desc">{desc(item)}</span>
							</button>
						);
					})}
				</div>
				{chosen.map((item) => (
					<p key={item.name} className="sight-swatch-chosen">
						<strong>{term(item.name)}</strong> &mdash; {desc(item)}
					</p>
				))}
			</>
		);
	};

	// ─── Markup ───────────────────────────────────────────────────────────────────
	return (
		<TastingPhaseLayout
			wineType={wineType}
			timerPage="sight"
			timerDestination={`/tastings/nose?wineType=${wineType}`}
			title={t.title}
			description={isRed ? t.descRed : t.descWhite}
			footer={{
				onBack: () =>
					router.push(
						tastingData.flight
							? `/flights/${tastingData.flight.code}`
							: `/tastings/start?wineType=${wineType}`,
					),
				backLabel: tastingData.flight ? t.backToFlight : t.backToSetup,
				nextLabel: t.next,
				onNext: handleNextPhase,
			}}
		>
			{/* Three groups in 2024 CMS grid order; Rim Variation and Staining are red only. */}
			<section className="sheet-group" aria-labelledby="sight-clarity">
				<h2 className="section-label" id="sight-clarity">
					{t.groupClarity}
				</h2>
				<div className="tasting-grid tasting-grid--3">
					<div className="tasting-card">
						<div className="tasting-card__label">{term('Clarity / Visible Sediment')}</div>
						{renderOptions('Clarity', SIGHT_SCALES.Clarity)}
					</div>

					<div className="tasting-card tasting-grid__span-2">
						<div className="tasting-card__label">{term('Intensity of Color')}</div>
						{renderOptions('Intensity of Color', SIGHT_SCALES['Intensity of Color'])}
					</div>
				</div>
			</section>

			<section className="sheet-group" aria-labelledby="sight-colour">
				<h2 className="section-label" id="sight-colour">
					{t.groupColour}
				</h2>
				<div className="tasting-grid">
					<div className="tasting-card tasting-card--light">
						<div className="tasting-card__head">
							<div className="tasting-card__label">{term('Primary Color')}</div>
							<span className="sight-sublabel">{t.core}</span>
						</div>
						{renderSwatches('Primary Color', colors.primary)}
					</div>

					<div className="tasting-card tasting-card--light">
						<div className="tasting-card__head">
							<div className="tasting-card__label">{term('Secondary Color(s)')}</div>
							<span className="sight-sublabel">{t.selectAll}</span>
						</div>
						{renderSwatches('Secondary Color(s)', colors.secondary)}
					</div>
				</div>
			</section>

			<section className="sheet-group" aria-labelledby="sight-glass">
				<h2 className="section-label" id="sight-glass">
					{t.groupGlass}
				</h2>
				<div className="tasting-grid tasting-grid--3">
					{isRed && (
						<>
							<div className="tasting-card">
								<div className="tasting-card__label">{term('Rim Variation')}</div>
								{renderToggle('Rim Variation')}
							</div>

							<div className="tasting-card tasting-grid__span-2">
								<div className="tasting-card__label">{term('Staining')}</div>
								{renderOptions('Staining', SIGHT_SCALES.Staining)}
							</div>
						</>
					)}

					<div className="tasting-card tasting-grid__span-2">
						<div className="tasting-card__label">{term('Tearing')}</div>
						{renderOptions('Tearing', SIGHT_SCALES.Tearing)}
					</div>

					<div className="tasting-card">
						<div className="tasting-card__label">{term('Gas Evidence')}</div>
						{renderToggle('Gas Evidence')}
					</div>
				</div>
			</section>
		</TastingPhaseLayout>
	);
}
