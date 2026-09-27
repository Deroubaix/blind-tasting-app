'use client';

import { IconX } from '@tabler/icons-react';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import type { MouseEventHandler, ReactNode } from 'react';

export type ModalProps = {
	modalId: string;
	className?: string;
	closeOnClickOutside?: boolean;
	closeOnEsc?: boolean;
	children?: ReactNode;
	title?: ReactNode;
	onClose?: (modalId: string) => void;
	showClose?: boolean;
};

const FOCUSABLE =
	'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

export type ModalImperativeRef = {
	close: () => void;
};

/**
 * A `closing` class drives the exit animation, with a 60ms hand-off before the provider
 * unmounts the modal.
 */
export default forwardRef<ModalImperativeRef, ModalProps>(function Modal(props, ref) {
	const { className, children, modalId, title, onClose, closeOnClickOutside, closeOnEsc } = props;
	const showClose = props.showClose ?? true;

	const elRef = useRef<HTMLDivElement>(null);
	const innerRef = useRef<HTMLDivElement>(null);
	const titleId = `${modalId}-title`;

	// Keyboard focus moves into the dialog when it opens and goes back where it came from when it
	// closes, so a keyboard or screen-reader user is neither left behind it nor lost after it.
	useEffect(() => {
		const previous = document.activeElement as HTMLElement | null;
		// The body's first control rather than the header's close button: in a confirmation that
		// is the safe choice ("Keep it", "Keep tasting"), not the destructive one.
		const inner = innerRef.current;
		const first =
			inner?.querySelector('.body')?.querySelector<HTMLElement>(FOCUSABLE) ??
			inner?.querySelector<HTMLElement>(FOCUSABLE);
		(first ?? inner)?.focus();
		return () => previous?.focus?.();
	}, []);

	const closeModal = useCallback(() => {
		if (elRef.current) {
			elRef.current.classList.add('closing');
			setTimeout(() => {
				onClose?.(modalId);
			}, 60);
		} else {
			onClose?.(modalId);
		}
	}, [onClose, modalId]);

	useImperativeHandle(ref, () => ({ close: closeModal }), [closeModal]);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (closeOnEsc && e.key === 'Escape') {
				e.preventDefault();
				e.stopPropagation();
				closeModal();
				return;
			}
			// Tab cycles within the dialog rather than escaping to the page behind it.
			if (e.key === 'Tab' && innerRef.current) {
				const focusable = [...innerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
				if (focusable.length === 0) {
					return;
				}
				const first = focusable[0];
				const last = focusable[focusable.length - 1];
				if (e.shiftKey && document.activeElement === first) {
					e.preventDefault();
					last.focus();
				} else if (!e.shiftKey && document.activeElement === last) {
					e.preventDefault();
					first.focus();
				}
			}
		};
		document.addEventListener('keydown', handleKeyDown);
		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [closeModal, closeOnEsc]);

	const handleOverlayClicked: MouseEventHandler<HTMLDivElement> = (e) => {
		if (closeOnClickOutside) {
			e.preventDefault();
			e.stopPropagation();
			closeModal();
		}
	};

	const handleCloseButtonClicked: MouseEventHandler<HTMLButtonElement> = (e) => {
		e.preventDefault();
		e.stopPropagation();
		closeModal();
	};

	return (
		<div
			ref={elRef}
			id={modalId}
			className={`Modal ${className ?? ''}`}
			role="dialog"
			aria-modal="true"
			aria-labelledby={title ? titleId : undefined}
		>
			<div className="overlay" onClick={handleOverlayClicked}></div>
			<div className="inner" ref={innerRef} tabIndex={-1}>
				<div className="content">
					{(title || showClose) && (
						<div className="header">
							<h4 id={titleId}>{title}</h4>
							{showClose && (
								<button className="close-btn" onClick={handleCloseButtonClicked} aria-label="Close">
									<IconX stroke={1.5} aria-hidden="true" />
								</button>
							)}
						</div>
					)}
					{children ? <div className="body">{children}</div> : null}
				</div>
			</div>
		</div>
	);
});
