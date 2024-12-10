export enum AbortType {
	EXPLICIT,
	UNMOUNT,
	UNKNOWN,
}

export type AbortFunction = (type: AbortType) => void;
export type RegisterAbortFunction = (abort: AbortFunction) => () => void;