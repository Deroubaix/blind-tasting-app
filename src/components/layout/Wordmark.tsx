import { BRAND } from '../../data/brand';

export default function Wordmark({ size = 'md' }: { size?: 'sm' | 'md' }) {
	return <span className={`wordmark wordmark--${size}`}>{BRAND.name}</span>;
}
