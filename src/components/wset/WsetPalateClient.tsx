'use client';

import { useRouter } from 'next/navigation';
import { useTastingContext } from '../tasting/TastingContext';
import TastingPhaseLayout from '../layout/TastingPhaseLayout';
import { DescriptorClusters, OptionCard } from './WsetBits';
import { type AromaCluster, WSET_FLAVOUR_KEY, WSET_PALATE, aromaClusters } from './wsetFields';

export default function WsetPalateClient({ wineType }: { wineType: 'red' | 'white' }) {
	const router = useRouter();
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
	const answered = keys.filter((key) => palate[key]).length;
	const pct = Math.round(((answered + (flavours.length ? 1 : 0)) / (keys.length + 1)) * 100);

	return (
		<TastingPhaseLayout
			wineType={wineType}
			progress={pct}
			timerPage="palate"
			timerDestination={`/tastings/final-conclusion?wineType=${wineType}`}
			phase="Phase 03"
			title="The Palate"
			description="Place each structural element on its scale, then note the flavours and how long they last."
			footer={{
				onBack: () => router.push(`/tastings/nose?wineType=${wineType}`),
				backLabel: 'Back to Nose',
				nextLabel: 'Next: Conclusions',
				onNext: () => router.push(`/tastings/final-conclusion?wineType=${wineType}`),
				nextDisabled: answered < keys.length,
			}}
		>
			<div className="palate-grid">
				{keys.map((key) => (
					<OptionCard
						key={key}
						label={key}
						options={structure[key]}
						value={palate[key] as string | undefined}
						onChange={(v) => set(key, v)}
						required
					/>
				))}
			</div>

			<div className="wset-group">
				<div className="nose-section-divider">
					<span className="section-label">{WSET_FLAVOUR_KEY}</span>
				</div>
				<p className="wset-lede">
					What you taste, in the same clusters as the nose. Often the nose confirmed; sometimes more.
				</p>
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
				<div className="nose-fruit-category wset-group">
					<div className="nose-fruit-category__label">Your own terms</div>
					<div className="tasting-options" role="group" aria-label="Your own terms">
						{own.map((term) => (
							<button
								key={term}
								className="tasting-option tasting-option--pill tasting-option--selected tasting-option--custom"
								title="Click to remove"
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
