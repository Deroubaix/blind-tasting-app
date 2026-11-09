import { dict } from './index';

/** The WSET SAT screens. Field names, scale terms and aroma clusters stay English in `wsetFields.ts`. */
export const wsetText = dict(
	{
		bits: {
			required: 'required',
			groups: { Primary: 'Primary', Secondary: 'Secondary', Tertiary: 'Tertiary' },
			clickToRemove: 'Click to remove',
			ownTermPlaceholder: 'Your own term…',
			add: 'Add',
			other: '+ Other',
			backToFlight: 'Back to Flight',
			backToSetup: 'Back to Setup',
		},
		appearance: {
			description:
				'Tilt the glass against a white background. Clarity and intensity first, then the colour, then anything else you notice.',
			next: 'Next: The Nose',
			ifApparent: 'if apparent',
		},
		nose: {
			title: 'The Nose',
			description:
				'Is it clean? How intense? Then the aromas by cluster: primary from the grape, secondary from the winemaking, tertiary from age. Finish with the development.',
			back: 'Back to Appearance',
			next: 'Next: The Palate',
		},
		palate: {
			title: 'The Palate',
			description: 'Place each structural element on its scale, then note the flavours and how long they last.',
			back: 'Back to Nose',
			next: 'Next: Conclusions',
			flavourLede: 'What you taste, in the same clusters as the nose. Often the nose confirmed; sometimes more.',
			ownTerms: 'Your own terms',
		},
		conclusions: {
			description:
				'Judge the quality on balance, length, intensity and complexity, and say whether the wine is ready. Give your reasons; the examiner marks those too.',
			back: 'Back to Palate',
			next: 'Review & Save',
			quality: 'Quality level',
			readiness: 'Readiness for drinking',
			reasons: 'Reasons',
			reasonsHint: 'balance · length · intensity · complexity',
			reasonsPlaceholder:
				'e.g. High acidity balances the sugar; long finish; pronounced, complex nose with tertiary notes…',
			wineItself: 'The wine itself',
			identityLede:
				'Optional. Not asked at Level 3, but good practice, and scored when the reveal names the wine.',
			grape: 'Grape Variety or Blend',
			grapePlaceholder: 'e.g. Riesling',
			country: 'Country of Origin',
			countryPlaceholder: 'e.g. Germany',
			region: 'Region and Appellation',
			regionPlaceholder: 'e.g. Mosel',
			vintage: 'Vintage',
			analysis: 'Your notes so far',
			showNotes: 'Show all your notes',
			hideNotes: 'Hide your notes',
			aromas: 'Aromas',
			flavours: 'Flavours',
		},
	},
	{
		bits: {
			required: 'obrigatório',
			groups: { Primary: 'Primários', Secondary: 'Secundários', Tertiary: 'Terciários' },
			clickToRemove: 'Clique para remover',
			ownTermPlaceholder: 'O seu próprio termo…',
			add: 'Adicionar',
			other: '+ Outro',
			backToFlight: 'Voltar ao flight',
			backToSetup: 'Voltar à configuração',
		},
		appearance: {
			description:
				'Incline o copo contra um fundo branco. Primeiro a limpidez e a intensidade, depois a cor, depois tudo o que mais notar.',
			next: 'Seguinte: Nariz',
			ifApparent: 'se evidente',
		},
		nose: {
			title: 'Nariz',
			description:
				'Está limpo? Qual a intensidade? Depois os aromas por grupo: primários da uva, secundários da vinificação, terciários do envelhecimento. Termine com a evolução.',
			back: 'Voltar ao aspeto',
			next: 'Seguinte: Paladar',
		},
		palate: {
			title: 'Paladar',
			description:
				'Situe cada elemento da estrutura na sua escala e depois registe os sabores e quanto tempo duram.',
			back: 'Voltar ao nariz',
			next: 'Seguinte: Conclusões',
			flavourLede: 'O que prova, nos mesmos grupos do nariz. Muitas vezes confirma o nariz; por vezes, mais.',
			ownTerms: 'Os seus próprios termos',
		},
		conclusions: {
			description:
				'Avalie a qualidade pelo equilíbrio, final, intensidade e complexidade, e diga se o vinho está pronto a beber. Justifique; o examinador também avalia as razões.',
			back: 'Voltar ao paladar',
			next: 'Rever e guardar',
			quality: 'Nível de qualidade',
			readiness: 'Prontidão para beber',
			reasons: 'Razões',
			reasonsHint: 'equilíbrio · final · intensidade · complexidade',
			reasonsPlaceholder:
				'p. ex. A acidez elevada equilibra o açúcar; final longo; nariz pronunciado e complexo com notas terciárias…',
			wineItself: 'O próprio vinho',
			identityLede:
				'Opcional. Não é pedido no Nível 3, mas é boa prática, e é pontuado quando a revelação identifica o vinho.',
			grape: 'Casta ou lote',
			grapePlaceholder: 'p. ex. Riesling',
			country: 'País de origem',
			countryPlaceholder: 'p. ex. Germany',
			region: 'Região e denominação',
			regionPlaceholder: 'p. ex. Mosel',
			vintage: 'Colheita',
			analysis: 'As suas notas até agora',
			showNotes: 'Mostrar todas as notas',
			hideNotes: 'Esconder as notas',
			aromas: 'Aromas',
			flavours: 'Sabores',
		},
	},
);
