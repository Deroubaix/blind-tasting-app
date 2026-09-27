import { type EntryStatus } from '../components/flights/flightLogic';
import { type ComparedField, type Reveal } from '../components/archives/revealScore';

export type FlightRole = 'host' | 'taster' | 'visitor';

/** A taster as the flight shows them: initial and a tint by join order. */
export type FlightPerson = { id: string; name: string; initial: string; tint: number };

export type FlightMemberView = FlightPerson & {
	/** The wine they have open, and when its clock runs out (null when untimed). */
	tastingWine: number | null;
	endsAt: string | null;
	/** The last wine they submitted, while it waits for the reveal. */
	waitingOn: number | null;
	submittedCount: number;
	/** Over revealed wines they submitted. */
	total: number;
	outOf: number;
};

export type FlightWineView = {
	number: number;
	revealed: boolean;
	title: string | null;
	detail: string | null;
	statuses: Record<string, EntryStatus>;
	submitted: number;
	average: number | null;
	best: number | null;
	/** Fields the label gave, so what each score is out of. */
	outOf: number | null;
};

/** The viewer's own go at each wine (tasters only). */
export type MyWineView = {
	number: number;
	status: EntryStatus;
	startedAt: string | null;
	endsAt: string | null;
	submittedAt: string | null;
	score: number | null;
	outOf: number | null;
};

export type FlightView = {
	code: string;
	name: string;
	wineCount: number;
	timerSeconds: number | null;
	ended: boolean;
	createdAt: string;
	host: { id: string; name: string };
	role: FlightRole;
	members: FlightMemberView[];
	wines: FlightWineView[];
	mine: MyWineView[] | null;
};

export type WineResultRow = {
	person: FlightPerson;
	status: EntryStatus;
	score: number | null;
	outOf: number | null;
	fields: ComparedField[] | null;
	headline: string | null;
	detail: string | null;
	wineType: 'red' | 'white' | null;
	palate: Record<string, string> | null;
	nose: string[];
	/** Clock left at submission, "0:48 left"; null when untimed. */
	submittedLeft: string | null;
	/** The viewer's own tasting, for "Full tasting sheet". */
	tastingId: string | null;
};

export type WineResults = {
	code: string;
	flightName: string;
	wineCount: number;
	number: number;
	reveal: Reveal;
	title: string;
	detail: string;
	wineType: 'red' | 'white' | null;
	rows: WineResultRow[];
	average: number | null;
	outOf: number;
	best: { score: number; outOf: number; name: string } | null;
	submitted: number;
	memberCount: number;
};

export type FlightSummary = {
	code: string;
	name: string;
	createdAt: string;
	hostName: string;
	timerSeconds: number | null;
	members: FlightPerson[];
	wines: {
		number: number;
		revealed: boolean;
		title: string | null;
		grape: string | null;
		average: number | null;
		outOf: number | null;
		/** personId → score, or null for not submitted. */
		scores: Record<string, { score: number; outOf: number } | null>;
	}[];
	totals: Record<string, { score: number; outOf: number; submitted: number }>;
	groupAverage: number | null;
	/** What the group average is out of, when every revealed wine is scored out of the same. */
	groupOutOf: number | null;
	mostConfused: { number: number; title: string; average: number; outOf: number; note: string | null } | null;
};

export type FlightListItem = {
	code: string;
	name: string;
	role: 'host' | 'taster';
	wineCount: number;
	revealed: number;
	memberCount: number;
	ended: boolean;
	createdAt: string;
};
