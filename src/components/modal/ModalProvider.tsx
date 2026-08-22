'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { v4 as uuid } from 'uuid';
import Modal, { type ModalImperativeRef, type ModalProps } from './Modal';

export type OpenModal = Omit<ModalProps, 'modalId'> & Partial<Pick<ModalProps, 'modalId'>>;

export type ModalProviderValue = {
	modals: ModalProps[];
	openModal: (modal: OpenModal) => string;
	closeModal: (modalId: string) => void;
	closeAllModals: () => void;
};

export const ModalProviderContext = createContext<ModalProviderValue | null>(null);

export type ModalProviderProps = {
	children?: ReactNode;
};

/**
 * Ported from dr-pam's `common-components/Components/Modal/ModalProvider`. Same API — `openModal`
 * returns the id, `closeModal` goes through the child's imperative handle so the exit animation
 * plays before the modal is dropped from the list.
 *
 * `openModal` takes an optional `modalId` (mirroring this repo's `ToastProvider`) rather than
 * mutating the caller's props object to backfill one, which is what the original did.
 */
export default function ModalProvider(props: ModalProviderProps) {
	const { children } = props;

	const modalRefs = useRef<Map<string, ModalImperativeRef>>(new Map());
	const [modals, setModals] = useState<ModalProps[]>([]);

	const openModal = (modal: OpenModal) => {
		const modalId = modal.modalId ?? uuid();
		setModals((current) => [...current, { ...modal, modalId }]);
		return modalId;
	};

	const handleModalClosed = useCallback((modalId: string) => {
		setModals((current) => {
			current.find((modal) => modal.modalId === modalId)?.onClose?.(modalId);
			return current.filter((modal) => modal.modalId !== modalId);
		});
	}, []);

	const closeModal = useCallback((modalId: string) => {
		modalRefs.current.get(modalId)?.close();
	}, []);

	const closeAllModals = useCallback(() => {
		modalRefs.current.forEach((modalRef) => modalRef.close());
	}, []);

	const setModalRef = (modalId: string, ref: ModalImperativeRef | null) => {
		if (!ref) {
			modalRefs.current.delete(modalId);
		} else {
			modalRefs.current.set(modalId, ref);
		}
	};

	// Owned here rather than in each Modal: with the lock in the child, closing one of two stacked
	// modals would restore scrolling while the other was still up.
	useEffect(() => {
		document.body.style.overflow = modals.length > 0 ? 'hidden' : '';
		return () => {
			document.body.style.overflow = '';
		};
	}, [modals.length]);

	const value: ModalProviderValue = { modals, openModal, closeModal, closeAllModals };

	return (
		<ModalProviderContext.Provider value={value}>
			{children}
			{modals.length > 0 && (
				<div className="ModalProvider">
					{modals.map((modalProps) => (
						<Modal
							key={modalProps.modalId}
							{...modalProps}
							onClose={handleModalClosed}
							ref={(ref) => setModalRef(modalProps.modalId, ref)}
						/>
					))}
				</div>
			)}
		</ModalProviderContext.Provider>
	);
}

export function useModalProvider() {
	const context = useContext(ModalProviderContext);

	if (!context) {
		throw new Error('useModalProvider must be used within a ModalProvider');
	}

	return context;
}
