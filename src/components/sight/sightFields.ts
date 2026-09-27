// Sight attributes, following the 2024 CMS Americas deductive tasting grid. Plain data, no
// component imports: the sidebar reads these and TastingPhaseLayout imports the sidebar, so a
// phase-client import here would close a cycle. The keys double as labels and are what
// `tastingData.sight` stores, so the Final Conclusion recap and the archive can name them.

export const SIGHT_SCALES = {
	Clarity: ['Clear', 'Hazy', 'Cloudy'],
	'Intensity of Color': ['Translucent', 'Pale', 'Medium−', 'Medium', 'Medium+', 'Deep', 'Opaque'],
	Staining: ['None', 'Light', 'Medium−', 'Medium', 'Medium+', 'Heavy'],
	Tearing: ['Light', 'Medium−', 'Medium', 'Medium+', 'Heavy'],
} as const;

export const SIGHT_YES_NO = ['Yes', 'No'];

// Secondary colour is the one multi-select attribute here; everything else is one answer.
export const SIGHT_MULTI = new Set(['Secondary Color(s)']);

// Rim variation and staining are red-wine attributes on the grid.
const RED_ONLY = new Set(['Rim Variation', 'Staining']);

const ALL_FIELDS = [
	'Clarity',
	'Intensity of Color',
	'Primary Color',
	'Secondary Color(s)',
	'Rim Variation',
	'Staining',
	'Tearing',
	'Gas Evidence',
];

/** Every sight attribute for this wine type, in grid order. All count toward completion. */
export function sightFields(wineType: 'red' | 'white') {
	return ALL_FIELDS.filter((field) => wineType === 'red' || !RED_ONLY.has(field));
}
