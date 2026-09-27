// @vitest-environment jsdom
import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import Modal from './Modal';

afterEach(cleanup);

function renderConfirm() {
	return render(
		<>
			<button>Delete tasting</button>
			<Modal modalId="confirm" title="Delete this tasting?" closeOnEsc>
				<button>Keep it</button>
				<button>Delete</button>
			</Modal>
		</>,
	);
}

describe('Modal', () => {
	it('is a dialog named by its title', () => {
		renderConfirm();
		expect(screen.getByRole('dialog', { name: 'Delete this tasting?' })).toBeTruthy();
	});

	it('moves focus to the safe choice in its body, not the close button', () => {
		renderConfirm();
		expect(document.activeElement?.textContent).toBe('Keep it');
	});

	it('keeps Tab inside the dialog', () => {
		renderConfirm();
		screen.getByText('Delete', { selector: '.body button' }).focus();
		fireEvent.keyDown(document, { key: 'Tab' });
		expect(document.activeElement?.getAttribute('aria-label')).toBe('Close');
	});

	it('has a labelled close button', () => {
		renderConfirm();
		expect(screen.getByRole('button', { name: 'Close' })).toBeTruthy();
	});
});
