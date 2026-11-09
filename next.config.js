/** @type {import('next').NextConfig} */
import path from 'path';
import { fileURLToPath } from 'url';

// This file is ESM (the package is "type": "module"), so __dirname must be derived.
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const dev = process.env.NODE_ENV !== 'production';
// Label photos load from, and upload straight to, the private R2 bucket by signed URL.
const r2 = 'https://*.r2.cloudflarestorage.com';

// Next inlines its hydration scripts, so scripts need 'unsafe-inline' until nonces are wired in.
const csp = [
	"default-src 'self'",
	`script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ''}`,
	"style-src 'self' 'unsafe-inline'",
	`img-src 'self' data: blob: ${r2}`,
	"font-src 'self'",
	`connect-src 'self' ${r2}${dev ? ' ws:' : ''}`,
	"media-src 'self' blob:",
	"object-src 'none'",
	"base-uri 'self'",
	"form-action 'self'",
	"frame-ancestors 'none'",
].join('; ');

const securityHeaders = [
	{ key: 'Content-Security-Policy', value: csp },
	{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
	{ key: 'X-Content-Type-Options', value: 'nosniff' },
	{ key: 'X-Frame-Options', value: 'DENY' },
	{ key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
	{ key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
];

const nextConfig = {
	poweredByHeader: false,
	async headers() {
		return [{ source: '/:path*', headers: securityHeaders }];
	},
	sassOptions: {
		// Lets stylesheets resolve from the styles root, so deep files can reach shared partials
		// without counting `../` hops.
		includePaths: [path.join(__dirname, 'src/styles')],
	},
};

export default nextConfig;
