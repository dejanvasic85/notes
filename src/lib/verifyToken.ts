import jwt, { type JwtHeader, type SigningKeyCallback } from 'jsonwebtoken';
import jwks from 'jwks-rsa';

import { PUBLIC_AUTH0_DOMAIN } from '$env/static/public';

export interface DecodedToken {
	iss: string;
	sub: string;
	aud: string[];
	iat: number;
	exp: number;
	azp: string;
	scope: string;
}

const AUTH0_JWK_URI = `https://${PUBLIC_AUTH0_DOMAIN}/.well-known/jwks.json`;

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

export async function verifyToken(token: string): Promise<DecodedToken> {
	return new Promise((resolve, reject) => {
		jwt.verify(token, getKey, {}, (err, payload) => {
			if (err) {
				reject(err);
			} else {
				resolve(payload as DecodedToken);
			}
		});
	});
}
