import { fail } from '@sveltejs/kit';
import { pipe } from 'fp-ts/lib/function';
import { taskEither as TE } from 'fp-ts';

import { mapToApiError } from '$lib/server/mapApi';
import { updateUser, getUser } from '$lib/server/db/userDb';

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
			(user) => ({ displayName: user.name })
		)
	)();
};

export const actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, {
				errors: {
					_: 'Unauthorized'
				}
			});
		}

		const data = await request.formData();
		const displayName = String(data.get('displayName'));
		if (!displayName) {
			return fail(400, {
				errors: {
					displayName: 'Display name is required'
				}
			});
		}

		return pipe(
			updateUser({ id: locals.user.id, name: displayName }),
			TE.mapLeft(mapToApiError),
			TE.match(
				// @ts-ignore: fp-ts is expecting the same return types
				({ status, message }) => fail(status, { message, status }),
				() => ({
					displayName
				})
			)
		)();
	}
};
