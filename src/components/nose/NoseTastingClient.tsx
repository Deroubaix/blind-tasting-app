'use client';

import { useRouter } from 'next/navigation';
import { useTastingContext } from '../tasting/TastingContext';
import { useEffect, useState } from 'react';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import TastingPhaseLayout from '../layout/TastingPhaseLayout';
import {
	FRUIT_FAMILIES,
	NOSE_ASSESSMENTS as SINGLE_SELECT,
	NOSE_NON_FRUIT,
	NOSE_OAK_ASSESSMENT,
	NOSE_OPTIONS,
	NOSE_TOP,
	noseProgressSteps,
} from './noseFields';

// ── Fruit dot colors (SCSS modifier suffix per grid fruit group) ───────────────
const fruitDotClass: Record<string, string> = {
	'Red Fruit': 'red',
	'Blue Fruit': 'blue',
	'Black Fruit': 'black',
	'Other Fruit': 'dried',
	'Tart Citrus': 'citrus',
	'Sweet Citrus': 'citrus',
	'Apple/Pear': 'orchard',
	'Stone Fruit': 'stone',
	Tropical: 'tropical',
	Melon: 'tropical',
};

// ── Component ──────────────────────────────────────────────────────────────────
export default function NoseTastingClient({ wineType }: { wineType: 'red' | 'white' }) {
	const router = useRouter();
	const { tastingData, updateTastingData } = useTastingContext();

	const selectedOptions: Record<string, string[]> = (tastingData.nose as Record<string, string[]>) || {};
	const [customInputs, setCustomInputs] = useState<Record<string, string>>({});
	const [showCustomInput, setShowCustomInput] = useState<Record<string, boolean>>({});
	const [complexOpen, setComplexOpen] = useState(() => {
		if (typeof window === 'undefined') {
			return true;
		}
		const v = localStorage.getItem('nose-complex-open');
		return v === null ? true : v === 'true';
	});
	const [woodOpen, setWoodOpen] = useState(() => {
		if (typeof window === 'undefined') {
			return true;
		}
		const v = localStorage.getItem('nose-wood-open');
		return v === null ? true : v === 'true';
	});

	useEffect(() => {
		localStorage.setItem('nose-complex-open', String(complexOpen));
	}, [complexOpen]);
	useEffect(() => {
		localStorage.setItem('nose-wood-open', String(woodOpen));
	}, [woodOpen]);

	const handleOptionToggle = (category: string, option: string) => {
		const current = selectedOptions[category] || [];
		const newSelection = SINGLE_SELECT.has(category)
			? current[0] === option
				? []
				: [option]
			: current.includes(option)
				? current.filter((o) => o !== option)
				: [...current, option];
		updateTastingData({ nose: { ...selectedOptions, [category]: newSelection } });
	};

	const handleAddCustom = (category: string) => {
		const value = customInputs[category]?.trim();
		if (!value) {
			return;
		}
		const current = selectedOptions[category] || [];
		if (current.includes(value)) {
			return;
		}
		updateTastingData({ nose: { ...selectedOptions, [category]: [...current, value] } });
		setCustomInputs((prev) => ({ ...prev, [category]: '' }));
		setShowCustomInput((prev) => ({ ...prev, [category]: false }));
	};

	const handleRemoveCustom = (category: string, value: string) => {
		updateTastingData({
			nose: { ...selectedOptions, [category]: (selectedOptions[category] || []).filter((o) => o !== value) },
		});
	};

	const handleNextPhase = () => router.push(`/tastings/palate?wineType=${wineType}`);
	const handlePreviousPhase = () => router.push(`/tastings/sight?wineType=${wineType}`);

	const countSelected = (keys: string[]) =>
		keys.reduce((total, cat) => total + (selectedOptions[cat]?.length || 0), 0);

	const steps = noseProgressSteps(wineType);
	const stepsDone = steps.filter((step) => step.some((k) => (selectedOptions[k]?.length || 0) > 0));
	const nosePct = Math.round((stepsDone.length / steps.length) * 100);

	const presetOptions = NOSE_OPTIONS[wineType];

	// ── Sub-renderers ────────────────────────────────────────────────────────────

	const renderPills = (
		category: string,
		options: string[],
		selections: string[],
		customValues: string[],
		equalWidth = false,
	) => {
		// The design splits chips by selection mode, not by layout: single-select
		// rows are segmented rectangles, multi-select descriptors are pills.
		const pill = SINGLE_SELECT.has(category) ? '' : ' tasting-option--pill';

		return (
			<div className={`tasting-options${equalWidth ? ' tasting-options--equal' : ''}`}>
				{options.map((option) => {
					const selected = selections.includes(option);
					return (
						<button
							key={option}
							onClick={() => handleOptionToggle(category, option)}
							aria-pressed={selected}
							className={`tasting-option${pill}${selected ? ' tasting-option--selected' : ''}`}
						>
							{option}
						</button>
					);
				})}
				{customValues.map((val) => (
					<button
						key={val}
						onClick={() => handleRemoveCustom(category, val)}
						className={`tasting-option${pill} tasting-option--selected tasting-option--custom`}
						title="Click to remove"
					>
						{val} ×
					</button>
				))}
				{!SINGLE_SELECT.has(category) &&
					(showCustomInput[category] ? (
						<span className="nose-other-input">
							<input
								type="text"
								className="tasting-input"
								value={customInputs[category] || ''}
								onChange={(e) => setCustomInputs((prev) => ({ ...prev, [category]: e.target.value }))}
								placeholder="Type custom note..."
								onKeyDown={(e) => {
									if (e.key === 'Enter') {
										handleAddCustom(category);
									}
									if (e.key === 'Escape') {
										setShowCustomInput((prev) => ({ ...prev, [category]: false }));
									}
								}}
								autoFocus
							/>
							<button className="tasting-confirm-btn" onClick={() => handleAddCustom(category)}>
								Add
							</button>
							<button
								className="tasting-dismiss-btn"
								aria-label="Cancel custom note"
								onClick={() => setShowCustomInput((prev) => ({ ...prev, [category]: false }))}
							>
								✕
							</button>
						</span>
					) : (
						<button
							className={`tasting-option${pill} tasting-option--ghost`}
							onClick={() => setShowCustomInput((prev) => ({ ...prev, [category]: true }))}
						>
							+ Other
						</button>
					))}
			</div>
		);
	};

	// Into .nose-card — top assessment, complex, wood.
	const renderCategory = (category: string, equalWidth = false) => {
		const options = presetOptions[category];
		const selections = selectedOptions[category] || [];
		const presetSet = new Set(options);
		const customValues = selections.filter((v) => !presetSet.has(v));

		return (
			<>
				<div className="tasting-card__label">{category}</div>
				{renderPills(category, options, selections, customValues, equalWidth)}
			</>
		);
	};

	// Into .nose-fruit-category — no background, coloured dot.
	const renderFruitCategory = (category: string) => {
		const options = presetOptions[category];
		const selections = selectedOptions[category] || [];
		const presetSet = new Set(options);
		const customValues = selections.filter((v) => !presetSet.has(v));
		const dotClass = fruitDotClass[category];

		return (
			<>
				<div className="nose-fruit-category__label">
					{dotClass && <span className={`nose-fruit-dot nose-fruit-dot--${dotClass}`} />}
					{category}
				</div>
				{renderPills(category, options, selections, customValues)}
			</>
		);
	};

	const renderSectionHeader = (title: string, isOpen: boolean, onToggle: () => void, selectedCount: number) => (
		<button className="nose-section-header" onClick={onToggle} aria-expanded={isOpen}>
			<span className="section-label">{title}</span>
			<span className="nose-section-header__right">
				{!isOpen && selectedCount > 0 && (
					<span className="nose-section-header__count">{selectedCount} selected</span>
				)}
				{isOpen ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
			</span>
		</button>
	);

	// ── Markup ───────────────────────────────────────────────────────────────────
	return (
		<TastingPhaseLayout
			wineType={wineType}
			progress={nosePct}
			timerPage="nose"
			timerDestination={`/tastings/palate?wineType=${wineType}`}
			phase="Phase 02"
			title="The Nose"
			description="Note any faults, judge intensity and age, then work through fruit, non-fruit, earth, mineral, and oak."
			footer={{
				onBack: handlePreviousPhase,
				backLabel: 'Back to Sight',
				nextLabel: 'Next: Palate',
				onNext: handleNextPhase,
			}}
		>
			{/* ── Intensity, age and faults (3 cols) ── */}
			<div className="nose-grid">
				{NOSE_TOP.map((cat) => (
					<div key={cat} className="tasting-card">
						{renderCategory(cat)}
					</div>
				))}
			</div>

			{/* ── Fruit ── */}
			<div className="nose-section-divider">
				<span className="section-label">Fruit</span>
			</div>

			{/* The grid's fruit groups — no card background */}
			<div className="nose-grid nose-grid--two-col">
				{FRUIT_FAMILIES[wineType].map((cat) => (
					<div key={cat} className="nose-fruit-category">
						{renderFruitCategory(cat)}
					</div>
				))}
			</div>

			<div className="tasting-card">{renderCategory('Fruit Condition')}</div>

			{/* ── Non-Fruit, Earth & Mineral (collapsible) ── */}
			{renderSectionHeader(
				'Non-Fruit, Earth & Mineral',
				complexOpen,
				() => setComplexOpen((o) => !o),
				countSelected(NOSE_NON_FRUIT),
			)}
			{/* `inert` takes the hidden chips out of the tab order and the accessibility tree. */}
			<div
				className={`nose-collapsible${complexOpen ? '' : ' nose-collapsible--collapsed'}`}
				inert={!complexOpen}
			>
				<div className="nose-collapsible__inner">
					<div className="nose-grid">
						{NOSE_NON_FRUIT.map((cat) => (
							<div key={cat} className="nose-fruit-category">
								{renderFruitCategory(cat)}
							</div>
						))}
					</div>
				</div>
			</div>

			{/* ── Oak (collapsible) ── */}
			{renderSectionHeader(
				'Oak',
				woodOpen,
				() => setWoodOpen((o) => !o),
				countSelected(['Oak Descriptors', ...NOSE_OAK_ASSESSMENT]),
			)}
			<div className={`nose-collapsible${woodOpen ? '' : ' nose-collapsible--collapsed'}`} inert={!woodOpen}>
				<div className="nose-collapsible__inner">
					<div className="nose-wood-layout">
						{/* Descriptors — left, no background */}
						<div className="nose-fruit-category nose-wood-layout__aromas">
							{renderFruitCategory('Oak Descriptors')}
						</div>

						{/* New oak, intensity, type — right, stacked, individual cards */}
						<div className="nose-wood-layout__assessment">
							{NOSE_OAK_ASSESSMENT.map((cat) => (
								<div key={cat} className="tasting-card">
									{renderCategory(cat, true)}
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</TastingPhaseLayout>
	);
}
