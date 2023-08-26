import jwt, { type JwtHeader, type SigningKeyCallback } from 'jsonwebtoken';
import jwks from 'jwks-rsa';

const client = jwks({
	jwksUri: 'https://post-it.au.auth0.com/.well-known/jwks.json'
});

let cachedKey: string | undefined = undefined;

function getKey(header: JwtHeader, callback: SigningKeyCallback) {
	client.getSigningKey(header.kid, function (err, key) {
		if (cachedKey) {
			callback(null, cachedKey);
		} else {
			const signingKey = key?.getPublicKey();
			cachedKey = signingKey;
			callback(null, signingKey);
		}
	});
}

export async function verifyToken(token: string): Promise<boolean> {
	return new Promise((resolve, reject) => {
		jwt.verify(token, getKey, {}, (err) => {
			if (err) {
				reject(err);
			} else {
				resolve(true);
			}
		});
	});
}
