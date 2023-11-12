import { PUBLIC_AUTH0_DOMAIN } from '$env/static/public';

import { type AuthUserProfile, AuthUserProfileSchema } from '$lib/types';

export async function fetchAuthUser({
	accessToken
}: {
	accessToken: string;
}): Promise<AuthUserProfile> {
	const resp = await fetch(`https://${PUBLIC_AUTH0_DOMAIN}/userinfo`, {
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
}
