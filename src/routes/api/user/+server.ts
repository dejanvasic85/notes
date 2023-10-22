import { json, type RequestHandler } from '@sveltejs/kit';
import { getUserById } from '$lib/services/userService';

export const GET: RequestHandler = async ({ locals }) => {
	const { id } = locals.user;

	const user = await getUserById(id!);

	return json(user);
};
