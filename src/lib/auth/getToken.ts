import type { taskEither as TE } from 'fp-ts';
import { pipe } from 'fp-ts/lib/function';
import { z } from 'zod';

import { AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, AUTH0_DOMAIN } from '$env/static/private';
import { PUBLIC_BASE_URL } from '$env/static/public';
import type { ServerError } from '$lib/types';
import { tryFetchJson } from '$lib/server/serverFetch';

interface GetTokenParams {
	code: string;
}

export const GetTokenResponseSchema = z.object({
	access_token: z.string(),
	id_token: z.string(),
	scope: z.string(),
	expires_in: z.number(),
	token_type: z.string()
});

export type GetTokenResponse = z.infer<typeof GetTokenResponseSchema>;

export const getToken = ({
	code
}: GetTokenParams): TE.TaskEither<ServerError, GetTokenResponse> => {
	return pipe(
		tryFetchJson(`https://${AUTH0_DOMAIN}/oauth/token`, {
			method: 'POST',
			body: JSON.stringify({
				code,
				client_id: AUTH0_CLIENT_ID,
				client_secret: AUTH0_CLIENT_SECRET,
				redirect_uri: `${PUBLIC_BASE_URL}/api/auth/callback`,
				grant_type: 'authorization_code'
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		})
	);
};
