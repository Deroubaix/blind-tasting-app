// Nose attributes, following the 2024 CMS Americas deductive tasting grid. Plain data, no
// component imports: the sidebar reads these and TastingPhaseLayout imports the sidebar, so a
// phase-client import here would close a cycle.
//
// Within each grid heading the official grid terms come first, then the app's own more
// specific descriptors (Cherry, Violet, Graphite…) as study aids. Anything else goes in "+ Other".

type WineType = 'red' | 'white';

const INTENSITY = ['Delicate', 'Medium−', 'Medium', 'Medium+', 'Powerful'];
const AGE = ['Youthful', 'Developing', 'Vinous'];
const FAULTS = [
	'Barnyard',
	'Nail Polish Remover',
	'Caramel',
	'Nuts',
	'Dried Fruit',
	'Struck Match',
	'Balsamic Vinegar',
];
const FRUIT_CONDITION = [
	'Tart',
	'Ripe',
	'Fresh',
	'Baked',
	'Stewed',
	'Dried/Desiccated',
	'Bruised',
	'Jammy',
	'Juicy',
	'Candied',
	'Liqueur',
	'Oxidized',
];
const FROM_GRAPE = [
	'Flowers',
	'Green Bell Pepper',
	'Asparagus',
	'Celery',
	'Grass',
	'Herbs',
	'Tobacco',
	'Black Pepper',
	'White Pepper',
	'Ginger',
	'Honey',
	'Petrol',
	'Eucalyptus',
	'Chocolate',
	'Mocha',
];
const FROM_WINEMAKING = [
	'Bread Dough',
	'Yeast',
	'Beer',
	'Cheese Rind',
	'Cream',
	'Sour Cream',
	'Butter',
	'Yogurt',
	'Peanut Shell',
	'Toast',
	'Marzipan',
	'Stems',
	'Bubblegum',
	'Cigar Box',
];
const EARTH = ['Forest Floor', 'Mushrooms/Truffles', 'Potting Soil', 'Compost'];
const MINERAL = ['Mineral', 'Wet Stone', 'Limestone', 'Chalk', 'Slate', 'Flint'];
const OAK_DESCRIPTORS = [
	'Toast',
	'Smoke',
	'Vanilla',
	'Cinnamon',
	'Clove',
	'Nutmeg',
	'Cardamom',
	'Coffee',
	'Chocolate',
	'Dill',
	'Coconut',
	'Caramel',
	'Cedar',
];

// Shared by both colours: the grid's lists here do not differ between red and white.
const SHARED = {
	'Aromatic Intensity': INTENSITY,
	'Age Assessment': AGE,
	'Minor Fault(s)': FAULTS,
	'Fruit Condition': FRUIT_CONDITION,
	'From Winemaking': [...FROM_WINEMAKING, 'Brioche', 'Almond', 'Hazelnut'],
	Earth: [...EARTH, 'Leaves', 'Hay', 'Baked Earth'],
	Mineral: [...MINERAL, 'Graphite', 'Gravel', 'Granite', 'Volcanic', 'Sea Spray'],
	'Oak Descriptors': [...OAK_DESCRIPTORS, 'Butterscotch', 'Pencil Shavings'],
	'New Oak': ['Yes', 'No'],
	'Oak Intensity': ['Low', 'Medium', 'High'],
	'Oak Type': ['French', 'American', 'Eastern European'],
};

export const NOSE_OPTIONS: Record<WineType, Record<string, string[]>> = {
	red: {
		...SHARED,
		'Red Fruit': ['Cherry', 'Raspberry', 'Strawberry', 'Cranberry', 'Red Plum'],
		'Blue Fruit': ['Blueberry', 'Plum'],
		'Black Fruit': ['Blackberry', 'Black Cherry', 'Blackcurrant'],
		'Other Fruit': ['Fig', 'Date', 'Prune'],
		'From Grape(s)': [
			...FROM_GRAPE,
			'Rose',
			'Violet',
			'Lavender',
			'Black Tea',
			'Garrigue',
			'Mint',
			'Olive',
			'Tomato Leaf',
			'Beet',
			'Anise',
			'Juniper',
			'Tar',
			'Leather',
			'Game',
			'Grilled Meat',
			'Blood',
		],
	},
	white: {
		...SHARED,
		'Tart Citrus': ['Lime', 'Lemon', 'Grapefruit'],
		'Sweet Citrus': ['Orange', 'Tangerine'],
		'Apple/Pear': ['Apple', 'Pear', 'Quince'],
		'Stone Fruit': ['Apricot', 'Nectarine', 'Peach'],
		Tropical: ['Pineapple', 'Passionfruit', 'Mango', 'Banana', 'Lychee'],
		Melon: ['Honeydew', 'Cantaloupe'],
		'From Grape(s)': [
			...FROM_GRAPE,
			'Acacia',
			'Citrus Blossom',
			'Honeysuckle',
			'Jasmine',
			'Rose',
			'Gooseberry',
			'Jalapeño',
			'Tomato Leaf',
			'Bay Leaf',
			'Mint',
			'Lanolin',
			'Botrytis',
		],
	},
};

/** The grid's fruit groups for each colour. */
export const FRUIT_FAMILIES: Record<WineType, string[]> = {
	red: ['Red Fruit', 'Blue Fruit', 'Black Fruit', 'Other Fruit'],
	white: ['Tart Citrus', 'Sweet Citrus', 'Apple/Pear', 'Stone Fruit', 'Tropical', 'Melon'],
};

export const NOSE_TOP = ['Aromatic Intensity', 'Age Assessment', 'Minor Fault(s)'];
export const NOSE_NON_FRUIT = ['From Grape(s)', 'From Winemaking', 'Earth', 'Mineral'];
export const NOSE_OAK_ASSESSMENT = ['New Oak', 'Oak Intensity', 'Oak Type'];

// Single-answer categories. Drives chip shape on the Nose page (segmented rect rather than
// pill) and label pairing in the Final Conclusion recap. Everything else is multi-select.
export const NOSE_ASSESSMENTS = new Set(['Aromatic Intensity', 'Age Assessment', ...NOSE_OAK_ASSESSMENT]);

/**
 * What counts toward the Nose progress bar: each inner list is one step, done when any of its
 * categories has an answer. The fruit families are one step, so a wine with only red fruit is
 * not marked partly done. Faults are noted only when apparent, so they are not a step at all.
 */
export function noseProgressSteps(wineType: WineType): string[][] {
	return [
		['Aromatic Intensity'],
		['Age Assessment'],
		FRUIT_FAMILIES[wineType],
		['Fruit Condition'],
		['From Grape(s)', 'From Winemaking'],
		['Earth'],
		['Mineral'],
		['New Oak'],
	];
}
