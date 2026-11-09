// @vitest-environment jsdom
import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import FormControl from './FormControl';
import TextInput from './TextInput';

afterEach(cleanup);

describe('FormControl errors', () => {
	it('marks the input invalid and points it at the message', () => {
		render(
			<FormControl name="email" label="Email" error="Enter an email address">
				<TextInput aria-describedby="email-hint" />
			</FormControl>,
		);
		const input = screen.getByRole('textbox', { name: 'Email' });
		expect(input.getAttribute('aria-invalid')).toBe('true');
		expect(input.getAttribute('aria-describedby')).toBe('email-hint form-control-email-error');
		expect(document.getElementById('form-control-email-error')?.textContent).toBe('Enter an email address');
	});

	it('leaves a valid field unmarked', () => {
		render(
			<FormControl name="email" label="Email">
				<TextInput />
			</FormControl>,
		);
		const input = screen.getByRole('textbox', { name: 'Email' });
		expect(input.hasAttribute('aria-invalid')).toBe(false);
		expect(input.hasAttribute('aria-describedby')).toBe(false);
	});
});
