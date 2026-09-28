/** "September 28, 2026": the one date format across the app. */
export function formatDate(value: string | Date): string {
	return new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

/** "7:14 PM". */
export function formatTime(value: string | Date): string {
	return new Date(value).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}
