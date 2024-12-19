import type { LayoutServerLoad } from './$types';

export const prerender = false;

export const load: LayoutServerLoad = ({ locals }) => {
	return {
		isAuthenticated: !!locals.user,
		userData: locals.user
	};
};
