import { dict } from './index';

/** The home page: the logged-out introduction and the logged-in overview. */
export const homeText = dict(
	{
		hero: {
			eyebrow: 'Blind-tasting practice for the CMS deductive grid and the WSET Level 3 SAT',
			title: 'Taste blind. Then see how close you got.',
			lede: "Work a wine through the grid at exam pace, enter what's on the label, and get your call scored field by field. On your own, or with your study group on their own phones. Free.",
			note: 'Saving tastings and flights need a free account. Not affiliated with the Court of Master Sommeliers or WSET.',
		},
		doors: {
			solo: 'Taste on your own',
			soloBody: 'One wine, the grid, an optional clock. No account needed.',
			soloCta: 'Start a tasting',
			host: 'Host a group',
			hostBody: 'Pour bagged, numbered wines and share a code. Everyone tastes on their own phone; you reveal.',
			hostCta: 'Host a flight',
			code: 'I have a code',
			codeBody: "It's on the host's screen: six letters and numbers.",
		},
		modes: {
			title: 'Two ways to taste',
			lede: 'Same grid, same scoring. The difference is who pours and who reveals.',
			soloTag: 'Solo',
			soloKicker: 'No account needed',
			soloTitle: 'Taste on your own',
			soloSteps: {
				1: [
					'Choose the grid and the clock',
					'CMS or WSET. Guided clocks for each phase, one exam clock for the whole wine, or no timer.',
				],
				2: [
					'Work the wine through the grid',
					'Sight, nose, palate, then an initial and a final conclusion. Every answer is kept the moment you tap it.',
				],
				3: [
					'Reveal: enter the label',
					'Unwrap the bottle and type what it says. A photo of the label is optional.',
				],
				4: [
					'See your call scored',
					'Field by field: Correct, Close or Wrong. The sheet goes into your archive.',
				],
			},
			soloCta: 'Start a tasting',
			groupTag: 'Flight',
			groupKicker: 'Free account for everyone taking part',
			groupTitle: 'Taste with a group',
			groupSteps: {
				1: [
					'The host pours and bags the wines',
					'Numbered 1 to 6. Creating the flight gives a six-character code and a QR to share.',
				],
				2: [
					'Everyone joins on their own phone',
					'Enter the code, or scan. Each taster works the wines in any order, on their own clock.',
				],
				3: ['The host reveals each label once', 'Only when a wine is ready. Nobody sees the answer early.'],
				4: [
					'Scored together, at the same moment',
					'Everyone who submitted is marked against the label, side by side, with where the group split on structure.',
				],
			},
			groupCta: 'Host a flight',
			haveCode: 'I have a code',
		},
		after: {
			title: 'After the reveal',
			lede: 'The scoring is the point. What you get once the label is in.',
			scorecard: 'A scorecard',
			scorecardBody:
				'Each field of your final call against the label. One point for an exact match; Close marks the near misses, such as a vintage within two years.',
			label: 'label',
			tasting: (n: number) => `Tasting ${n}`,
			archive: 'An archive',
			archiveBody:
				'Every sheet you save, with its call, its label and its score, so you can go back and see how your reasoning held up.',
			archiveRows: {
				1: ['Chambolle-Musigny 2018', 'Pinot Noir · 12 September'],
				2: ['Barolo 2016', 'Nebbiolo · 10 September'],
				3: ['Douro white blend', 'Not revealed yet · 3 September'],
			},
			reveal: 'Reveal',
			progress: 'Progress',
			progressBody:
				'Whether you are getting better, which grapes and countries you confuse, and where your palate runs against the group.',
			rolling: 'Rolling average, last five:',
			upFrom: 'up from',
			youCall: 'You call',
			itWas: 'it was',
			confusions: {
				1: ['Syrah', 'Grenache', '3 of 4'],
				2: ['Italy', 'Spain', '2 of 3'],
			},
		},
		columns: {
			grapeVariety: 'Grape',
			countryOfOrigin: 'Country',
			regionAppellation: 'Region',
			qualityLevel: 'Quality',
			vintage: 'Vintage',
		},
		pace: {
			title: 'At exam pace, if you want it',
			lede: 'The presets are the real exam paces per wine. Turn the clock off and you get the same grid without it.',
			/** By seconds per wine; see TIMER_PRESETS. */
			presets: {
				240: ['Advanced and Master', 'Six wines in 25 minutes'],
				675: ['Certified', 'Four wines in 45 minutes'],
				900: ['WSET Level 3', 'Two wines in 30 minutes'],
			},
		},
		closing: {
			title: 'Pour a glass. Open the grid.',
			lede: 'Free. Tasting solo needs no account; delete your account and everything in it whenever you like.',
			start: 'Start a tasting',
			host: 'Host a flight',
			haveCode: 'I have a code',
		},
		dashboard: {
			eyebrow: 'Your tastings, flights and progress',
			hello: (name: string) => (name ? `Hello, ${name}.` : 'Hello.'),
			recent: 'Recent tastings',
			archive: 'Archive',
			untitled: 'Untitled tasting',
			reveal: 'Reveal',
			noTastings: 'No tastings yet. Start one from the Start button, or below.',
			flights: 'Your flights',
			all: 'All',
			revealed: (n: number, total: number) => `${n} of ${total} revealed`,
			ended: 'Ended',
			noFlights: 'None yet. Host one, or join with a code from the host.',
			progress: 'Progress',
			rolling: 'Rolling average, last five',
			noProgress: 'Reveal a tasting or two and your scores start to show here.',
			seeProgress: 'See progress',
			startTitle: 'Start something',
		},
	},
	{
		hero: {
			eyebrow: 'Prática de prova às cegas para a grelha dedutiva CMS e a WSET Nível 3 SAT',
			title: 'Prove às cegas. Depois veja a que distância ficou.',
			lede: 'Percorra um vinho pela grelha ao ritmo do exame, introduza o que está no rótulo e veja a sua conclusão pontuada campo a campo. Sozinho, ou com o seu grupo de estudo, cada um no seu telemóvel. Grátis.',
			note: 'Guardar provas e os flights precisam de uma conta gratuita. Sem afiliação ao Court of Master Sommeliers nem à WSET.',
		},
		doors: {
			solo: 'Provar sozinho',
			soloBody: 'Um vinho, a grelha, um cronómetro opcional. Não precisa de conta.',
			soloCta: 'Iniciar uma prova',
			host: 'Organizar uma prova de grupo',
			hostBody:
				'Sirva vinhos tapados e numerados e partilhe um código. Cada um prova no seu telemóvel; o anfitrião revela.',
			hostCta: 'Organizar um flight',
			code: 'Tenho um código',
			codeBody: 'Está no ecrã do anfitrião: seis letras e números.',
		},
		modes: {
			title: 'Duas maneiras de provar',
			lede: 'A mesma grelha, a mesma pontuação. Muda quem serve e quem revela.',
			soloTag: 'Sozinho',
			soloKicker: 'Não precisa de conta',
			soloTitle: 'Provar sozinho',
			soloSteps: {
				1: [
					'Escolha a grelha e o cronómetro',
					'CMS ou WSET. Um cronómetro guiado para cada fase, um cronómetro de exame para o vinho inteiro, ou sem cronómetro.',
				],
				2: [
					'Percorra o vinho pela grelha',
					'Vista, nariz, paladar e depois uma conclusão inicial e uma final. Cada resposta fica guardada assim que toca nela.',
				],
				3: [
					'Revele: introduza o rótulo',
					'Destape a garrafa e escreva o que lá está. A fotografia do rótulo é opcional.',
				],
				4: [
					'Veja a sua conclusão pontuada',
					'Campo a campo: Certo, Quase ou Errado. A ficha fica no seu arquivo.',
				],
			},
			soloCta: 'Iniciar uma prova',
			groupTag: 'Flight',
			groupKicker: 'Conta gratuita para todos os participantes',
			groupTitle: 'Provar em grupo',
			groupSteps: {
				1: [
					'O anfitrião serve e tapa os vinhos',
					'Numerados de 1 a 6. Ao criar o flight recebe um código de seis caracteres e um QR para partilhar.',
				],
				2: [
					'Cada um entra no seu telemóvel',
					'Introduza o código ou leia o QR. Cada provador percorre os vinhos pela ordem que quiser, ao seu ritmo.',
				],
				3: [
					'O anfitrião revela cada rótulo uma vez',
					'Só quando o vinho está pronto. Ninguém vê a resposta antes do tempo.',
				],
				4: [
					'Pontuados juntos, no mesmo momento',
					'Todos os que submeteram são comparados com o rótulo, lado a lado, e vê onde o grupo se dividiu na estrutura.',
				],
			},
			groupCta: 'Organizar um flight',
			haveCode: 'Tenho um código',
		},
		after: {
			title: 'Depois da revelação',
			lede: 'A pontuação é o objetivo. O que recebe quando o rótulo está introduzido.',
			scorecard: 'Uma ficha de pontuação',
			scorecardBody:
				'Cada campo da sua conclusão final face ao rótulo. Um ponto por cada acerto exato; Quase assinala os quase acertos, como uma colheita a menos de dois anos.',
			label: 'rótulo',
			tasting: (n) => `Prova ${n}`,
			archive: 'Um arquivo',
			archiveBody:
				'Todas as fichas que guarda, com a conclusão, o rótulo e a pontuação, para voltar atrás e ver como o seu raciocínio se aguentou.',
			archiveRows: {
				1: ['Chambolle-Musigny 2018', 'Pinot Noir · 12 de setembro'],
				2: ['Barolo 2016', 'Nebbiolo · 10 de setembro'],
				3: ['Lote branco do Douro', 'Ainda não revelado · 3 de setembro'],
			},
			reveal: 'Revelar',
			progress: 'Progresso',
			progressBody: 'Se está a melhorar, que castas e países confunde, e onde o seu paladar diverge do grupo.',
			rolling: 'Média móvel, últimas cinco:',
			upFrom: 'subiu de',
			youCall: 'Diz',
			itWas: 'era',
			confusions: {
				1: ['Syrah', 'Grenache', '3 de 4'],
				2: ['Itália', 'Espanha', '2 de 3'],
			},
		},
		columns: {
			grapeVariety: 'Casta',
			countryOfOrigin: 'País',
			regionAppellation: 'Região',
			qualityLevel: 'Qualidade',
			vintage: 'Colheita',
		},
		pace: {
			title: 'Ao ritmo do exame, se quiser',
			lede: 'As predefinições são os ritmos reais do exame por vinho. Desligue o cronómetro e tem a mesma grelha sem ele.',
			presets: {
				240: ['Advanced e Master', 'Seis vinhos em 25 minutos'],
				675: ['Certified', 'Quatro vinhos em 45 minutos'],
				900: ['WSET Nível 3', 'Dois vinhos em 30 minutos'],
			},
		},
		closing: {
			title: 'Sirva um copo. Abra a grelha.',
			lede: 'Grátis. Provar sozinho não precisa de conta; apague a sua conta e tudo o que tem quando quiser.',
			start: 'Iniciar uma prova',
			host: 'Organizar um flight',
			haveCode: 'Tenho um código',
		},
		dashboard: {
			eyebrow: 'As suas provas, flights e progresso',
			hello: (name) => (name ? `Olá, ${name}.` : 'Olá.'),
			recent: 'Provas recentes',
			archive: 'Arquivo',
			untitled: 'Prova sem título',
			reveal: 'Revelar',
			noTastings: 'Ainda não tem provas. Comece uma no botão Começar, ou mais abaixo.',
			flights: 'Os seus flights',
			all: 'Todos',
			revealed: (n, total) => `${n} de ${total} revelados`,
			ended: 'Terminado',
			noFlights: 'Ainda nenhum. Organize um, ou entre com o código do anfitrião.',
			progress: 'Progresso',
			rolling: 'Média móvel, últimas cinco',
			noProgress: 'Revele uma ou duas provas e as suas pontuações começam a aparecer aqui.',
			seeProgress: 'Ver o progresso',
			startTitle: 'Começar',
		},
	},
);
