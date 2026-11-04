'use client';

import { useRouter } from 'next/navigation';
import { useTastingContext } from '../tasting/TastingContext';
import TastingPhaseLayout from '../layout/TastingPhaseLayout';
import { DescriptorClusters, OptionCard } from './WsetBits';
import { type AromaCluster, WSET_NOSE_ASSESSMENTS, wsetNoseSteps } from './wsetFields';

export default function WsetNoseClient({ wineType }: { wineType: 'red' | 'white' }) {
	const router = useRouter();
	const { tastingData, updateTastingData } = useTastingContext();
	const nose: Record<string, string[]> = tastingData.nose ?? {};

	const setList = (key: string, values: string[]) => updateTastingData({ nose: { ...nose, [key]: values } });

	// Assessments are one answer each, stored as a one-item list like every nose answer.
	const setAssessment = (key: string, value: string | null) => setList(key, value ? [value] : []);

	const toggle = (cluster: AromaCluster, term: string) => {
		const current = nose[cluster.name] ?? [];
		setList(cluster.name, current.includes(term) ? current.filter((t) => t !== term) : [...current, term]);
	};
	const add = (cluster: AromaCluster, term: string) => {
		const current = nose[cluster.name] ?? [];
		if (!current.includes(term)) {
			setList(cluster.name, [...current, term]);
		}
	};
	const remove = (cluster: AromaCluster, term: string) =>
		setList(
			cluster.name,
			(nose[cluster.name] ?? []).filter((t) => t !== term),
		);

	const steps = wsetNoseSteps(wineType);
	const done = steps.filter((step) => step.some((key) => (nose[key]?.length ?? 0) > 0)).length;
	const pct = Math.round((done / steps.length) * 100);

	return (
		<TastingPhaseLayout
			wineType={wineType}
			progress={pct}
			timerPage="nose"
			timerDestination={`/tastings/palate?wineType=${wineType}`}
			phase="Phase 02"
			title="The Nose"
			description="Is it clean? How intense? Then the aromas by cluster: primary from the grape, secondary from the winemaking, tertiary from age. Finish with the development."
			footer={{
				onBack: () => router.push(`/tastings/sight?wineType=${wineType}`),
				backLabel: 'Back to Appearance',
				nextLabel: 'Next: The Palate',
				onNext: () => router.push(`/tastings/palate?wineType=${wineType}`),
			}}
		>
			<div className="wset-grid wset-grid--two">
				{['Condition', 'Intensity'].map((key) => (
					<OptionCard
						key={key}
						label={key}
						options={WSET_NOSE_ASSESSMENTS[key]}
						value={nose[key]?.[0]}
						onChange={(v) => setAssessment(key, v)}
						equalWidth
					/>
				))}
			</div>

			<DescriptorClusters
				wineType={wineType}
				selected={(cluster) => (nose[cluster.name] ?? []).filter((t) => cluster.terms.includes(t))}
				custom={(cluster) => (nose[cluster.name] ?? []).filter((t) => !cluster.terms.includes(t))}
				onToggle={toggle}
				onAdd={add}
				onRemove={remove}
			/>

			<div className="wset-group">
				<OptionCard
					label="Development"
					options={WSET_NOSE_ASSESSMENTS.Development}
					value={nose.Development?.[0]}
					onChange={(v) => setAssessment('Development', v)}
				/>
			</div>
		</TastingPhaseLayout>
	);
}
