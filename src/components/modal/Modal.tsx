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

	const handleCloseButtonClicked: MouseEventHandler<SVGSVGElement> = (e) => {
		e.preventDefault();
		e.stopPropagation();
		closeModal();
	};

	return (
		<div ref={elRef} id={modalId} className={`Modal ${className ?? ''}`} role="dialog" aria-modal="true">
			<div className="overlay" onClick={handleOverlayClicked}></div>
			<div className="inner">
				<div className="content">
					{(title || showClose) && (
						<div className="header">
							<h4>{title}</h4>
							{showClose && (
								<IconX className="close-btn" onClick={handleCloseButtonClicked} stroke={1.5} />
							)}
						</div>
					)}
					{children ? <div className="body">{children}</div> : null}
				</div>
			</div>
		</div>
	);
});
