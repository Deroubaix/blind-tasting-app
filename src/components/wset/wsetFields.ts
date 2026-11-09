// The WSET Level 3 Systematic Approach to Tasting Wine, as plain data: no component imports, so
// the sidebar, the timer and the server can all read it. Keys double as labels and are what the
// tasting stores: appearance in `sight`, the nose in `nose`, structure and flavour in `palate`, and
// the conclusions in `conclusion.final`.

type WineType = 'red' | 'white';

const FIVE = ['Low', 'Medium(-)', 'Medium', 'Medium(+)', 'High'];
const INTENSITY = ['Light', 'Medium(-)', 'Medium', 'Medium(+)', 'Pronounced'];

// ── Appearance ────────────────────────────────────────────────────────────────

export const WSET_APPEARANCE = {
	Clarity: ['Clear', 'Hazy'],
	Intensity: ['Pale', 'Medium', 'Deep'],
} as const;

export const WSET_COLOUR: Record<WineType, string[]> = {
	white: ['Lemon-green', 'Lemon', 'Gold', 'Amber', 'Brown'],
	red: ['Purple', 'Ruby', 'Garnet', 'Tawny', 'Brown'],
};

/** Swatch tints for the colour row. Display only; the stored answer is the term. */
export const WSET_COLOUR_HEX: Record<string, string> = {
	'Lemon-green': '#d9e06e',
	Lemon: '#e8d44d',
	Gold: '#d2a12a',
	Amber: '#c27a1f',
	Purple: '#5a1f60',
	Ruby: '#9c1b31',
	Garnet: '#8a2d2b',
	Tawny: '#a65a2c',
	Brown: '#6e3d1d',
};

/** "Other observations": noted only when apparent, so not part of completion. */
export const WSET_OBSERVATIONS = ['Legs/tears', 'Deposit', 'Pétillance', 'Bubbles'];
export const WSET_OBSERVATIONS_KEY = 'Other Observations';

export const WSET_APPEARANCE_FIELDS = ['Clarity', 'Intensity', 'Colour'];

// ── Nose ──────────────────────────────────────────────────────────────────────

/** One answer each. Stored as a one-item list, the shape every nose answer has. */
export const WSET_NOSE_ASSESSMENTS: Record<string, string[]> = {
	Condition: ['Clean', 'Unclean'],
	Intensity: INTENSITY,
	Development: ['Youthful', 'Developing', 'Fully developed', 'Tired/past its best'],
};

export type AromaGroup = 'Primary' | 'Secondary' | 'Tertiary';

export type AromaCluster = {
	name: string;
	group: AromaGroup;
	terms: string[];
	/** Clusters the SAT lists for one colour only. */
	wineType?: WineType;
};

/** The SAT's aroma and flavour clusters, with its example descriptors. Anything else is "+ Other". */
export const WSET_AROMA_CLUSTERS: AromaCluster[] = [
	{
		name: 'Floral',
		group: 'Primary',
		terms: ['Acacia', 'Honeysuckle', 'Chamomile', 'Elderflower', 'Geranium', 'Blossom', 'Rose', 'Violet'],
	},
	{
		name: 'Green Fruit',
		group: 'Primary',
		wineType: 'white',
		terms: ['Apple', 'Gooseberry', 'Pear', 'Pear drop', 'Quince', 'Grape'],
	},
	{
		name: 'Citrus Fruit',
		group: 'Primary',
		wineType: 'white',
		terms: ['Grapefruit', 'Lemon', 'Lime', 'Orange peel', 'Lemon peel'],
	},
	{ name: 'Stone Fruit', group: 'Primary', wineType: 'white', terms: ['Peach', 'Apricot', 'Nectarine'] },
	{
		name: 'Tropical Fruit',
		group: 'Primary',
		wineType: 'white',
		terms: ['Banana', 'Lychee', 'Mango', 'Melon', 'Passion fruit', 'Pineapple'],
	},
	{
		name: 'Red Fruit',
		group: 'Primary',
		wineType: 'red',
		terms: ['Redcurrant', 'Cranberry', 'Raspberry', 'Strawberry', 'Red cherry', 'Red plum'],
	},
	{
		name: 'Black Fruit',
		group: 'Primary',
		wineType: 'red',
		terms: ['Blackcurrant', 'Blackberry', 'Bramble', 'Blueberry', 'Black cherry', 'Black plum'],
	},
	{
		name: 'Dried/Cooked Fruit',
		group: 'Primary',
		terms: ['Fig', 'Prune', 'Raisin', 'Sultana', 'Kirsch', 'Jamminess', 'Baked/stewed fruits', 'Preserved fruits'],
	},
	{
		name: 'Herbaceous',
		group: 'Primary',
		terms: ['Green bell pepper', 'Grass', 'Tomato leaf', 'Asparagus', 'Blackcurrant leaf'],
	},
	{ name: 'Herbal', group: 'Primary', terms: ['Eucalyptus', 'Mint', 'Medicinal', 'Lavender', 'Fennel', 'Dill'] },
	{ name: 'Pungent Spice', group: 'Primary', terms: ['Black pepper', 'White pepper', 'Liquorice'] },
	{ name: 'Other Primary', group: 'Primary', terms: ['Flint', 'Wet stones', 'Wet wool'] },
	{
		name: 'Yeast',
		group: 'Secondary',
		terms: ['Biscuit', 'Bread', 'Toast', 'Pastry', 'Brioche', 'Bread dough', 'Cheese'],
	},
	{ name: 'Malolactic', group: 'Secondary', terms: ['Butter', 'Cheese', 'Cream'] },
	{
		name: 'Oak',
		group: 'Secondary',
		terms: [
			'Vanilla',
			'Cloves',
			'Nutmeg',
			'Coconut',
			'Butterscotch',
			'Toast',
			'Cedar',
			'Charred wood',
			'Smoke',
			'Chocolate',
			'Coffee',
			'Resinous',
		],
	},
	{
		name: 'Deliberate Oxidation',
		group: 'Tertiary',
		terms: ['Almond', 'Marzipan', 'Coconut', 'Hazelnut', 'Walnut', 'Chocolate', 'Coffee', 'Toffee', 'Caramel'],
	},
	{
		name: 'Fruit Development',
		group: 'Tertiary',
		wineType: 'white',
		terms: ['Dried apricot', 'Marmalade', 'Dried apple', 'Dried banana'],
	},
	{
		name: 'Fruit Development',
		group: 'Tertiary',
		wineType: 'red',
		terms: ['Fig', 'Prune', 'Tar', 'Dried blackberry', 'Dried cranberry', 'Cooked blackberry', 'Cooked red plum'],
	},
	{
		name: 'Bottle Age',
		group: 'Tertiary',
		wineType: 'white',
		terms: ['Petrol', 'Kerosene', 'Cinnamon', 'Ginger', 'Nutmeg', 'Toast', 'Nutty', 'Mushroom', 'Hay', 'Honey'],
	},
	{
		name: 'Bottle Age',
		group: 'Tertiary',
		wineType: 'red',
		terms: [
			'Leather',
			'Forest floor',
			'Earth',
			'Mushroom',
			'Game',
			'Tobacco',
			'Vegetal',
			'Wet leaves',
			'Savoury',
			'Meaty',
			'Farmyard',
		],
	},
];

export const AROMA_GROUPS: AromaGroup[] = ['Primary', 'Secondary', 'Tertiary'];

/** The clusters this colour is offered, in SAT order. */
export function aromaClusters(wineType: WineType): AromaCluster[] {
	return WSET_AROMA_CLUSTERS.filter((cluster) => !cluster.wineType || cluster.wineType === wineType);
}

// ── Palate ────────────────────────────────────────────────────────────────────

const MOUSSE = ['Delicate', 'Creamy', 'Aggressive'];

/** Structure, in SAT order. Tannin is red-only; every row but Mousse (sparkling only) must be answered. */
export const WSET_PALATE: Record<WineType, Record<string, string[]>> = {
	red: {
		Sweetness: ['Dry', 'Off-dry', 'Medium-dry', 'Medium-sweet', 'Sweet', 'Luscious'],
		Acidity: FIVE,
		Tannin: FIVE,
		Alcohol: ['Low', 'Medium', 'High'],
		Body: ['Light', 'Medium(-)', 'Medium', 'Medium(+)', 'Full'],
		Mousse: MOUSSE,
		'Flavour Intensity': INTENSITY,
		Finish: ['Short', 'Medium(-)', 'Medium', 'Medium(+)', 'Long'],
	},
	white: {
		Sweetness: ['Dry', 'Off-dry', 'Medium-dry', 'Medium-sweet', 'Sweet', 'Luscious'],
		Acidity: FIVE,
		Alcohol: ['Low', 'Medium', 'High'],
		Body: ['Light', 'Medium(-)', 'Medium', 'Medium(+)', 'Full'],
		Mousse: MOUSSE,
		'Flavour Intensity': INTENSITY,
		Finish: ['Short', 'Medium(-)', 'Medium', 'Medium(+)', 'Long'],
	},
};

export const WSET_PALATE_OPTIONAL = ['Mousse'];

/** Flavour descriptors on the palate: the same clusters as the nose, stored as a list under this key. */
export const WSET_FLAVOUR_KEY = 'Flavour Characteristics';

// ── Conclusions ───────────────────────────────────────────────────────────────

export const WSET_QUALITY = ['Faulty', 'Poor', 'Acceptable', 'Good', 'Very good', 'Outstanding'];

export const WSET_READINESS = [
	'Too young',
	'Can drink now, but has potential for ageing',
	'Drink now: not suitable for ageing or further ageing',
	'Too old',
];

/** The conclusion keys, in `conclusion.final`. Reasons are the BLIC justification, optional. */
export const WSET_CONCLUSION_KEYS = {
	quality: 'qualityAssessment',
	readiness: 'readiness',
	reasons: 'reasons',
} as const;
