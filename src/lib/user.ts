import db from '$lib/db';
import type { User as PrismaUser } from '@prisma/client';

export interface User extends PrismaUser {}

export interface AuthUserProfile {
	sub: string;
	nickname: string;
	name: string;
	picture: string;
	updated_at: string;
	email: string;
	email_verified: boolean;
}

export async function getAuthUserProfile({
	accessToken
}: {
	accessToken: string;
}): Promise<AuthUserProfile> {
	return fetch(`https://post-it.au.auth0.com/userinfo`, {
		headers: {
			Authorization: `Bearer ${accessToken}`
		}
	}).then((res) => res.json() as Promise<AuthUserProfile>);
}

export async function getUserByAuthId(sub: string): Promise<User | null> {
	return db.user.findUnique({
		where: {
			authId: sub
		}
	});
}

export async function createUser({
	authUserProfile
}: {
	authUserProfile: AuthUserProfile;
}): Promise<User> {
	const { email, email_verified, name, picture, sub } = authUserProfile;
	return db.user.create({
		data: {
			authId: sub,
			name,
			email,
			emailVerified: email_verified,
			picture
		}
	});
}
