import { fail, type Actions } from '@sveltejs/kit';
import { pipe } from 'fp-ts/lib/function';
import { taskEither as TE, either as E } from 'fp-ts';

import { mapToApiError } from '$lib/server/apiResultMapper';
import { updateUser, getUser } from '$lib/server/db/userDb';
import { tryUpdateAuthUser } from '$lib/server/services/userService';
import type { ServerError, User } from '$lib/types';
import { createError } from '$lib/server/errorFactory';
import { setAuthCookie } from '$lib/auth/session.js';

export const load = async ({ locals }) => {
	if (!locals.user) {
		return fail(401, {
			errors: {
				_: 'Unauthorized'
			}
		});
	}

	return pipe(
		getUser({ id: locals.user.id }),
		TE.mapLeft(mapToApiError),
		TE.match(
			() => fail(404, { errors: { _: 'User not found' } }),
			// @ts-ignore: fp-ts is expecting the same return types
			(user) => ({ name: user.name })
		)
	)();
};

const authorizeUser = (user?: User): E.Either<ServerError, User> => {
	if (!user) {
		return E.left(createError('AuthorizationError', 'User not authenticated'));
	}
	return E.right(user);
};

type UpdateUserForm = Pick<User, 'name'>;

const validateUpdateUser = (form: UpdateUserForm): E.Either<ServerError, string> => {
	if (!form.name) {
		return E.left(createError('ValidationError', 'Name is required'));
	}
	if (form.name.length > 100) {
		return E.left(createError('ValidationError', 'Display name is too long'));
	}
	return E.right(form.name);
};

export const actions = {
	default: async ({ request, locals, cookies }) => {
		const data = await request.formData();
		const name = String(data.get('name'));

		return pipe(
			validateUpdateUser({ name }),
			E.flatMap(() => authorizeUser(locals.user)),
			TE.fromEither,
			TE.flatMap((u) => updateUser({ id: u.id, name: name })),
			TE.flatMap((u) => {
				setAuthCookie(cookies, u);
				return TE.right(u);
			}),
			TE.flatMap((u) => tryUpdateAuthUser({ email: u.email!, name: name })),
			TE.mapLeft(mapToApiError),
			TE.match(
				({ status, message }) =>
					// @ts-ignore: fp-ts is expecting the same return types
					fail(status, {
						name,
						errors: { name: message }
					}),
				() => ({
					name
				})
			)
		)();
	}
} satisfies Actions;
