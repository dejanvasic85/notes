/*
 * Shared by localCache.ts and the service worker, which purges these on logout.
 * Imports nothing, so pulling it into the service worker bundle costs nothing.
 */
export const boardKeyPrefix = 'board:';
export const friendsKeyPrefix = 'friends:';
export const queueKeyPrefix = 'queue:';

/*
 * The write queue is included here deliberately, not just the read caches:
 * an unsynced queue surviving into a different user's session on a shared
 * device is worse than losing an edit made offline right before logging out.
 */
export const snapshotKeyPrefixes = [boardKeyPrefix, friendsKeyPrefix, queueKeyPrefix];

export function boardKey(userId: string): string {
	return `${boardKeyPrefix}${userId}`;
}

export function friendsKey(userId: string): string {
	return `${friendsKeyPrefix}${userId}`;
}

export function queueKey(userId: string): string {
	return `${queueKeyPrefix}${userId}`;
}
