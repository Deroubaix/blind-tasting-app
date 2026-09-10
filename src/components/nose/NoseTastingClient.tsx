'use client';

import { useRouter } from 'next/navigation';
import { useTastingContext } from '../tasting/TastingContext';
import { useEffect, useState } from 'react';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import TastingPhaseLayout from '../layout/TastingPhaseLayout';
import { NOSE_ASSESSMENTS as SINGLE_SELECT } from './noseFields';

// ── Aroma data ─────────────────────────────────────────────────────────────────
const noseTastingOptions = {
	red: {
		'Clean or Faulty': ['Clean', 'Faulty'],
		Intensity: ['Delicate', 'Moderate', 'Pronounced'],
		'Age Assessment': ['Youthful', 'Vinous'],
		'Red Fruits': ['Cherry', 'Raspberry', 'Strawberry', 'Cranberry'],
		'Blue Fruits': ['Plum', 'Blueberry'],
		'Black Fruits': ['Blackberry', 'Black Cherry', 'Blackcurrant'],
		'Dried Fruits': ['Dates', 'Figs', 'Prunes'],
		'Fruit Character': ['Tart', 'Ripe/Lush', 'Jammy', 'Baked', 'Stewed', 'Dried'],
		Condition: ['Fresh', 'Dried'],
		Floral: ['Rose', 'Lavender', 'Violet', 'Black Tea'],
		'Veg/Herbal': [
			'Savory Herbs',
			'Provençal Herbs',
			'Garrigue',
			'Tarragon',
			'Bell Pepper',
			'Olives',
			'Mint/Eucalyptus',
			'Dill',
			'Beet',
			'Tomato Leaf',
		],
		Spices: ['Black Pepper', 'Anise', 'Clove', 'Juniper'],
		Animal: ['Barbecue', 'Blood', 'Game', 'Grilled Meat', 'Leather', 'Stable', 'Brett'],
		Nuts: ['Almond', 'Hazelnut', 'Marzipan', 'Peanut', 'Nutmeg'],
		Vinification: [
			'Butter',
			'Cream',
			'Rind',
			'Yogurt',
			'Brioche',
			'Dough',
			'Graham Cracker',
			'Bubblegum',
			'Botrytis',
		],
		Earth: [
			'Baked earth',
			'Compost',
			'Forest Floor',
			'Potting Soil',
			'Truffle',
			'Leaves',
			'Mushroom',
			'Hay',
			'Straw',
		],
		Rocks: [
			'Chalk',
			'Dust',
			'Flint/Gunpowder',
			'Granit',
			'Graphite',
			'Gravel',
			'Limestone',
			'Slate/Petrol',
			'Volcanic',
			'Tar',
			'Sea Spray',
		],
		'Wood Aromas': [
			'Vanilla',
			'Coconut',
			'Cigarbox',
			'Cedar',
			'Mocha',
			'Chocolate',
			'Cocoa',
			'Caramel',
			'Butterscotch',
			'Pencil Shavings',
		],
		'Wood Aromas Origin': ['French', 'American', 'Slavonian'],
		'Wood Aromas Condition': ['New', 'Neutral', 'Large'],
	},
	white: {
		'Clean or Faulty': ['Clean', 'Faulty'],
		Intensity: ['Delicate', 'Moderate', 'Pronounced'],
		'Age Assessment': ['Youthful', 'Vinous'],
		'Citrus Fruit': ['Lime', 'Lemon', 'Orange', 'Grapefruit'],
		'Stone Fruit': ['Apricot', 'Nectarine', 'Peach'],
		'Orchard Fruit': ['Apple', 'Pear', 'Quince'],
		'Tropical Fruit': ['Pineapple', 'Passionfruit', 'Mango', 'Melon', 'Banana', 'Lychee'],
		'Fruit Character': ['Tart', 'Ripe/Lush', 'Baked', 'Jammy', 'Dried', 'Peel'],
		Condition: ['Fresh', 'Dried'],
		Floral: ['Acacia', 'Citrus Blossom', 'Honeysuckle', 'Jasmine', 'Rose'],
		'Veg/Herbal/Spices': [
			'Gooseberry',
			'Asparagus',
			'Bellpepper',
			'Jalapeno',
			'Olives',
			'Tomato',
			'Bay Leaf',
			'Dill',
			'Eucalyptus/Mint',
			'Ginger',
			'Wasabi',
			'White Pepper',
			'Lanolin',
		],
		Nuts: ['Almond', 'Hazelnut', 'Marzipan', 'Peanut', 'Nutmeg'],
		Vinification: [
			'Butter',
			'Cream',
			'Rind',
			'Yogurt',
			'Brioche',
			'Dough',
			'Graham Cracker',
			'Bubblegum',
			'Botrytis',
		],
		Earth: [
			'Baked earth',
			'Compost',
			'Forest Floor',
			'Potting Soil',
			'Truffle',
			'Leaves',
			'Mushroom',
			'Hay',
			'Straw',
		],
		Rocks: [
			'Chalk',
			'Dust',
			'Flint/Gunpowder',
			'Granit',
			'Graphite',
			'Gravel',
			'Limestone',
			'Slate/Petrol',
			'Volcanic',
			'Tar',
			'Sea Spray',
		],
		'Wood Aromas': [
			'Vanilla',
			'Coconut',
			'Cigarbox',
			'Cedar',
			'Mocha',
			'Chocolate',
			'Cocoa',
			'Caramel',
			'Butterscotch',
			'Pencil Shavings',
		],
		'Wood Aromas Origin': ['French', 'American', 'Slavonian'],
		'Wood Aromas Condition': ['New', 'Neutral', 'Large'],
	},
};

// ── Fruit dot colors (SCSS modifier suffix per category) ──────────────────────
const fruitDotClass: Record<string, string> = {
	'Red Fruits': 'red',
	'Blue Fruits': 'blue',
	'Black Fruits': 'black',
	'Dried Fruits': 'dried',
	'Citrus Fruit': 'citrus',
	'Stone Fruit': 'stone',
	'Orchard Fruit': 'orchard',
	'Tropical Fruit': 'tropical',
};

// ── Section groupings ──────────────────────────────────────────────────────────
const topAssessmentKeys: Record<'red' | 'white', string[]> = {
	red: ['Clean or Faulty', 'Intensity', 'Age Assessment'],
	white: ['Clean or Faulty', 'Intensity', 'Age Assessment'],
};

// Actual fruit types — rendered without card background
const primaryFruitTypeKeys: Record<'red' | 'white', string[]> = {
	red: ['Red Fruits', 'Blue Fruits', 'Black Fruits', 'Dried Fruits'],
	white: ['Citrus Fruit', 'Stone Fruit', 'Orchard Fruit', 'Tropical Fruit'],
};

// Assessment rows — rendered with card background
const primaryFruitAssessmentKeys: Record<'red' | 'white', string[]> = {
	red: ['Fruit Character', 'Condition'],
	white: ['Fruit Character', 'Condition'],
};

// Combined for progress calculation
const primaryFruitKeys: Record<'red' | 'white', string[]> = {
	red: [...primaryFruitTypeKeys.red, ...primaryFruitAssessmentKeys.red],
	white: [...primaryFruitTypeKeys.white, ...primaryFruitAssessmentKeys.white],
};

const complexSecondaryKeys: Record<'red' | 'white', string[]> = {
	red: ['Floral', 'Veg/Herbal', 'Spices', 'Animal', 'Nuts', 'Vinification', 'Earth', 'Rocks'],
	white: ['Floral', 'Veg/Herbal/Spices', 'Nuts', 'Vinification', 'Earth', 'Rocks'],
};

// Wood Aromas: descriptor (no bg) — Origin + Condition: assessment (split card)
const woodAromaKeys: Record<'red' | 'white', string[]> = {
	red: ['Wood Aromas'],
	white: ['Wood Aromas'],
};

const woodAssessmentKeys: Record<'red' | 'white', string[]> = {
	red: ['Wood Aromas Origin', 'Wood Aromas Condition'],
	white: ['Wood Aromas Origin', 'Wood Aromas Condition'],
};

// Combined for progress calculation
const woodExposureKeys: Record<'red' | 'white', string[]> = {
	red: [...woodAromaKeys.red, ...woodAssessmentKeys.red],
	white: [...woodAromaKeys.white, ...woodAssessmentKeys.white],
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

	const allNoseKeys = [
		...topAssessmentKeys[wineType],
		...primaryFruitKeys[wineType],
		...complexSecondaryKeys[wineType],
		...woodExposureKeys[wineType],
	];
	const nosePct = Math.round(
		(allNoseKeys.filter((k) => (selectedOptions[k]?.length || 0) > 0).length / allNoseKeys.length) * 100,
	);

	const presetOptions = noseTastingOptions[wineType] as Record<string, string[]>;

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
		<button className="nose-section-header" onClick={onToggle}>
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
			description="Assess the aromatic profile — start with condition and intensity, then identify fruit, secondary, and tertiary aromas."
			footer={{
				onBack: handlePreviousPhase,
				backLabel: 'Back to Sight',
				nextLabel: 'Next: Palate',
				onNext: handleNextPhase,
			}}
		>
			{/* ── Top assessment (3 cols) ── */}
			<div className="nose-grid">
				{topAssessmentKeys[wineType].map((cat) => (
					<div key={cat} className="tasting-card">
						{renderCategory(cat)}
					</div>
				))}
			</div>

			{/* ── Primary Fruit Profile ── */}
			<div className="nose-section-divider">
				<span className="section-label">Primary Fruit Profile</span>
			</div>

			{/* Fruit types — no card background */}
			<div className="nose-grid nose-grid--two-col">
				{primaryFruitTypeKeys[wineType].map((cat) => (
					<div key={cat} className="nose-fruit-category">
						{renderFruitCategory(cat)}
					</div>
				))}
			</div>

			{/* Fruit Character + Condition — separate cards, equal-width buttons */}
			<div className="nose-grid nose-grid--two-col">
				{primaryFruitAssessmentKeys[wineType].map((cat) => (
					<div key={cat} className="tasting-card">
						{renderCategory(cat, true)}
					</div>
				))}
			</div>

			{/* ── Complex & Secondary Aromas (collapsible) ── */}
			{renderSectionHeader(
				'Complex & Secondary Aromas',
				complexOpen,
				() => setComplexOpen((o) => !o),
				countSelected(complexSecondaryKeys[wineType]),
			)}
			<div className={`nose-collapsible${complexOpen ? '' : ' nose-collapsible--collapsed'}`}>
				<div className="nose-collapsible__inner">
					{/* Descriptor categories — no background */}
					<div className="nose-grid">
						{complexSecondaryKeys[wineType].map((cat) => (
							<div key={cat} className="nose-fruit-category">
								{renderFruitCategory(cat)}
							</div>
						))}
					</div>
				</div>
			</div>

			{/* ── Wood Exposure Assessment (collapsible) ── */}
			{renderSectionHeader(
				'Wood Exposure Assessment',
				woodOpen,
				() => setWoodOpen((o) => !o),
				countSelected(woodExposureKeys[wineType]),
			)}
			<div className={`nose-collapsible${woodOpen ? '' : ' nose-collapsible--collapsed'}`}>
				<div className="nose-collapsible__inner">
					<div className="nose-wood-layout">
						{/* Wood Aromas — left, no background */}
						<div className="nose-fruit-category nose-wood-layout__aromas">
							{renderFruitCategory('Wood Aromas')}
						</div>

						{/* Origin + Condition — right, stacked, individual cards */}
						<div className="nose-wood-layout__assessment">
							{woodAssessmentKeys[wineType].map((cat) => (
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
