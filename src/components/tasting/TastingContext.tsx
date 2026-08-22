'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { type TastingData } from '../../types/TastingData';

type TastingContextValue = {
	tastingData: Partial<TastingData>;
	updateTastingData: (updates: Partial<TastingData>) => void;
	resetTastingData: () => void;
};

const TastingContext = createContext<TastingContextValue | undefined>(undefined);

export const TastingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [tastingData, setTastingData] = useState<Partial<TastingData>>({});
	const pathname = usePathname();

	const updateTastingData = (updates: Partial<TastingData>) => {
		setTastingData((prev) => ({ ...prev, ...updates }));
	};

	const resetTastingData = () => {
		setTastingData({});
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
		<TastingContext.Provider value={{ tastingData, updateTastingData, resetTastingData }}>
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
