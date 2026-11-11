import type { MetadataRoute } from 'next';
import ServerConfig from '../config/ServerConfig';

export const dynamic = 'force-dynamic';

export default function robots(): MetadataRoute.Robots {
	if (ServerConfig.getEnvironment() === 'prod') {
		const url = ServerConfig.getAppUrl().replace(/\/$/, '');

		return {
			rules: {
				userAgent: '*',
				allow: '/',
				disallow: [
					'/api/',
					'/account',
					'/tastings',
					'/archives',
					'/progress',
					'/flights',
					'/f/',
					'/reset-password',
					'/logout',
				],
			},
			sitemap: `${url}/sitemap.xml`,
		};
	}

	return {
		rules: {
			userAgent: '*',
			disallow: '/',
		},
	};
}
