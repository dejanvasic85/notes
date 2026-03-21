import { ResultAsync, okAsync } from 'neverthrow';
import { AUTH0_DOMAIN } from '$env/static/private';

import { getClientCredentialToken } from './getToken';
import type { ServerError } from '$lib/types';
import { tryFetchJson } from '$lib/server/serverFetch';

export type UpdateAuthUserParams = {
	authId: string;
	name: string;
};

export const updateAuthUser = ({
	authId,
	name
}: UpdateAuthUserParams): ResultAsync<void, ServerError> => {
	if (!authId.startsWith('auth0|')) {
		// We can only update the user if it's not a social login
		return okAsync(void 0);
	}

	return getClientCredentialToken()
		.andThen(({ access_token }) =>
			tryFetchJson<unknown>(`https://${AUTH0_DOMAIN}/api/v2/users/${authId}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${access_token}`
				},
				body: JSON.stringify({
					name
				})
			})
		)
		.map(() => void 0);
};
