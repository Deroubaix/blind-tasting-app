'use client';

import { useRouter } from 'next/navigation';
import { useTastingContext } from '../tasting/TastingContext';
import TastingPhaseLayout from '../layout/TastingPhaseLayout';
import { OptionCard, backToSetup } from './WsetBits';
import {
	WSET_APPEARANCE,
	WSET_APPEARANCE_FIELDS,
	WSET_COLOUR,
	WSET_COLOUR_HEX,
	WSET_OBSERVATIONS,
	WSET_OBSERVATIONS_KEY,
} from './wsetFields';

export default function WsetAppearanceClient({ wineType }: { wineType: 'red' | 'white' }) {
	const router = useRouter();
	const { tastingData, updateTastingData } = useTastingContext();
	const sight = tastingData.sight ?? {};

	const set = (field: string, value: string | null) => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { [field]: _previous, ...rest } = sight;
		updateTastingData({ sight: value === null ? rest : { ...rest, [field]: value } });
	};

	const observations = Array.isArray(sight[WSET_OBSERVATIONS_KEY]) ? (sight[WSET_OBSERVATIONS_KEY] as string[]) : [];
	const toggleObservation = (option: string) => {
		const next = observations.includes(option)
			? observations.filter((o) => o !== option)
			: [...observations, option];
		updateTastingData({ sight: { ...sight, [WSET_OBSERVATIONS_KEY]: next } });
	};

	const answered = WSET_APPEARANCE_FIELDS.filter((field) => sight[field]).length;
	const pct = Math.round((answered / WSET_APPEARANCE_FIELDS.length) * 100);
	const back = backToSetup(tastingData.flight, wineType);

	return (
		<TastingPhaseLayout
			wineType={wineType}
			progress={pct}
			timerPage="sight"
			timerDestination={`/tastings/nose?wineType=${wineType}`}
			phase="Phase 01"
			title="Appearance"
			description="Tilt the glass against a white background. Clarity and intensity first, then the colour, then anything else you notice."
			footer={{
				onBack: () => router.push(back.href),
				backLabel: back.label,
				nextLabel: 'Next: The Nose',
				onNext: () => router.push(`/tastings/nose?wineType=${wineType}`),
			}}
		>
			<div className="wset-grid wset-grid--two">
				<OptionCard
					label="Clarity"
					options={WSET_APPEARANCE.Clarity}
					value={sight.Clarity as string | undefined}
					onChange={(v) => set('Clarity', v)}
					equalWidth
				/>
				<OptionCard
					label="Intensity"
					options={WSET_APPEARANCE.Intensity}
					value={sight.Intensity as string | undefined}
					onChange={(v) => set('Intensity', v)}
					equalWidth
				/>
			</div>
			<OptionCard
				label="Colour"
				options={WSET_COLOUR[wineType]}
				value={sight.Colour as string | undefined}
				onChange={(v) => set('Colour', v)}
				swatches={WSET_COLOUR_HEX}
			/>
			<div className="tasting-card">
				<div className="tasting-card__label">
					{WSET_OBSERVATIONS_KEY} <span className="wset-optional">if apparent</span>
				</div>
				<div className="tasting-options" role="group" aria-label={WSET_OBSERVATIONS_KEY}>
					{WSET_OBSERVATIONS.map((option) => {
						const on = observations.includes(option);
						return (
							<button
								key={option}
								className={`tasting-option tasting-option--pill${on ? ' tasting-option--selected' : ''}`}
								aria-pressed={on}
								onClick={() => toggleObservation(option)}
							>
								{option}
							</button>
						);
					})}
				</div>
			</div>
		</TastingPhaseLayout>
	);
}
