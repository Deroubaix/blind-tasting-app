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
} from './noseFields';
import { useText } from '../../i18n/LanguageProvider';
import { tastingText } from '../../i18n/tasting';
import { useTerm } from '../../i18n/useTerm';

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
	const text = useText(tastingText);
	const term = useTerm();
	const t = text.nose;

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
		// rows are full-size options, multi-select descriptors are compact chips.
		const pill = SINGLE_SELECT.has(category) ? '' : ' tasting-option--multi';

		return (
			<div
				className={`tasting-options${equalWidth ? ' tasting-options--equal' : ''}`}
				role="group"
				aria-label={term(category)}
			>
				{options.map((option) => {
					const selected = selections.includes(option);
					return (
						<button
							key={option}
							onClick={() => handleOptionToggle(category, option)}
							aria-pressed={selected}
							className={`tasting-option${pill}${selected ? ' tasting-option--selected' : ''}`}
						>
							{term(option, category)}
						</button>
					);
				})}
				{customValues.map((val) => (
					<button
						key={val}
						onClick={() => handleRemoveCustom(category, val)}
						className={`tasting-option${pill} tasting-option--selected tasting-option--custom`}
						title={t.clickToRemove}
					>
						{val} ×
					</button>
				))}
				{!SINGLE_SELECT.has(category) &&
					(showCustomInput[category] ? (
						<span className="tasting-other-input">
							<input
								type="text"
								className="tasting-input"
								value={customInputs[category] || ''}
								onChange={(e) => setCustomInputs((prev) => ({ ...prev, [category]: e.target.value }))}
								placeholder={t.customPlaceholder}
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
							<button className="btn-primary btn-primary--sm" onClick={() => handleAddCustom(category)}>
								{text.add}
							</button>
							<button
								className="btn-quiet btn-quiet--sm"
								aria-label={t.cancelCustom}
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
							{t.other}
						</button>
					))}
			</div>
		);
	};

	// One question: its label, then its options.
	const renderCategory = (category: string, equalWidth = false) => {
		const options = presetOptions[category];
		const selections = selectedOptions[category] || [];
		const presetSet = new Set(options);
		const customValues = selections.filter((v) => !presetSet.has(v));

		return (
			<>
				<div className="tasting-card__label">{term(category)}</div>
				{renderPills(category, options, selections, customValues, equalWidth)}
			</>
		);
	};

	// A group inside a section card; fruit families carry a coloured dot.
	const renderFruitCategory = (category: string) => {
		const options = presetOptions[category];
		const selections = selectedOptions[category] || [];
		const presetSet = new Set(options);
		const customValues = selections.filter((v) => !presetSet.has(v));
		const dotClass = fruitDotClass[category];

		return (
			<>
				<div className="tasting-group__label">
					{dotClass && <span className={`nose-fruit-dot nose-fruit-dot--${dotClass}`} />}
					{term(category)}
				</div>
				{renderPills(category, options, selections, customValues)}
			</>
		);
	};

	// The whole heading is the toggle; the count says what a closed section is holding.
	const renderSectionHeader = (
		title: string,
		isOpen: boolean,
		onToggle: () => void,
		selectedCount: number,
		controls: string,
	) => (
		<h2 className="tasting-section__head">
			<button
				type="button"
				className="tasting-section__toggle"
				onClick={onToggle}
				aria-expanded={isOpen}
				aria-controls={controls}
			>
				<span className="section-label">{title}</span>
				<span className="tasting-section__right">
					{!isOpen && selectedCount > 0 && <span className="tasting-aside">{t.selected(selectedCount)}</span>}
					{isOpen ? (
						<IconChevronUp size={20} aria-hidden="true" />
					) : (
						<IconChevronDown size={20} aria-hidden="true" />
					)}
				</span>
			</button>
		</h2>
	);

	// ── Markup ───────────────────────────────────────────────────────────────────
	return (
		<TastingPhaseLayout
			wineType={wineType}
			timerPage="nose"
			timerDestination={`/tastings/palate?wineType=${wineType}`}
			title={t.title}
			description={t.description}
			footer={{
				onBack: handlePreviousPhase,
				backLabel: t.back,
				nextLabel: t.next,
				onNext: handleNextPhase,
			}}
		>
			{/* Faults, intensity and age, in grid order; the single-choice scales as equal segments. */}
			{NOSE_TOP.map((cat) => (
				<section key={cat} className="tasting-q">
					{renderCategory(cat, SINGLE_SELECT.has(cat))}
				</section>
			))}

			<section className="sheet-group" aria-labelledby="nose-fruit">
				<h2 className="section-label" id="nose-fruit">
					{t.fruit}
				</h2>
				{FRUIT_FAMILIES[wineType].map((cat) => (
					<div key={cat} className="tasting-group">
						{renderFruitCategory(cat)}
					</div>
				))}
				<div className="tasting-q">{renderCategory('Fruit Condition')}</div>
			</section>

			<section className="tasting-card tasting-section">
				{renderSectionHeader(
					t.nonFruit,
					complexOpen,
					() => setComplexOpen((o) => !o),
					countSelected(NOSE_NON_FRUIT),
					'nose-non-fruit',
				)}
				{/* `inert` takes the hidden chips out of the tab order and the accessibility tree. */}
				<div
					id="nose-non-fruit"
					className={`nose-collapsible${complexOpen ? '' : ' nose-collapsible--collapsed'}`}
					inert={!complexOpen}
				>
					<div className="nose-collapsible__inner tasting-section__body">
						{NOSE_NON_FRUIT.map((cat) => (
							<div key={cat} className="tasting-group">
								{renderFruitCategory(cat)}
							</div>
						))}
					</div>
				</div>
			</section>

			<section className="tasting-card tasting-section">
				{renderSectionHeader(
					t.oak,
					woodOpen,
					() => setWoodOpen((o) => !o),
					countSelected(['Oak Descriptors', ...NOSE_OAK_ASSESSMENT]),
					'nose-oak',
				)}
				<div
					id="nose-oak"
					className={`nose-collapsible${woodOpen ? '' : ' nose-collapsible--collapsed'}`}
					inert={!woodOpen}
				>
					<div className="nose-collapsible__inner tasting-section__body">
						{/* New oak first, as on the grid */}
						<div className="nose-oak">
							{NOSE_OAK_ASSESSMENT.map((cat) => (
								<div key={cat} className="tasting-q">
									{renderCategory(cat, true)}
								</div>
							))}
						</div>
						<div className="tasting-section__sub">{renderFruitCategory('Oak Descriptors')}</div>
					</div>
				</div>
			</section>
		</TastingPhaseLayout>
	);
}
