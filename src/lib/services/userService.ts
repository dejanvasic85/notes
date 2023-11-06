import { PUBLIC_AUTH0_DOMAIN } from '$env/static/public';
import db from '$lib/db';
import { generateId } from '$lib/identityGenerator';
import type { AuthUserProfile, User } from '$lib/types';

export async function getAuthUserProfile({
	accessToken
}: {
	accessToken: string;
}): Promise<AuthUserProfile> {
	return fetch(`https://${PUBLIC_AUTH0_DOMAIN}/userinfo`, {
		headers: {
			Authorization: `Bearer ${accessToken}`
		}
	}).then((res) => res.json() as Promise<AuthUserProfile>);
}

export async function getUserByAuthId(authId: string): Promise<User | null> {
	const user = await db.user.findUnique({
		where: {
			authId
		}
	});

	if (!user) {
		return null;
	}

	return {
		...user,
		boards: []
	};
}

export async function createUser({
	authUserProfile
}: {
	authUserProfile: AuthUserProfile;
}): Promise<User> {
	const { email, email_verified, name, picture, sub } = authUserProfile;
	return await db.user.create({
		data: {
			id: generateId('uid'),
			authId: sub,
			name,
			email,
			emailVerified: email_verified,
			picture,
			boards: {
				create: [
					{
						id: generateId('bid'),
						noteOrder: []
					}
				]
			}
		},
		include: {
			boards: {
				include: {
					notes: true
				}
			}
		}
	});
}

export function isBoardOwner(user: User, boardId: string): boolean {
	return user.boards.some((board) => board.id === boardId);
}

export async function getUserById(id: string, { boards = true, notes = true } = {}): Promise<User> {
	const user = await db.user.findUniqueOrThrow({
		where: { id },
		include: {
			boards: {
				include: {
					notes
				}
			}
		}
	});

	return {
		...user,
		boards: boards
			? user.boards.map((board) => ({ ...board, notes: notes ? board.notes : [] }))
			: []
	};
}
