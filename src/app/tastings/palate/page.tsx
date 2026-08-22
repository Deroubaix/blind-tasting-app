import { type Metadata } from 'next';
import PalateTastingClient from '../../../components/palate/PalateTastingClient';

export const metadata: Metadata = {
	title: 'Palate | Wine Tasting',
};

export default async function PalatePage({ searchParams }: { searchParams: Promise<{ wineType?: string }> }) {
	const { wineType: wineTypeParam } = await searchParams;
	const wineType = (wineTypeParam as 'red' | 'white') || 'red';
	return <PalateTastingClient wineType={wineType} />;
}
