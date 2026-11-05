'use client';

import { useState } from 'react';
import { commonText } from '../../i18n/common';
import { useText } from '../../i18n/LanguageProvider';
import { wsetText } from '../../i18n/wset';
import { type AromaCluster, AROMA_GROUPS, aromaClusters } from './wsetFields';

type WineType = 'red' | 'white';

/** One attribute, one answer: a card of segmented options. Tapping the chosen one again clears it. */
export function OptionCard({
	label,
	options,
	value,
	onChange,
	required = false,
	equalWidth = false,
	swatches,
}: {
	label: string;
	options: readonly string[];
	value: string | undefined;
	onChange: (value: string | null) => void;
	required?: boolean;
	equalWidth?: boolean;
	/** Tint per option, shown as a dot before the term. */
	swatches?: Record<string, string>;
}) {
	const t = useText(wsetText).bits;
	return (
		<div className="tasting-card">
			<div className="tasting-card__label">
				{label}
				{required && (
					<span className="tasting-card__required" aria-label={t.required}>
						*
					</span>
				)}
			</div>
			<div
				className={`tasting-options${equalWidth ? ' tasting-options--equal' : ''}`}
				role="group"
				aria-label={label}
			>
				{options.map((option) => {
					const on = value === option;
					return (
						<button
							key={option}
							className={`tasting-option${on ? ' tasting-option--selected' : ''}`}
							aria-pressed={on}
							onClick={() => onChange(on ? null : option)}
						>
							{swatches?.[option] && (
								// The tint is data, so this is the one inline style.
								<span
									className="wset-dot"
									style={{ backgroundColor: swatches[option] }}
									aria-hidden="true"
								/>
							)}
							{option}
						</button>
					);
				})}
			</div>
		</div>
	);
}

type ClusterProps = {
	wineType: WineType;
	/** The preset terms chosen in this cluster. */
	selected: (cluster: AromaCluster) => string[];
	/** The taster's own terms in this cluster, shown as removable chips. */
	custom: (cluster: AromaCluster) => string[];
	onToggle: (cluster: AromaCluster, term: string) => void;
	onAdd: (cluster: AromaCluster, term: string) => void;
	onRemove: (cluster: AromaCluster, term: string) => void;
};

/**
 * The SAT's aroma and flavour clusters, grouped primary / secondary / tertiary. Shared by the nose
 * (which stores a list per cluster) and the palate (one flat list of flavour characteristics).
 */
export function DescriptorClusters({ wineType, selected, custom, onToggle, onAdd, onRemove }: ClusterProps) {
	const t = useText(wsetText).bits;
	const tc = useText(commonText);
	const [drafts, setDrafts] = useState<Record<string, string>>({});
	const [open, setOpen] = useState<Record<string, boolean>>({});
	const clusters = aromaClusters(wineType);

	const add = (cluster: AromaCluster) => {
		const value = drafts[cluster.name]?.trim();
		if (value) {
			onAdd(cluster, value);
		}
		setDrafts((d) => ({ ...d, [cluster.name]: '' }));
		setOpen((o) => ({ ...o, [cluster.name]: false }));
	};

	return (
		<>
			{AROMA_GROUPS.map((group) => (
				<div key={group} className="wset-group">
					<div className="tasting-divider">
						<span className="section-label">{t.groups[group]}</span>
					</div>
					<div className="tasting-grid tasting-grid--2">
						{clusters
							.filter((cluster) => cluster.group === group)
							.map((cluster) => {
								const chosen = selected(cluster);
								const own = custom(cluster);
								return (
									<div key={cluster.name} className="tasting-group">
										<div className="tasting-group__label">{cluster.name}</div>
										<div className="tasting-options" role="group" aria-label={cluster.name}>
											{cluster.terms.map((term) => {
												const on = chosen.includes(term);
												return (
													<button
														key={term}
														className={`tasting-option tasting-option--compact${on ? ' tasting-option--selected' : ''}`}
														aria-pressed={on}
														onClick={() => onToggle(cluster, term)}
													>
														{term}
													</button>
												);
											})}
											{own.map((term) => (
												<button
													key={term}
													className="tasting-option tasting-option--compact tasting-option--selected tasting-option--custom"
													title={t.clickToRemove}
													onClick={() => onRemove(cluster, term)}
												>
													{term} ×
												</button>
											))}
											{open[cluster.name] ? (
												<span className="tasting-other-input">
													<input
														type="text"
														className="tasting-input"
														value={drafts[cluster.name] ?? ''}
														onChange={(e) =>
															setDrafts((d) => ({ ...d, [cluster.name]: e.target.value }))
														}
														placeholder={t.ownTermPlaceholder}
														onKeyDown={(e) => {
															if (e.key === 'Enter') {
																add(cluster);
															}
															if (e.key === 'Escape') {
																setOpen((o) => ({ ...o, [cluster.name]: false }));
															}
														}}
														autoFocus
													/>
													<button
														className="btn-primary btn-primary--sm"
														onClick={() => add(cluster)}
													>
														{t.add}
													</button>
													<button
														className="btn-quiet btn-quiet--sm"
														aria-label={tc.cancel}
														onClick={() =>
															setOpen((o) => ({ ...o, [cluster.name]: false }))
														}
													>
														✕
													</button>
												</span>
											) : (
												<button
													className="tasting-option tasting-option--compact tasting-option--ghost"
													onClick={() => setOpen((o) => ({ ...o, [cluster.name]: true }))}
												>
													{t.other}
												</button>
											)}
										</div>
									</div>
								);
							})}
					</div>
				</div>
			))}
		</>
	);
}

/** Back to where the tasting began: the flight, or Start. */
export function backToSetup(
	flight: { code: string } | null | undefined,
	wineType: WineType,
	t: { backToFlight: string; backToSetup: string },
) {
	return {
		href: flight ? `/flights/${flight.code}` : `/tastings/start?wineType=${wineType}`,
		label: flight ? t.backToFlight : t.backToSetup,
	};
}
