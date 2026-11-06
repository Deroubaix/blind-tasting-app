'use client';

import { useSyncExternalStore } from 'react';
import { formatShortDate } from '../../utils/DateUtils';
import { useLang } from '../../i18n/LanguageProvider';

const noSubscription = () => () => {};

/** "Nov 4" in the reader's own time zone; the server, not knowing it, renders UTC. */
export default function ShortDate({ iso }: { iso: string }) {
	const { lang } = useLang();
	const timeZone = useSyncExternalStore(
		noSubscription,
		() => undefined,
		() => 'UTC',
	);
	return <>{iso ? formatShortDate(iso, lang, timeZone) : ''}</>;
}
