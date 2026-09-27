// Palate attributes, following the 2024 CMS Americas deductive tasting grid. Plain data — see
// the note in noseFields.ts. Keys double as labels and are what `tastingData.palate` stores.

type WineType = 'red' | 'white';

const FIVE_LEVEL = ['Low', 'Medium−', 'Medium', 'Medium+', 'High'];

const SWEETNESS = [
	'Bone Dry',
	'Dry',
	'Dry with Slight Residual Sugar',
	'Off-Dry',
	'Medium-Sweet',
	'Sweet',
	'Lusciously Sweet',
];

/** Structure, in grid order. Tannin volume is red-only on the grid; phenolic bitterness white-only. */
export const PALATE_OPTIONS: Record<WineType, Record<string, string[]>> = {
	red: {
		Sweetness: SWEETNESS,
		Acidity: FIVE_LEVEL,
		Alcohol: FIVE_LEVEL,
		Body: ['Light', 'Medium−', 'Medium', 'Medium+', 'Full'],
		'Tannin Volume': FIVE_LEVEL,
		'Tannin Texture': ['Silky', 'Soft', 'Gritty', 'Coarse', 'Rough', 'Stalky', 'Hard'],
		Texture: ['Lean', 'Linear', 'Crisp', 'Soft', 'Creamy', 'Round', 'Waxy', 'Oily', 'Viscous'],
		Balance: ['Yes', 'No'],
		'Length of Finish': ['Short', 'Medium−', 'Medium', 'Medium+', 'Long'],
		Complexity: ['Simple', 'Medium−', 'Medium', 'Medium+', 'High'],
	},
	white: {
		Sweetness: SWEETNESS,
		Acidity: FIVE_LEVEL,
		Alcohol: FIVE_LEVEL,
		Body: ['Light', 'Medium−', 'Medium', 'Medium+', 'Full'],
		'Phenolic Bitterness': ['Yes', 'No'],
		Texture: ['Lean', 'Linear', 'Crisp', 'Soft', 'Creamy', 'Round', 'Waxy', 'Oily', 'Viscous'],
		Balance: ['Yes', 'No'],
		'Length of Finish': ['Short', 'Medium−', 'Medium', 'Medium+', 'Long'],
		Complexity: ['Simple', 'Medium−', 'Medium', 'Medium+', 'High'],
	},
};

/** Free-text note paired with Balance: what dominates the wine. Stored under this key. */
export const BALANCE_NOTE = 'Dominant Element(s)';

// The grid marks texture "note when apparent"; tannin texture, balance and complexity are
// recorded but, like texture, not required to move on.
const REQUIRED: Record<WineType, string[]> = {
	red: ['Sweetness', 'Acidity', 'Alcohol', 'Body', 'Tannin Volume', 'Length of Finish'],
	white: ['Sweetness', 'Acidity', 'Alcohol', 'Body', 'Phenolic Bitterness', 'Length of Finish'],
};

/** Confirm from the Nose: the grid's six rows, one tap each, stored in `palate` under `confirmKey`. */
export const CONFIRM_ROWS = ['Fruit', 'Fruit Condition', 'Non-Fruit', 'Earth', 'Mineral', 'Oak'] as const;

/** Fruit condition adds the grid's "turned tart?". */
export function confirmOptions(row: (typeof CONFIRM_ROWS)[number]): string[] {
	return row === 'Fruit Condition' ? ['Confirmed', 'Turned tart', 'Changed'] : ['Confirmed', 'Changed'];
}

export const confirmKey = (row: string) => `Confirm: ${row}`;

/** The structural calls this wine type must answer before Next is enabled. */
export function palateRequired(wineType: WineType): string[] {
	return REQUIRED[wineType];
}
