import { dict } from './index';

const listEn = (items: string[]) =>
	items.length < 2 ? (items[0] ?? '') : `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`;
const listPt = (items: string[]) =>
	items.length < 2 ? (items[0] ?? '') : `${items.slice(0, -1).join(', ')} e ${items.at(-1)}`;
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const NUMBERS_EN = ['No', 'One', 'Two', 'Three'];
const NUMBERS_PT = ['Nenhuma', 'Mais uma', 'Mais duas', 'Três'];

/** The Progress page. */
export const progressText = dict(
	{
		title: 'Progress',
		since: (name: string, month: string) => `${name} · since ${month}`,
		filters: {
			grid: 'Grid',
			type: 'Wine type',
			cms: 'CMS deductive',
			wset: 'WSET L3 SAT',
			chip: (grid: string, n: number) => `${grid} · ${n} revealed`,
			cmsShort: 'CMS',
			wsetShort: 'WSET',
			all: 'All',
			red: 'Red',
			white: 'White',
		},
		totals: {
			tastings: 'Tastings',
			revealed: 'Revealed',
			average: 'Average',
			bestRun: 'Best run',
			waiting: (n: number) => `${n} waiting`,
			allRevealed: 'All revealed',
			averageCms: 'Fields right per wine',
			averageWset: 'Share of fields right',
			run: (threshold: string) => `In a row at ${threshold} or better`,
			afterThree: 'After three reveals',
		},
		waiting: (n: number) =>
			`${n} ${n === 1 ? 'tasting is' : 'tastings are'} still waiting for a reveal and not counted here.`,
		revealThem: 'Reveal them →',
		revealShort: 'Reveal →',
		everyRevealed: 'Every tasting in this view has been revealed.',
		trend: {
			title: 'Am I getting',
			titleEm: 'better?',
			up: 'Up ↑',
			down: 'Down ↓',
			level: 'Level',
			fromTo: (first: string, last: string, n: number) =>
				` from ${first} to ${last} over ${n} revealed tastings.`,
			at: (last: string, n: number) => ` at ${last} over ${n} revealed tastings.`,
			notEnough: 'Not enough yet',
			forFilter: ' for this filter.',
			note: (window: number, compared: number) =>
				`Rolling average of your last ${window}; ${compared === 1 ? 'your first tasting against your latest' : `your first ${compared} against your latest ${compared}`}.`,
			noteWset: ' WSET is shown as the share of scored fields right.',
			readTable: 'Read as a table',
			showChart: 'Show the chart',
			legendRed: 'Red wine, one tasting',
			legendWhite: 'White wine, one tasting',
			legendRedShort: 'Red',
			legendWhiteShort: 'White',
			legendRolling: (window: number) => `Rolling average of the last ${window}`,
			legendRollingShort: (window: number) => `Last ${window} average`,
			axisCms: 'Fields right, out of 5',
			axisWset: 'Share of scored fields right',
			tooFew: "Fewer than three revealed tastings match this filter, so there's no trend to draw yet.",
			tooFewShort: 'Fewer than three revealed tastings match this filter.',
			chartLabel: 'Each revealed tasting and the rolling average',
			no: 'No.',
			date: 'Date',
			wine: 'Wine',
			type: 'Type',
			score: 'Score',
			rollingAvg: 'Rolling avg',
			red: 'Red',
			white: 'White',
			markNo: (n: number, date: string) => `No. ${n} · ${date}`,
			everyField: 'every field right',
		},
		confuse: {
			title: 'What do I',
			titleEm: 'confuse?',
			lede: "Wrong calls you've made at least twice, out of the times that wine was poured.",
			grapes: 'Grapes',
			countries: 'Countries',
			youCall: 'You call ',
			itWas: ', it was ',
			of: (n: number) => ` of ${n}`,
			count: (n: number, of: number) => `${n} of ${of}`,
			none: 'No wrong call made twice yet.',
		},
		palate: {
			title: 'Where does my palate',
			titleEm: 'run?',
			lede: (n: number) =>
				`Your calls against the group's median call on the same wine, across ${n} flight ${n === 1 ? 'wine' : 'wines'}. One step is Medium to Medium+.`,
			lower: 'Lower',
			group: 'Group',
			higher: 'Higher',
			name: { Acidity: 'Acidity', Tannin: 'Tannin', Alcohol: 'Alcohol', Body: 'Body', Finish: 'Finish' },
			inSentence: { Acidity: 'acidity', Tannin: 'tannin', Alcohol: 'alcohol', Body: 'body', Finish: 'finish' },
			wines: (n: number, redsOnly: boolean) =>
				`${n} ${n === 1 ? 'wine' : 'wines'}${redsOnly ? ', reds only' : ''}`,
			high: 'Runs high',
			inline: 'In line',
			low: 'Runs low',
			summary: (high: string[], low: string[], inline: string[]) => {
				const parts: string[] = [];
				if (high.length && low.length) {
					parts.push(`You call ${listEn(high)} higher and ${listEn(low)} lower than the group.`);
				} else if (high.length) {
					parts.push(`You call ${listEn(high)} higher than the group.`);
				} else if (low.length) {
					parts.push(`You call ${listEn(low)} lower than the group.`);
				}
				if (inline.length) {
					parts.push(
						high.length || low.length
							? `${cap(listEn(inline))} ${inline.length === 1 ? 'is' : 'are'} in line.`
							: 'Your structure calls sit in line with the group.',
					);
				}
				return parts.join(' ');
			},
			none: 'Taste a wine in a flight with others to see how your structure calls sit against the group.',
		},
		empty: {
			title: (needed: number) =>
				`${NUMBERS_EN[needed] ?? needed} ${needed === 1 ? 'more reveal' : 'more reveals'} and`,
			titleFresh: 'Three reveals and',
			titleEm: 'your trend starts here.',
			body: "Progress needs at least three revealed tastings to draw a trend. Your confusions show up once you've made the same wrong call twice, and palate bias once you've tasted in a flight.",
			bodyShort:
				"A trend needs three revealed tastings. Confusions appear once you've made the same wrong call twice; palate bias once you've tasted in a flight.",
			reveal: (n: number) => `Reveal No. ${n} →`,
			start: 'Start a tasting',
			soFar: 'Revealed so far',
			waitingSlot: 'Saved, waiting for its reveal',
			nextSlot: 'Your next tasting',
			needed: (n: number, of: number) => `${n} of ${of} needed`,
		},
	},
	{
		title: 'Progresso',
		since: (name, month) => `${name} · desde ${month}`,
		filters: {
			grid: 'Grelha',
			type: 'Tipo de vinho',
			cms: 'Dedutiva CMS',
			wset: 'WSET N3 SAT',
			chip: (grid, n) => `${grid} · ${n} ${n === 1 ? 'revelada' : 'reveladas'}`,
			cmsShort: 'CMS',
			wsetShort: 'WSET',
			all: 'Todos',
			red: 'Tinto',
			white: 'Branco',
		},
		totals: {
			tastings: 'Provas',
			revealed: 'Reveladas',
			average: 'Média',
			bestRun: 'Melhor série',
			waiting: (n) => (n === 1 ? '1 por revelar' : `${n} por revelar`),
			allRevealed: 'Todas reveladas',
			averageCms: 'Campos certos por vinho',
			averageWset: 'Percentagem de campos certos',
			run: (threshold) => `Seguidas com ${threshold} ou mais`,
			afterThree: 'Depois de três revelações',
		},
		waiting: (n) =>
			n === 1
				? '1 prova ainda espera pela revelação e não entra nestas contas.'
				: `${n} provas ainda esperam pela revelação e não entram nestas contas.`,
		revealThem: 'Revelá-las →',
		revealShort: 'Revelar →',
		everyRevealed: 'Todas as provas desta vista foram reveladas.',
		trend: {
			title: 'Estou a',
			titleEm: 'melhorar?',
			up: 'A subir ↑',
			down: 'A descer ↓',
			level: 'Estável',
			fromTo: (first, last, n) => `, de ${first} para ${last} em ${n} provas reveladas.`,
			at: (last, n) => `, em ${last} ao longo de ${n} provas reveladas.`,
			notEnough: 'Ainda não chega',
			forFilter: ' para este filtro.',
			note: (window, compared) =>
				`Média móvel das suas últimas ${window}; ${compared === 1 ? 'a primeira prova face à mais recente' : `as primeiras ${compared} face às ${compared} mais recentes`}.`,
			noteWset: ' A WSET aparece como a percentagem de campos pontuados certos.',
			readTable: 'Ver como tabela',
			showChart: 'Ver o gráfico',
			legendRed: 'Vinho tinto, uma prova',
			legendWhite: 'Vinho branco, uma prova',
			legendRedShort: 'Tinto',
			legendWhiteShort: 'Branco',
			legendRolling: (window) => `Média móvel das últimas ${window}`,
			legendRollingShort: (window) => `Média das últimas ${window}`,
			axisCms: 'Campos certos, em 5',
			axisWset: 'Percentagem de campos pontuados certos',
			tooFew: 'Há menos de três provas reveladas neste filtro, por isso ainda não há tendência para mostrar.',
			tooFewShort: 'Há menos de três provas reveladas neste filtro.',
			chartLabel: 'Cada prova revelada e a média móvel',
			no: 'N.º',
			date: 'Data',
			wine: 'Vinho',
			type: 'Tipo',
			score: 'Pontuação',
			rollingAvg: 'Média móvel',
			red: 'Tinto',
			white: 'Branco',
			markNo: (n, date) => `N.º ${n} · ${date}`,
			everyField: 'todos os campos certos',
		},
		confuse: {
			title: 'O que é que',
			titleEm: 'confundo?',
			lede: 'Respostas erradas que deu pelo menos duas vezes, contadas sobre as vezes em que esse vinho foi servido.',
			grapes: 'Castas',
			countries: 'Países',
			youCall: 'Diz ',
			itWas: ', era ',
			of: (n) => ` de ${n}`,
			count: (n, of) => `${n} de ${of}`,
			none: 'Ainda não repetiu nenhuma resposta errada.',
		},
		palate: {
			title: 'Para onde tende o meu',
			titleEm: 'paladar?',
			lede: (n) =>
				`As suas respostas face à mediana do grupo no mesmo vinho, em ${n} ${n === 1 ? 'vinho' : 'vinhos'} de flights. Um passo é de Medium para Medium+.`,
			lower: 'Abaixo',
			group: 'Grupo',
			higher: 'Acima',
			name: { Acidity: 'Acidez', Tannin: 'Tanino', Alcohol: 'Álcool', Body: 'Corpo', Finish: 'Final' },
			inSentence: {
				Acidity: 'a acidez',
				Tannin: 'o tanino',
				Alcohol: 'o álcool',
				Body: 'o corpo',
				Finish: 'o final',
			},
			wines: (n, redsOnly) => `${n} ${n === 1 ? 'vinho' : 'vinhos'}${redsOnly ? ', só tintos' : ''}`,
			high: 'Acima',
			inline: 'Em linha',
			low: 'Abaixo',
			summary: (high, low, inline) => {
				const parts: string[] = [];
				if (high.length && low.length) {
					parts.push(`Avalia ${listPt(high)} acima e ${listPt(low)} abaixo do grupo.`);
				} else if (high.length) {
					parts.push(`Avalia ${listPt(high)} acima do grupo.`);
				} else if (low.length) {
					parts.push(`Avalia ${listPt(low)} abaixo do grupo.`);
				}
				if (inline.length) {
					parts.push(
						high.length || low.length
							? `${cap(listPt(inline))} ${inline.length === 1 ? 'está' : 'estão'} em linha.`
							: 'As suas leituras de estrutura estão em linha com o grupo.',
					);
				}
				return parts.join(' ');
			},
			none: 'Prove um vinho num flight com outras pessoas para ver como as suas leituras de estrutura se comparam com as do grupo.',
		},
		empty: {
			title: (needed) => `${NUMBERS_PT[needed] ?? needed} ${needed === 1 ? 'revelação' : 'revelações'} e`,
			titleFresh: 'Três revelações e',
			titleEm: 'a sua tendência começa aqui.',
			body: 'O Progresso precisa de pelo menos três provas reveladas para mostrar uma tendência. As confusões aparecem quando repetir a mesma resposta errada, e a tendência do paladar quando provar num flight.',
			bodyShort:
				'Uma tendência precisa de três provas reveladas. As confusões aparecem quando repetir a mesma resposta errada; a tendência do paladar quando provar num flight.',
			reveal: (n) => `Revelar o N.º ${n} →`,
			start: 'Iniciar uma prova',
			soFar: 'Reveladas até agora',
			waitingSlot: 'Guardada, à espera da revelação',
			nextSlot: 'A sua próxima prova',
			needed: (n, of) => `${n} de ${of} necessárias`,
		},
	},
);
