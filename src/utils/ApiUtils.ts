import { z } from 'zod';
import { JsonApiError } from './ErrorUtils';
import { DEFAULT_LANG, type Lang } from '../i18n';
import { type ErrorArgs, type ErrorKey, errorText } from '../i18n/errors';
import { translateValidation } from './FormUtils';

// zod's own wording ("Invalid input: expected string, received undefined"), as opposed to the schemas' messages.
const ZOD_DEFAULT = /^(Invalid|Too (big|small)|Unrecognized)\b/;

const STATUS_NAMES: Record<number, string> = {
	400: 'BadRequest',
	401: 'Unauthorized',
	403: 'Forbidden',
	404: 'NotFound',
	409: 'Conflict',
	413: 'PayloadTooLarge',
	429: 'TooManyRequests',
};

function errorMessage<K extends ErrorKey>(lang: Lang, key: K, args: ErrorArgs<K>): string {
	const text = errorText[lang][key];
	return typeof text === 'function' ? (text as (...a: ErrorArgs<K>) => string)(...args) : (text as string);
}

/** A deliberate refusal named by its `errorText` key, so `errorResponse` can word it in the request's language. */
export class ApiError<K extends ErrorKey = ErrorKey> extends JsonApiError {
	constructor(
		statusCode: number,
		public readonly key: K,
		public readonly args: ErrorArgs<K>,
		error = STATUS_NAMES[statusCode] ?? 'Error',
	) {
		super(error, errorMessage(DEFAULT_LANG, key, args), statusCode);
	}

	public messageIn(lang: Lang) {
		return errorMessage(lang, this.key, this.args);
	}
}

export const apiError = <K extends ErrorKey>(statusCode: number, key: K, ...args: ErrorArgs<K>) =>
	new ApiError(statusCode, key, args);

export function jsonResponse(body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'Content-Type': 'application/json' },
	});
}

/**
 * Renders any thrown value as the `{ error, message, statusCode }` envelope that FetchUtils and
 * JsonApiError on the client are built to parse. `statusCode` is always present — without it
 * `JsonApiError.isJsonApiError` rejects the body and the client loses the status.
 */
export function errorResponse(error: unknown, lang: Lang = DEFAULT_LANG, fallbackStatus = 500): Response {
	const fail = (status: number, name: string, message: string) =>
		jsonResponse({ error: name, message, statusCode: status }, status);

	if (error instanceof z.ZodError) {
		const message = error.issues[0]?.message;
		const shown = !message || ZOD_DEFAULT.test(message) ? errorText[lang].invalidRequest : message;
		return fail(400, 'BadRequest', translateValidation(shown, lang));
	}

	// `request.json()` throws a SyntaxError on a body that is not JSON: the client's mistake, so a 400.
	if (error instanceof SyntaxError) {
		return fail(400, 'BadRequest', errorText[lang].invalidJson);
	}

	if (error instanceof ApiError) {
		return fail(error.statusCode!, error.error, error.messageIn(lang));
	}

	const apiError = JsonApiError.create(error);

	// Only errors thrown deliberately carry a statusCode; anything else gets a generic message, never its own.
	if (apiError.statusCode === undefined) {
		return fail(fallbackStatus, 'InternalServerError', errorText[lang].internal);
	}

	return jsonResponse(JsonApiError.toJson(apiError), apiError.statusCode);
}

/** No request needs more; deeper is refused before anything walks it. */
const MAX_DEPTH = 32;
const LONE_SURROGATE = /[\ud800-\udbff](?![\udc00-\udfff])|(?<![\ud800-\udbff])[\udc00-\udfff]/;
const unstorable = (text: string) => text.includes('\0') || LONE_SURROGATE.test(text);

/** Walked with a stack, not recursion, so deep nesting can't overflow it. */
function isStorable(body: unknown): boolean {
	const stack: { value: unknown; depth: number }[] = [{ value: body, depth: 0 }];
	while (stack.length) {
		const { value, depth } = stack.pop()!;
		if (typeof value === 'string') {
			if (unstorable(value)) {
				return false;
			}
		} else if (value !== null && typeof value === 'object') {
			if (depth >= MAX_DEPTH) {
				return false;
			}
			for (const [key, child] of Object.entries(value)) {
				if (unstorable(key)) {
					return false;
				}
				stack.push({ value: child, depth: depth + 1 });
			}
		}
	}
	return true;
}

/** The JSON body, refused as a 400 if it holds what Postgres can't store (NUL, half a surrogate pair) or nests absurdly. */
export async function readJson(request: Request): Promise<unknown> {
	const body: unknown = await request.json();
	if (!isStorable(body)) {
		throw apiError(400, 'invalidRequest');
	}
	return body;
}

export function logServerError(context: string, error: unknown): void {
	const message = error instanceof Error ? error.message : String(error);
	process.stderr.write(`Error in ${context}: ${message}\n`);
}

/** A request body read up to `max` bytes; past that it stops reading and refuses with 413. */
export async function readBodyCapped(request: Request, max: number): Promise<Buffer> {
	if (Number(request.headers.get('content-length') ?? 0) > max) {
		throw apiError(413, 'photoTooLarge');
	}
	const chunks: Uint8Array[] = [];
	let total = 0;
	const reader = request.body?.getReader();
	while (reader) {
		const { done, value } = await reader.read();
		if (done) {
			break;
		}
		total += value.byteLength;
		if (total > max) {
			await reader.cancel();
			throw apiError(413, 'photoTooLarge');
		}
		chunks.push(value);
	}
	return Buffer.concat(chunks);
}
