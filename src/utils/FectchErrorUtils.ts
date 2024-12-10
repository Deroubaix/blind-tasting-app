import { AbortType } from './AbortUtils';

export default class FetchUtilsError extends Error {
	constructor(
		message: string,
		public readonly type: AbortType,
		public readonly status: number,
		public readonly response?: unknown,
	) {
		super(message);
	}
}