'use client';

import { useRouter } from 'next/navigation';
import { useText } from '../../i18n/LanguageProvider';
import { wsetText } from '../../i18n/wset';
import { useTastingContext } from '../tasting/TastingContext';
import TastingPhaseLayout from '../layout/TastingPhaseLayout';
import { DescriptorClusters, OptionCard } from './WsetBits';
import { type AromaCluster, WSET_FLAVOUR_KEY, WSET_PALATE, WSET_PALATE_OPTIONAL, aromaClusters } from './wsetFields';

export default function WsetPalateClient({ wineType }: { wineType: 'red' | 'white' }) {
	const router = useRouter();
	const t = useText(wsetText).palate;
	const tb = useText(wsetText).bits;
	const { tastingData, updateTastingData } = useTastingContext();
	const palate = tastingData.palate ?? {};
	const structure = WSET_PALATE[wineType];

	const set = (key: string, value: string | null) => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { [key]: _previous, ...rest } = palate;
		updateTastingData({ palate: value === null ? rest : { ...rest, [key]: value } });
	};

	// Flavour characteristics are one flat list, whichever cluster a term came from.
	const flavours = Array.isArray(palate[WSET_FLAVOUR_KEY]) ? (palate[WSET_FLAVOUR_KEY] as string[]) : [];
	const setFlavours = (values: string[]) => updateTastingData({ palate: { ...palate, [WSET_FLAVOUR_KEY]: values } });
	const toggle = (_cluster: AromaCluster, term: string) =>
		setFlavours(flavours.includes(term) ? flavours.filter((t) => t !== term) : [...flavours, term]);
	const add = (_cluster: AromaCluster, term: string) => {
		if (!flavours.includes(term)) {
			setFlavours([...flavours, term]);
		}
	};
	const remove = (_cluster: AromaCluster, term: string) => setFlavours(flavours.filter((t) => t !== term));

	// A taster's own terms belong to no cluster, so they are listed once, after the clusters.
	const presets = new Set(aromaClusters(wineType).flatMap((cluster) => cluster.terms));
	const own = flavours.filter((term) => !presets.has(term));

	const keys = Object.keys(structure);
	const required = keys.filter((key) => !WSET_PALATE_OPTIONAL.includes(key));
	const answered = required.filter((key) => palate[key]).length;

	return (
		<TastingPhaseLayout
			wineType={wineType}
			timerPage="palate"
			timerDestination={`/tastings/final-conclusion?wineType=${wineType}`}
			title={t.title}
			description={t.description}
			footer={{
				onBack: () => router.push(`/tastings/nose?wineType=${wineType}`),
				backLabel: t.back,
				nextLabel: t.next,
				onNext: () => router.push(`/tastings/final-conclusion?wineType=${wineType}`),
				nextDisabled: answered < required.length,
			}}
		>
			<div className="tasting-grid tasting-grid--2">
				{keys.map((key) => (
					<OptionCard
						key={key}
						label={key}
						options={structure[key]}
						value={palate[key] as string | undefined}
						onChange={(v) => set(key, v)}
						required={required.includes(key)}
					/>
				))}
			</div>

			<div className="wset-group">
				<div className="tasting-divider">
					<span className="section-label">{WSET_FLAVOUR_KEY}</span>
				</div>
				<p className="wset-lede">{t.flavourLede}</p>
			</div>
			<DescriptorClusters
				wineType={wineType}
				selected={(cluster) => flavours.filter((t) => cluster.terms.includes(t))}
				custom={() => []}
				onToggle={toggle}
				onAdd={add}
				onRemove={remove}
			/>
			{own.length > 0 && (
				<div className="tasting-group wset-group">
					<div className="tasting-group__label">{t.ownTerms}</div>
					<div className="tasting-options" role="group" aria-label={t.ownTerms}>
						{own.map((term) => (
							<button
								key={term}
								className="tasting-option tasting-option--multi tasting-option--selected tasting-option--custom"
								title={tb.clickToRemove}
								onClick={() => setFlavours(flavours.filter((t) => t !== term))}
							>
								{term} ×
							</button>
						))}
					</div>
				</div>
			)}
		</TastingPhaseLayout>
	);
}
