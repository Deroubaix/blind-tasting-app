import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { ApiError, apiError, errorResponse, readBodyCapped } from './ApiUtils';
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

describe('apiError', () => {
	it('words the message in the request language', async () => {
		const response = errorResponse(apiError(409, 'alreadySubmitted', 2), 'pt');
		expect(response.status).toBe(409);
		expect(await response.json()).toEqual({
			error: 'Conflict',
			message: 'Já submeteu o vinho 2.',
			statusCode: 409,
		});
	});

	it('keeps English as the thrown message, for logs', () => {
		expect(apiError(429, 'tooManyAttempts', 1).message).toBe('Too many attempts. Try again in 1 minute.');
	});

	it('words the generic 500 in the request language too', async () => {
		const response = errorResponse(new Error('secret'), 'pt');
		expect((await response.json()).message).toBe('Erro interno do servidor.');
	});
});

const put = (body: BodyInit, headers: Record<string, string> = {}) =>
	new Request('http://test/upload', { method: 'PUT', body, headers, duplex: 'half' } as RequestInit);

// A body that says nothing about its length up front.
const stream = (sizes: number[]) =>
	new ReadableStream<Uint8Array>({
		start(controller) {
			sizes.forEach((size) => controller.enqueue(new Uint8Array(size)));
			controller.close();
		},
	});

describe('readBodyCapped', () => {
	it('returns a body within the cap', async () => {
		expect((await readBodyCapped(put(new Uint8Array(10)), 10)).length).toBe(10);
	});

	it('refuses on the declared length before reading', async () => {
		await expect(readBodyCapped(put(new Uint8Array(1), { 'content-length': '11' }), 10)).rejects.toMatchObject({
			statusCode: 413,
		});
	});

	it('stops reading a streamed body once it passes the cap', async () => {
		const error = await readBodyCapped(put(stream([6, 6, 6])), 10).catch((e) => e);
		expect(error).toBeInstanceOf(ApiError);
		expect(error.statusCode).toBe(413);
	});
});
