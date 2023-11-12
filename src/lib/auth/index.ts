import { Auth0Client, createAuth0Client, User } from '@auth0/auth0-spa-js';
import { writable, type Writable } from 'svelte/store';
import {
	PUBLIC_AUTH0_AUDIENCE,
	PUBLIC_AUTH0_CLIENT_ID,
	PUBLIC_AUTH0_DOMAIN
} from '$env/static/public';

export { User };

const user: Writable<User> = writable();
const accessToken: Writable<string> = writable();

let authClient: Auth0Client;

async function getOrCreateClient() {
	if (authClient || typeof window === 'undefined') {
		return authClient;
	}

	authClient = await createAuth0Client({
		domain: PUBLIC_AUTH0_DOMAIN,
		clientId: PUBLIC_AUTH0_CLIENT_ID,
		authorizationParams: {
			redirect_uri: window.location.origin,
			audience: PUBLIC_AUTH0_AUDIENCE,
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
	client?.logout({
		logoutParams: {
			returnTo: window.location.origin
		}
	});
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
