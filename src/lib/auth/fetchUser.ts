import { AUTH0_DOMAIN } from '$env/static/private';
import { taskEither as TE } from 'fp-ts';

import { type AuthUserProfile, AuthUserProfileSchema, type ServerError } from '$lib/types';
import { pipe } from 'fp-ts/lib/function';
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

export const fetchAuthUserByEmail = (email: string): TE.TaskEither<ServerError, Auth0User> => {
	return pipe(
		getClientCredentialToken(),
		TE.flatMap(({ access_token }) =>
			tryFetchJson<Auth0User[]>(`https://${AUTH0_DOMAIN}/api/v2/users-by-email?email=${email}`, {
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${access_token}`
				}
			})
		),
		TE.flatMap((data) => {
			if (data.length === 0) {
				return TE.left(createError('RecordNotFound', `Auth user not found`));
			}
			console.log('Found user', data[0]);
			return TE.right(data[0]);
		})
	);
};
