export type WineColorEntry = {
	name: string;
	hex: string;
	desc: string;
};

export type WineColorGroup = {
	primary: WineColorEntry[];
	secondary: WineColorEntry[];
};

// The 2024 CMS Americas grid's colour terms. Primary is the core of the wine; secondary is
// what shows toward the rim and can be more than one. Descriptions are study aids, not grid text.
export const wineColors: Record<string, WineColorGroup> = {
	red: {
		primary: [
			{
				name: 'Purple',
				hex: '#4E0D3A',
				desc: 'Deep blue-red, youthful wines. Malbec, young Syrah, Petite Sirah.',
			},
			{
				name: 'Ruby',
				hex: '#9B1B30',
				desc: 'Bright clear red, the most common core. Young Cabernet, Merlot, Sangiovese.',
			},
			{
				name: 'Garnet',
				hex: '#6E2B3A',
				desc: 'Red with brownish-orange hints, showing age. Aged Pinot Noir, Nebbiolo, older Rioja.',
			},
		],
		secondary: [
			{
				name: 'Blue',
				hex: '#4A2A6E',
				desc: 'Blue-purple tint at the rim. Youth, low pH, high acidity.',
			},
			{
				name: 'Magenta',
				hex: '#9C2A6A',
				desc: 'Vivid pink-purple rim. Young, vibrant wines.',
			},
			{
				name: 'Ruby',
				hex: '#A8203A',
				desc: 'Red rim. Some development under way.',
			},
			{
				name: 'Orange',
				hex: '#B8612E',
				desc: 'Orange rim. Maturity; common in aged Nebbiolo and Sangiovese.',
			},
			{
				name: 'Garnet',
				hex: '#8B4A3A',
				desc: 'Brick-red rim. Clear development and age.',
			},
			{
				name: 'Brown',
				hex: '#6B4A2E',
				desc: 'Brown rim. Significant age or oxidation.',
			},
		],
	},
	white: {
		primary: [
			{
				name: 'Water White',
				hex: '#F3F1DB',
				desc: 'Almost no pigment. Very young, unoaked, high-acid wines. Vinho Verde, Txakoli.',
			},
			{
				name: 'Straw',
				hex: '#E8D8A0',
				desc: 'Very pale yellow. Young Pinot Grigio, Muscadet, Albariño.',
			},
			{
				name: 'Yellow',
				hex: '#E0C840',
				desc: 'Medium yellow. Whites in their prime. Chardonnay, Pinot Gris.',
			},
			{
				name: 'Gold',
				hex: '#DAA520',
				desc: 'Rich golden yellow. Oaked Chardonnay, aged Riesling, Viognier.',
			},
		],
		secondary: [
			{
				name: 'Silver',
				hex: '#D0D0C4',
				desc: 'Neutral silvery tint. Young, cool-climate whites. Muscadet, Pinot Grigio.',
			},
			{
				name: 'Green',
				hex: '#A8C878',
				desc: 'Green tint. Very young, high acidity. Sauvignon Blanc, Grüner Veltliner.',
			},
			{
				name: 'Copper',
				hex: '#C9804A',
				desc: 'Coppery tint. Skin contact or a pink-skinned grape such as Pinot Gris.',
			},
			{
				name: 'Gold',
				hex: '#D4A83A',
				desc: 'Golden tint. Age, oak, ripeness or botrytis.',
			},
			{
				name: 'Brown',
				hex: '#8A6A3A',
				desc: 'Brown tint. Oxidation or great age.',
			},
		],
	},
};
