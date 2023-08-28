import { Auth0Client, createAuth0Client, User } from '@auth0/auth0-spa-js';
import { writable, type Writable } from 'svelte/store';

export { User };

const AUTH0_CLIENT_ID = 'tSJdy4HqPxk9yA6RnUX0rEhfDVXEQebV';
const AUTH0_DOMAIN = 'post-it.au.auth0.com';
const AUTH0_AUDIENCE = 'https://api.posit-it.com';

const user: Writable<User> = writable();
const accessToken: Writable<string> = writable();

let authClient: Auth0Client;

async function getOrCreateClient() {
	if (authClient || typeof window === 'undefined') {
		return authClient;
	}

	authClient = await createAuth0Client({
		domain: AUTH0_DOMAIN,
		clientId: AUTH0_CLIENT_ID,
		authorizationParams: {
			redirect_uri: window.location.origin,
			audience: AUTH0_AUDIENCE,
			scope: 'openid profile email'
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

async function getToken(): Promise<string> {
	const client = await getOrCreateClient();
	const token = await client?.getTokenSilently();
	return token || '';
}

async function getUser(): Promise<void> {
	const client = await getOrCreateClient();
	try {
		const token = await client?.getTokenSilently();
		accessToken.set(token);
		const userDetails = await client?.getUser();
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

	getToken: () => Promise<string>;
} {
	return { accessToken, user, login, logout, getToken };
}
