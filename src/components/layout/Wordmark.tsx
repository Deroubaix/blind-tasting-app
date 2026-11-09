import { BRAND } from '../../data/brand';

// The glass is the mark: it stays if the name changes.
export function GlassMark({ size = 20 }: { size?: number }) {
	return (
		<svg
			className="glass-mark"
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<path d="M6.6 8c1 3.6 3 5.6 5.4 5.6s4.4-2 5.4-5.6Z" fill="var(--c-link)" stroke="none" />
			<path d="M5 2.5h14c0 6.5-2.2 10.5-7 11.5v6.5M8.5 21h7" />
		</svg>
	);
}

export default function Wordmark({ size = 'md' }: { size?: 'sm' | 'md' }) {
	return (
		<span className={`wordmark wordmark--${size}`}>
			<GlassMark size={size === 'sm' ? 18 : 20} />
			<span className="wordmark__name">{BRAND.name}</span>
		</span>
	);
}
