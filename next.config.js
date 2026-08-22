/** @type {import('next').NextConfig} */
import path from 'path';
import { fileURLToPath } from 'url';

// This file is ESM (the package is "type": "module"), so __dirname must be derived.
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig = {
	serverExternalPackages: ['bcrypt'],
	eslint: {
		// Linting is its own gate — `pnpm lint`. Next runs ESLint during `next build` by default,
		// which turns every lint finding into a failed build. Adding a config to a repo that had
		// never been linted surfaced ~30 pre-existing errors at once; they are tracked separately
		// rather than blocking every build until they are cleared. Remove this once `pnpm lint`
		// is clean.
		ignoreDuringBuilds: true,
	},
	sassOptions: {
		// Lets stylesheets resolve from the styles root, so deep files can reach shared partials
		// without counting `../` hops.
		includePaths: [path.join(__dirname, 'src/styles')],
	},
};

export default nextConfig;
