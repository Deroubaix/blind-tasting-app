import { dict } from './index';

/** Shared across areas: phase names, grid names, the words every screen reuses. */
export const commonText = dict(
	{
		back: 'Back',
		next: 'Next',
		cancel: 'Cancel',
		save: 'Save',
		delete: 'Delete',
		close: 'Close',
		loading: 'Loading…',
		home: 'Home',
		red: 'Red',
		white: 'White',
		redWine: 'Red wine',
		whiteWine: 'White wine',
		wineOf: (n: number, total: number) => `Wine ${n} of ${total}`,
		wines: (n: number) => (n === 1 ? '1 wine' : `${n} wines`),
		/** Phase names per grid, as the sidebar and headers show them. */
		phase: {
			cms: {
				sight: 'Sight',
				nose: 'Nose',
				palate: 'Palate',
				initialConclusion: 'Initial Conclusion',
				finalConclusion: 'Final Conclusion',
			},
			wset: {
				sight: 'Appearance',
				nose: 'Nose',
				palate: 'Palate',
				initialConclusion: 'Conclusions',
				finalConclusion: 'Conclusions',
			},
		},
		grid: {
			cms: {
				name: 'CMS deductive grid',
				short: 'CMS',
				title: '2024 Deductive Tasting Format',
				credit: 'Grid based on the 2024 Deductive Tasting Format, © Court of Master Sommeliers, Americas.',
			},
			wset: {
				name: 'WSET Level 3 SAT',
				short: 'WSET L3',
				title: 'Level 3 Systematic Approach to Tasting Wine',
				credit: 'Based on the WSET Level 3 Systematic Approach to Tasting Wine®, © Wine & Spirit Education Trust.',
			},
		},
		notAffiliated:
			'Not affiliated with or endorsed by the Court of Master Sommeliers or the Wine & Spirit Education Trust.',
	},
	{
		back: 'Voltar',
		next: 'Seguinte',
		cancel: 'Cancelar',
		save: 'Guardar',
		delete: 'Eliminar',
		close: 'Fechar',
		loading: 'A carregar…',
		home: 'Início',
		red: 'Tinto',
		white: 'Branco',
		redWine: 'Vinho tinto',
		whiteWine: 'Vinho branco',
		wineOf: (n, total) => `Vinho ${n} de ${total}`,
		wines: (n) => (n === 1 ? '1 vinho' : `${n} vinhos`),
		phase: {
			cms: {
				sight: 'Vista',
				nose: 'Nariz',
				palate: 'Paladar',
				initialConclusion: 'Conclusão inicial',
				finalConclusion: 'Conclusão final',
			},
			wset: {
				sight: 'Aspeto',
				nose: 'Nariz',
				palate: 'Paladar',
				initialConclusion: 'Conclusões',
				finalConclusion: 'Conclusões',
			},
		},
		grid: {
			cms: {
				name: 'Grelha dedutiva CMS',
				short: 'CMS',
				title: 'Deductive Tasting Format 2024',
				credit: 'Grelha baseada no Deductive Tasting Format 2024, © Court of Master Sommeliers, Americas.',
			},
			wset: {
				name: 'WSET Nível 3 SAT',
				short: 'WSET N3',
				title: 'Abordagem Sistemática à Prova de Vinhos, Nível 3',
				credit: 'Baseada na WSET Level 3 Systematic Approach to Tasting Wine®, © Wine & Spirit Education Trust.',
			},
		},
		notAffiliated: 'Sem afiliação nem aprovação do Court of Master Sommeliers ou do Wine & Spirit Education Trust.',
	},
);
