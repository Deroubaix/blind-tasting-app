import { BRAND } from '../../data/brand';

/** The name as a wordmark: one italic serif accent and a double underline, like a ledger's title. */
export default function Wordmark({ size = 'md' }: { size?: 'sm' | 'md' }) {
	const { pre, em, post } = BRAND.wordmark;
	return (
		<span className={`wordmark wordmark--${size}`}>
			{pre}
			<em>{em}</em>
			{post}
		</span>
	);
}
