import { taskEither as TE } from 'fp-ts';
import { AUTH0_DOMAIN } from '$env/static/private';

import { getClientCredentialToken } from './getToken';
import type { ServerError } from '$lib/types';
import { pipe } from 'fp-ts/lib/function';
import { tryFetchJson } from '$lib/server/serverFetch';

export type UpdateAuthUserParams = {
	authId: string;
	name: string;
};

export const updateAuthUser = ({
	authId,
	name
}: UpdateAuthUserParams): TE.TaskEither<ServerError, void> => {
	if (!authId.startsWith('auth0|')) {
		// We can only update the user if it's not a social login
		return TE.right(void 0);
	}

	return pipe(
		getClientCredentialToken(),
		TE.flatMap(({ access_token }) =>
			tryFetchJson(`https://${AUTH0_DOMAIN}/api/v2/users/${authId}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${access_token}`
				},
				body: JSON.stringify({
					name
				})
			})
		),
		TE.map(() => void 0)
	);
};
