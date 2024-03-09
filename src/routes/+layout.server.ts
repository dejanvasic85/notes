import type { LayoutServerLoad } from './$types';

export const prerender = true;

export const load: LayoutServerLoad = async ({ locals }) => {
	return {
		isAuthenticated: !!locals.user,
		userData: locals.user
	};
};