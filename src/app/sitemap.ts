import type { MetadataRoute } from 'next';
import ServerConfig from '../config/ServerConfig';

export const dynamic = 'force-dynamic';

// Only the pages a visitor sees without logging in.
const PUBLIC_PAGES = ['', '/signup', '/login', '/privacy'];

export default function sitemap(): MetadataRoute.Sitemap {
	const url = ServerConfig.getAppUrl().replace(/\/$/, '');

	return PUBLIC_PAGES.map((path) => ({
		url: `${url}${path}`,
		changeFrequency: 'monthly',
		priority: path === '' ? 1 : 0.5,
	}));
}
