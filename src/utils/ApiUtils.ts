import { z } from 'zod';
import { JsonApiError } from './ErrorUtils';

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
export function errorResponse(error: unknown, fallbackStatus = 500): Response {
	if (error instanceof z.ZodError) {
		const message = error.issues[0]?.message ?? 'Invalid request';
		return jsonResponse({ error: 'BadRequest', message, statusCode: 400 }, 400);
	}

	const apiError = JsonApiError.create(error);

	// Only errors thrown deliberately carry a statusCode. Anything else is an unexpected failure,
	// so return a generic message rather than leaking an internal one to the client.
	if (apiError.statusCode === undefined) {
		return jsonResponse(
			{ error: 'InternalServerError', message: 'Internal Server Error', statusCode: fallbackStatus },
			fallbackStatus,
		);
	}

	return jsonResponse(JsonApiError.toJson(apiError), apiError.statusCode);
}

export function logServerError(context: string, error: unknown): void {
	const message = error instanceof Error ? error.message : String(error);
	process.stderr.write(`Error in ${context}: ${message}\n`);
}
