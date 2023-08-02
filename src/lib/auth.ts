import { Auth0Client, createAuth0Client, User } from '@auth0/auth0-spa-js';
import { writable, type Writable } from 'svelte/store';

export { User };

const user: Writable<User> = writable();
const accessToken: Writable<string> = writable();

let authClient: Auth0Client;

async function getOrCreateClient() {
	if (authClient || typeof window === 'undefined') {
		return authClient;
	}

	authClient = await createAuth0Client({
		domain: 'post-it.au.auth0.com',
		clientId: 'tSJdy4HqPxk9yA6RnUX0rEhfDVXEQebV',
		authorizationParams: {
			redirect_uri: window.location.origin
		}
	});

	return authClient;
}

async function login() {
	const client = await getOrCreateClient();
	client?.loginWithRedirect();
}

async function logout() {
	const client = await getOrCreateClient();
	client?.logout();
}

async function getUser(): Promise<void> {
	const client = await getOrCreateClient();
	try {
		const token = await client?.getTokenSilently();
		accessToken.set(token);
		const userDetails = await client?.getUser();
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		user.set(userDetails!);
	} catch (e) {
		console.warn(e);
	}
}

getUser();

export function withAuth(): {
	accessToken: Writable<string>;
	user: Writable<User>;

	login: () => Promise<void>;
	logout: () => Promise<void>;
} {
	return { accessToken, user, login, logout };
}
