import { ResultAsync } from 'neverthrow';
import { createRemoteJWKSet, jwtVerify } from 'jose';

import { AUTH0_DOMAIN } from '$env/static/private';
import { withError } from '$lib/server/errorFactory';
import type { ServerError } from '$lib/types';

export interface DecodedToken {
	iss: string;
	sub: string;
	aud: string[];
	iat: number;
	exp: number;
	azp: string;
	scope: string;
}

const AUTH0_JWK_URI = `https://${AUTH0_DOMAIN}/.well-known/jwks.json`;

const JWKS = createRemoteJWKSet(new URL(AUTH0_JWK_URI));

export async function verifyToken<T>(token: string): Promise<T> {
	const { payload } = await jwtVerify(token, JWKS);
	return payload as T;
}

export const tryVerifyToken = <T>(token: string): ResultAsync<T, ServerError> =>
	ResultAsync.fromPromise(
		verifyToken<T>(token),
		withError('AuthorizationError', 'Failed to verify token')
	);
