// The home page's sample tastings, scored by the app's own rules so the page can't drift from them.

import { compareReveal, type Reveal } from '../archives/revealScore';
import { compareStructure, structureAttributes } from '../flights/flightLogic';

export const SAMPLE_LABEL: Reveal = {
	grapeVariety: 'Pinot Noir',
	countryOfOrigin: 'France',
	regionAppellation: 'Chambolle-Musigny',
	qualityLevel: 'Premier Cru',
	vintage: '2018',
};

export const SAMPLE_TITLE = 'Chambolle-Musigny Premier Cru 2018';

const call = (grape: string, country: string, region: string, quality: string, vintage: string) => ({
	grapeVariety: grape,
	countryOfOrigin: country,
	regionAppellation: region,
	qualityLevel: quality,
	vintage,
});

const MAYA = call('Pinot Noir', 'France', 'Gevrey-Chambertin', 'Premier Cru', '2017');

/** Maya's call: 3 / 5, region and vintage close. Scored per language for its notes and headline. */
export const SAMPLE_REVEALS = {
	en: compareReveal(MAYA, SAMPLE_LABEL, null, 'cms', 'en'),
	pt: compareReveal(MAYA, SAMPLE_LABEL, null, 'cms', 'pt'),
};

export const SAMPLE_REVEAL = SAMPLE_REVEALS.en;

const TASTERS = [
	{
		id: 'm',
		initial: 'M',
		name: 'Maya',
		tint: 0,
		call: call('Pinot Noir', 'France', 'Gevrey-Chambertin', 'Premier Cru', '2017'),
		palate: {
			Acidity: 'Medium+',
			Alcohol: 'Medium',
			'Tannin Volume': 'Medium−',
			Body: 'Medium−',
			'Length of Finish': 'Medium+',
		},
	},
	{
		id: 'j',
		initial: 'J',
		name: 'Jonas',
		tint: 1,
		call: call('Pinot Noir', 'France', 'Chambolle-Musigny', 'Premier Cru', '2019'),
		palate: {
			Acidity: 'Medium+',
			Alcohol: 'Medium',
			'Tannin Volume': 'Medium',
			Body: 'Medium',
			'Length of Finish': 'Medium+',
		},
	},
	{
		id: 'p',
		initial: 'P',
		name: 'Priya',
		tint: 2,
		call: call('Nebbiolo', 'Italy', 'Barbaresco', 'DOCG', '2016'),
		palate: {
			Acidity: 'High',
			Alcohol: 'Medium',
			'Tannin Volume': 'High',
			Body: 'Medium+',
			'Length of Finish': 'Medium+',
		},
	},
];

export const SAMPLE_FLIGHT = TASTERS.map((taster) => ({ ...taster, result: compareReveal(taster.call, SAMPLE_LABEL) }));

export const SAMPLE_STRUCTURE = structureAttributes(['red'])
	.map((name) =>
		compareStructure(
			name,
			TASTERS.map((taster) => ({ personId: taster.id, wineType: 'red' as const, palate: taster.palate })),
		),
	)
	.filter((attr) => attr !== null);

export const SAMPLE_ARCHIVE = [
	{
		no: 24,
		red: true,
		title: SAMPLE_TITLE,
		score: `${SAMPLE_REVEAL.score} / ${SAMPLE_REVEAL.outOf}`,
	},
	{
		no: 23,
		red: true,
		title: 'Resende',
		score: null,
	},
	{
		no: 22,
		red: false,
		title: 'Papafigos Branco 2023',
		score: '5 / 5',
	},
];
