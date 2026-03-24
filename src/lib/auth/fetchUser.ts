import { AUTH0_DOMAIN } from '$env/static/private';
import { ResultAsync, errAsync, okAsync } from 'neverthrow';

import { type AuthUserProfile, AuthUserProfileSchema, type ServerError } from '$lib/types';
import { getClientCredentialToken } from './getToken';
import { tryFetchJson } from '$lib/server/serverFetch';
import { createError } from '$lib/server/errorFactory';

type FetchAuthUserParams = {
	accessToken: string;
};

export const fetchAuthUser = async ({
	accessToken
}: FetchAuthUserParams): Promise<AuthUserProfile> => {
	const resp = await fetch(`https://${AUTH0_DOMAIN}/userinfo`, {
		headers: {
			Authorization: `Bearer ${accessToken}`
		}
	});

	if (resp.ok) {
		const profile = await resp.json();
		return AuthUserProfileSchema.parse(profile);
	}

	const text = await resp.text();
	throw new Error(`Failed to fetch auth user. Resp: ${text}, Status: ${resp.status}`);
};

type Auth0User = {
	user_id: string;
};

export const fetchAuthUserByEmail = (email: string): ResultAsync<Auth0User, ServerError> =>
	getClientCredentialToken()
		.andThen(({ access_token }) =>
			tryFetchJson<Auth0User[]>(`https://${AUTH0_DOMAIN}/api/v2/users-by-email?email=${email}`, {
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${access_token}`
				}
			})
		)
		.andThen((data) => {
			if (data.length === 0) {
				return errAsync<Auth0User, ServerError>(
					createError('RecordNotFound', `Auth user not found`)
				);
			}
			return okAsync(data[0]);
		});
