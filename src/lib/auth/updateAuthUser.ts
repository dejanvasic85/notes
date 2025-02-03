import { AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, AUTH0_DOMAIN } from '$env/static/private';

let cachedToken: string | undefined = undefined;
const getToken = async () => {
	if (cachedToken) return cachedToken;

	const resp = await fetch(`https://${AUTH0_DOMAIN}/oauth/token`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			client_id: AUTH0_CLIENT_ID,
			client_secret: AUTH0_CLIENT_SECRET,
			audience: `https://${AUTH0_DOMAIN}/api/v2/`,
			grant_type: 'client_credentials'
		})
	});

	if (!resp.ok) {
		const responseText = await resp.text();
		throw new Error(`Failed to fetch token. Status: ${resp.status}. Response: ${responseText}`);
	}

	const { access_token } = await resp.json();
	cachedToken = access_token;
	return access_token;
};

export type UpdateAuthUserParams = {
	authId: string;
	name: string;
};

export const updateAuthUser = async ({ authId, name }: UpdateAuthUserParams) => {
	const token = await getToken();
	const resp = await fetch(`https://${AUTH0_DOMAIN}/api/v2/users/${authId}`, {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		},
		body: JSON.stringify({
			name
		})
	});

	if (!resp.ok) {
		const responseText = await resp.text();
		throw new Error(`Failed to update user. Status: ${resp.status}. Response: ${responseText}`);
	}
};
