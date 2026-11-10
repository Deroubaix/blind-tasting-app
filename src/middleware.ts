import { type NextRequest, NextResponse } from 'next/server';
import { LANG_COOKIE, langOf } from './i18n';
import { errorText } from './i18n/errors';

const SAFE = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Refuses API changes sent from another site. SameSite=Strict already keeps the session cookie off
 * them, but login sets a cookie rather than reading one, and a check here covers every route at once.
 * Browsers send Origin with every POST, PUT, PATCH and DELETE; a request without one isn't a browser's.
 */
export function middleware(request: NextRequest) {
	if (SAFE.has(request.method)) {
		return NextResponse.next();
	}
	const origin = request.headers.get('origin');
	const host = request.headers.get('host');
	const crossSite =
		request.headers.get('sec-fetch-site') === 'cross-site' || (origin !== null && hostOf(origin) !== host);
	if (!crossSite) {
		return NextResponse.next();
	}
	const message = errorText[langOf(request.cookies.get(LANG_COOKIE)?.value)].crossSite;
	return NextResponse.json({ error: 'Forbidden', message, statusCode: 403 }, { status: 403 });
}

function hostOf(origin: string) {
	try {
		return new URL(origin).host;
	} catch {
		return null;
	}
}

export const config = { matcher: '/api/:path*' };
