import { redirect } from 'next/navigation';

/** The short link on the host's screen and in the QR code. */
export default async function ShortFlightLink({ params }: { params: Promise<{ code: string }> }) {
	const { code } = await params;
	redirect(`/flights/${code.toUpperCase()}`);
}
