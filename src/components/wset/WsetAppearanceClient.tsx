'use client';

import { useRouter } from 'next/navigation';
import { commonText } from '../../i18n/common';
import { useText } from '../../i18n/LanguageProvider';
import { wsetText } from '../../i18n/wset';
import { useTastingContext } from '../tasting/TastingContext';
import TastingPhaseLayout from '../layout/TastingPhaseLayout';
import { OptionCard, backToSetup } from './WsetBits';
import { WSET_APPEARANCE, WSET_COLOUR, WSET_COLOUR_HEX, WSET_OBSERVATIONS, WSET_OBSERVATIONS_KEY } from './wsetFields';

export default function WsetAppearanceClient({ wineType }: { wineType: 'red' | 'white' }) {
	const router = useRouter();
	const all = useText(wsetText);
	const t = all.appearance;
	const tc = useText(commonText);
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

	const back = backToSetup(tastingData.flight, wineType, all.bits);

	return (
		<TastingPhaseLayout
			wineType={wineType}
			timerPage="sight"
			timerDestination={`/tastings/nose?wineType=${wineType}`}
			title={tc.phase.wset.sight}
			description={t.description}
			footer={{
				onBack: () => router.push(back.href),
				backLabel: back.label,
				nextLabel: t.next,
				onNext: () => router.push(`/tastings/nose?wineType=${wineType}`),
			}}
		>
			<div className="tasting-grid tasting-grid--2">
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
					{WSET_OBSERVATIONS_KEY} <span className="tasting-aside">{t.ifApparent}</span>
				</div>
				<div className="tasting-options" role="group" aria-label={WSET_OBSERVATIONS_KEY}>
					{WSET_OBSERVATIONS.map((option) => {
						const on = observations.includes(option);
						return (
							<button
								key={option}
								className={`tasting-option tasting-option--multi${on ? ' tasting-option--selected' : ''}`}
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
