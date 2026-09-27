'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { type TastingData } from '../../types/TastingData';

type TastingContextValue = {
	tastingData: Partial<TastingData>;
	/** Merges `updates` in. Pass a function when the update depends on the current data. */
	updateTastingData: (
		updates: Partial<TastingData> | ((current: Partial<TastingData>) => Partial<TastingData>),
	) => void;
	resetTastingData: () => void;
	/**
	 * The label photo, resized and ready to upload. Held here rather than on the save page so it
	 * survives the log-in detour that page makes for a signed-out taster, and kept out of
	 * `tastingData` because that object is sent to the API as JSON, which a Blob does not survive.
	 */
	labelPhoto: LabelPhoto | null;
	setLabelPhoto: (photo: LabelPhoto | null) => void;
};

/** The upload-ready JPEG and a data URL of it to preview, made once when the photo is picked. */
export type LabelPhoto = { blob: Blob; preview: string };

const TastingContext = createContext<TastingContextValue | undefined>(undefined);

export const TastingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [tastingData, setTastingData] = useState<Partial<TastingData>>({});
	const [labelPhoto, setLabelPhoto] = useState<LabelPhoto | null>(null);
	const pathname = usePathname();

	// Stable, so pages can list it as an effect dependency.
	const updateTastingData = useCallback<TastingContextValue['updateTastingData']>((updates) => {
		setTastingData((prev) => ({ ...prev, ...(typeof updates === 'function' ? updates(prev) : updates) }));
	}, []);

	const resetTastingData = () => {
		setTastingData({});
		setLabelPhoto(null);
	};

	useEffect(() => {
		const hasData = Object.keys(tastingData).length > 0;
		if (!hasData || !pathname.startsWith('/tastings/')) {
			return;
		}

		const handler = (e: BeforeUnloadEvent) => {
			e.preventDefault();
			e.returnValue = ''; // required for legacy browsers
		};

		window.addEventListener('beforeunload', handler);
		return () => window.removeEventListener('beforeunload', handler);
	}, [tastingData, pathname]);

	return (
		<TastingContext.Provider
			value={{ tastingData, updateTastingData, resetTastingData, labelPhoto, setLabelPhoto }}
		>
			{children}
		</TastingContext.Provider>
	);
};

export const useTastingContext = () => {
	const context = useContext(TastingContext);
	if (!context) {
		throw new Error('useTastingContext must be used within a TastingProvider');
	}
	return context;
};
