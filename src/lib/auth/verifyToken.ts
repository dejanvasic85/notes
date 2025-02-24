import { taskEither as TE } from 'fp-ts';

import jwt, { type JwtHeader, type SigningKeyCallback } from 'jsonwebtoken';
import jwks from 'jwks-rsa';

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

const client = jwks({
	jwksUri: AUTH0_JWK_URI
});

let cachedKey: string | undefined = undefined;

function getKey(header: JwtHeader, callback: SigningKeyCallback) {
	client.getSigningKey(header.kid, function (err, key) {
		if (err) {
			callback(err);
		}
		if (cachedKey) {
			callback(null, cachedKey);
		} else {
			const signingKey = key?.getPublicKey();
			cachedKey = signingKey;
			callback(null, signingKey);
		}
	});
}

export async function verifyToken<T>(token: string): Promise<T> {
	return new Promise((resolve, reject) => {
		jwt.verify(token, getKey, {}, (err, payload) => {
			if (err) {
				reject(err);
			} else {
				resolve(payload as T);
			}
		});
	});
}

export const tryVerifyToken = <T>(token: string): TE.TaskEither<ServerError, T> => {
	return TE.tryCatch(
		async () => {
			try {
				return verifyToken(token);
			} catch (error) {
				throw new Error(`Failed to verify token. Error: ${error}`);
			}
		},
		withError('AuthorizationError', 'Failed to verify token')
	);
};
