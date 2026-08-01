/*
 * Shared by localCache.ts and the service worker, which purges these on logout.
 * Imports nothing, so pulling it into the service worker bundle costs nothing.
 */
export const boardKeyPrefix = 'board:';
export const friendsKeyPrefix = 'friends:';

export const snapshotKeyPrefixes = [boardKeyPrefix, friendsKeyPrefix];

export function boardKey(userId: string): string {
	return `${boardKeyPrefix}${userId}`;
}

export function friendsKey(userId: string): string {
	return `${friendsKeyPrefix}${userId}`;
}
