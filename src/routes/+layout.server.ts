import { env } from '$env/dynamic/private';

import type { LayoutServerLoad } from './$types';

// Vercel always sets this for git-connected deployments; falls back locally
// and in CI, where there's no deployment to identify.
const localBuildLabel = 'dev';

export const prerender = false;

export const load: LayoutServerLoad = ({ locals }) => {
	return {
		isAuthenticated: !!locals.user,
		userData: locals.user,
		build: env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? localBuildLabel
	};
};
