// Interchangeable calls from the CMS Americas Advanced core list (03.2025): names split by " / "
// there are graded equally. Sets are per grape; some include spelling variants.

import { fold } from '../tasting/autocompleteMatch';

type CoreEntry = {
	/** Slash-separated alternatives match either name: "Syrah/Shiraz". */
	grape: string;
	regions?: string[][];
	qualityLevels?: string[][];
};

const CHILE_CENTRAL_VALLEY = ['Curicó', 'Maipo', 'Maipo Valley', 'Maule', 'Maule Valley', 'Rapel'];

export const CORE_LIST: CoreEntry[] = [
	{
		grape: 'Chardonnay',
		regions: [
			['Carneros', 'Napa Valley', 'Russian River Valley', 'Sonoma Coast', 'Sonoma Valley'],
			['Adelaide Hills', 'Margaret River', 'Yarra Valley'],
		],
	},
	{
		grape: 'Chenin Blanc',
		// Demi-sec, then sec.
		regions: [
			['Montlouis-sur-Loire', 'Montlouis', 'Vouvray'],
			['Vouvray', 'Savennières'],
		],
	},
	{ grape: 'Grüner Veltliner', regions: [['Kamptal', 'Kremstal', 'Wachau']] },
	{
		grape: 'Pinot Gris/Pinot Grigio',
		regions: [['Friuli', 'Friuli-Venezia Giulia', 'Trentino-Alto Adige', 'Trentino', 'Alto Adige']],
	},
	{
		grape: 'Riesling',
		regions: [
			['Mosel', 'Rheingau', 'Rheinhessen', 'Pfalz', 'Nahe'],
			['Clare Valley', 'Eden Valley'],
		],
		qualityLevels: [
			['Trocken', 'GG', 'Grosses Gewächs', 'Grosses Gewächs (GG)'],
			['Kabinett', 'Spätlese'],
		],
	},
	{
		grape: 'Sauvignon Blanc',
		regions: [
			['Sancerre', 'Pouilly-Fumé'],
			['Pessac-Léognan', 'Graves'],
		],
	},
	{ grape: 'Torrontés', regions: [['Mendoza', 'Salta']] },
	{
		grape: 'Cabernet Sauvignon',
		regions: [
			['Graves', 'Haut-Médoc'],
			['Barossa Valley', 'Coonawarra', 'Margaret River', 'McLaren Vale'],
			CHILE_CENTRAL_VALLEY,
			['Napa Valley', 'Sonoma County', 'Central Coast'],
		],
	},
	{ grape: 'Cabernet Franc', regions: [['Bourgueil', 'Chinon', 'Saumur-Champigny']] },
	{ grape: 'Carménère', regions: [CHILE_CENTRAL_VALLEY] },
	{ grape: 'Grenache', regions: [['Châteauneuf-du-Pape', 'Gigondas', 'Vacqueyras']] },
	{
		grape: 'Merlot',
		regions: [
			['Pomerol', 'Saint-Émilion'],
			['Napa Valley', 'Sonoma County', 'Columbia Valley'],
		],
	},
	{ grape: 'Nebbiolo', regions: [['Barolo', 'Barbaresco']] },
	{
		grape: 'Pinot Noir',
		regions: [
			[
				'Anderson Valley',
				'Carneros',
				'Central Coast',
				'Sonoma Coast',
				'Sonoma Valley',
				'Willamette Valley',
				'Central Otago',
				'Martinborough',
			],
		],
	},
	{
		grape: 'Sangiovese',
		// The list's Chianti classifications, as regions or as levels.
		regions: [['Chianti', 'Chianti Classico', 'Chianti Rufina', 'Chianti Ruffina']],
		qualityLevels: [['Classico', 'Gran Selezione', 'Riserva']],
	},
	{
		grape: 'Syrah/Shiraz',
		regions: [
			['South Australia', 'Victoria', 'Western Australia'],
			['Central Coast', 'Sonoma County', 'Columbia Valley'],
		],
	},
	{
		grape: 'Tempranillo',
		regions: [['Ribera del Duero', 'Rioja']],
		qualityLevels: [['Reserva', 'Gran Reserva']],
	},
	{ grape: 'Zinfandel/Primitivo', regions: [['Napa Valley', 'Paso Robles', 'Sonoma County']] },
];

/** The revealed grape is this core grape: the same name, or a blend named after it. */
function isGrape(actualGrape: string, coreGrape: string): boolean {
	const actual = fold(actualGrape);
	return coreGrape
		.split('/')
		.map(fold)
		.some((name) => actual === name || actual.includes(name));
}

/** Whether the list grades the two calls equally for this grape (any grape if none revealed). */
export function interchangeable(
	kind: 'regions' | 'qualityLevels',
	grape: string | null,
	call: string,
	actual: string,
): boolean {
	const [a, b] = [fold(call), fold(actual)];
	return CORE_LIST.filter((entry) => !grape || isGrape(grape, entry.grape))
		.flatMap((entry) => entry[kind] ?? [])
		.some((set) => {
			const names = set.map(fold);
			return names.includes(a) && names.includes(b);
		});
}
