import { PUBLIC_BASE_URL } from '$env/static/public';

// Vercel assigns every preview deploy a throwaway host under the team slug, so the
// origin is only known at request time — PUBLIC_BASE_URL is baked in at build time.
const previewOriginPattern = /^https:\/\/[a-z0-9-]+-dejan-vasics-projects\.vercel\.app$/;
const localhostOriginPattern = /^http:\/\/localhost(:\d+)?$/;
const namedOrigins: Readonly<string[]> = [
	'https://notes.vasic.com.au',
	'https://notes-dev.vasic.com.au'
];

const isAllowedOrigin = (origin: string): boolean =>
	origin === PUBLIC_BASE_URL ||
	namedOrigins.includes(origin) ||
	previewOriginPattern.test(origin) ||
	localhostOriginPattern.test(origin);

/**
 * Resolves the origin Auth0 should redirect back to. Falls back to PUBLIC_BASE_URL for
 * anything unrecognised, so a forged Host header can never reach Auth0 as a redirect_uri.
 */
export const getAuthBaseUrl = (url: URL): string =>
	isAllowedOrigin(url.origin) ? url.origin : PUBLIC_BASE_URL;
