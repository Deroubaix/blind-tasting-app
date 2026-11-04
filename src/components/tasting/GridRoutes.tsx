'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { gridOf } from '../../data/grids';
import { useTastingContext } from './TastingContext';
import SightTastingClient from '../sight/SightTastingClient';
import NoseTastingClient from '../nose/NoseTastingClient';
import PalateTastingClient from '../palate/PalateTastingClient';
import InitialConclusionTastingClient from './InitialConclusionTastingClient';
import FinalConclusionTastingClient from './FinalConclusionTastingClient';
import WsetAppearanceClient from '../wset/WsetAppearanceClient';
import WsetNoseClient from '../wset/WsetNoseClient';
import WsetPalateClient from '../wset/WsetPalateClient';
import WsetConclusionsClient from '../wset/WsetConclusionsClient';

// Each phase route serves whichever grid the tasting in progress follows. The grid lives in the
// client-side tasting context, so the choice is made here, not in the server page shells.

type Props = { wineType: 'red' | 'white' };

const useWset = () => gridOf(useTastingContext().tastingData.grid) === 'wset';

export function SightRoute({ wineType }: Props) {
	return useWset() ? <WsetAppearanceClient wineType={wineType} /> : <SightTastingClient wineType={wineType} />;
}

export function NoseRoute({ wineType }: Props) {
	return useWset() ? <WsetNoseClient wineType={wineType} /> : <NoseTastingClient wineType={wineType} />;
}

export function PalateRoute({ wineType }: Props) {
	return useWset() ? <WsetPalateClient wineType={wineType} /> : <PalateTastingClient wineType={wineType} />;
}

/** The SAT has no initial conclusion: a WSET tasting that lands here goes on to Conclusions. */
export function InitialConclusionRoute({ wineType }: Props) {
	const wset = useWset();
	const router = useRouter();
	useEffect(() => {
		if (wset) {
			router.replace(`/tastings/final-conclusion?wineType=${wineType}`);
		}
	}, [wset, router, wineType]);
	return wset ? null : <InitialConclusionTastingClient wineType={wineType} />;
}

export function FinalConclusionRoute({ wineType }: Props) {
	return useWset() ? (
		<WsetConclusionsClient wineType={wineType} />
	) : (
		<FinalConclusionTastingClient wineType={wineType} />
	);
}
