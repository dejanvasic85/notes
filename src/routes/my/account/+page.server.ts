import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { ResultAsync, Result, ok, err } from 'neverthrow';

import { mapToApiError } from '$lib/server/apiResultMapper';
import { updateUser, getUser } from '$lib/server/db/userDb';
import { tryUpdateAuthUser } from '$lib/server/services/userService';
import type { ServerError, User } from '$lib/types';
import { createError } from '$lib/server/errorFactory';
import { setAuthCookie } from '$lib/auth/session.js';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		return fail(401, {
			errors: {
				_: 'Unauthorized'
			}
		});
	}

	const result = await getUser({ id: locals.user.id }).mapErr(mapToApiError);

	return result.match(
		(user) => ({ name: user.name }),
		() => fail(404, { errors: { _: 'User not found' } })
	);
};

const authorizeUser = (user?: User): Result<User, ServerError> => {
	if (!user) {
		return err(createError('AuthorizationError', 'User not authenticated'));
	}
	return ok(user);
};

type UpdateUserForm = Pick<User, 'name'>;

const validateUpdateUser = (form: UpdateUserForm): Result<string, ServerError> => {
	if (!form.name) {
		return err(createError('ValidationError', 'Name is required'));
	}
	if (form.name.length > 100) {
		return err(createError('ValidationError', 'Display name is too long'));
	}
	return ok(form.name);
};

export const actions = {
	default: async ({ request, locals, cookies }) => {
		const data = await request.formData();
		const name = String(data.get('name'));

		const nameValidation = validateUpdateUser({ name });
		if (nameValidation.isErr()) {
			const apiErr = mapToApiError(nameValidation.error);
			return fail(apiErr.status, { name, errors: { name: apiErr.message } });
		}

		const userAuth = authorizeUser(locals.user);
		if (userAuth.isErr()) {
			const apiErr = mapToApiError(userAuth.error);
			return fail(apiErr.status, { name, errors: { name: apiErr.message } });
		}

		const u = userAuth.value;
		const result = await updateUser({ id: u.id, name })
			.andThen((updatedUser) =>
				ResultAsync.fromPromise(
					setAuthCookie(cookies, updatedUser).then(() => updatedUser),
					() => createError('AuthorizationError', 'Failed to set cookie')
				)
			)
			.andThen((updatedUser) => tryUpdateAuthUser({ email: updatedUser.email!, name }))
			.mapErr(mapToApiError);

		return result.match(
			() => ({ name }),
			({ status, message }) => fail(status, { name, errors: { name: message } })
		);
	}
} satisfies Actions;
