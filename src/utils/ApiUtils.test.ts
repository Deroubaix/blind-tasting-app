import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { errorResponse } from './ApiUtils';
import { JsonApiError } from './ErrorUtils';

// The client's FetchUtils and JsonApiError only understand the `{ error, message, statusCode }`
// envelope, so every failure must come back in it with the right status.
async function respond(error: unknown) {
	const response = errorResponse(error);
	return { status: response.status, body: await response.json() };
}

describe('errorResponse', () => {
	it('passes a deliberate JsonApiError through with its status', async () => {
		const { status, body } = await respond(new JsonApiError('NotFound', 'Not found', 404));
		expect(status).toBe(404);
		expect(body).toEqual({ error: 'NotFound', message: 'Not found', statusCode: 404 });
	});

	it('turns a validation failure into a 400 naming the problem', async () => {
		const result = z.object({ wineType: z.string({ required_error: 'Wine type is required' }) }).safeParse({});
		const { status, body } = await respond(result.success ? null : result.error);
		expect(status).toBe(400);
		expect(body).toEqual({ error: 'BadRequest', message: 'Wine type is required', statusCode: 400 });
	});

	it('turns a body that is not JSON into a 400', async () => {
		const { status, body } = await respond(new SyntaxError('Unexpected token'));
		expect(status).toBe(400);
		expect(body.statusCode).toBe(400);
	});

	it('hides unexpected errors behind a generic 500', async () => {
		const { status, body } = await respond(new Error('connection string with a password in it'));
		expect(status).toBe(500);
		expect(body.message).toBe('Internal Server Error');
	});
});
