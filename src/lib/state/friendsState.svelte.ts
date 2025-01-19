import { getContext, setContext } from 'svelte';

import type { Friend, UserInvite, UserInviteWithUserProps } from '$lib/types';

export class FriendsState {
	currentUserId: string;
	friends: Friend[] = $state([]);
	pendingSentInvites: UserInvite[] = $state([]);
	pendingReceivedInvites: UserInviteWithUserProps[] = $state([]);

	constructor(currentUserId: string) {
		this.currentUserId = currentUserId;
	}

	setState(
		friends: Friend[],
		pendingSentInvites: UserInviteWithUserProps[],
		pendingReceivedInvites: UserInviteWithUserProps[]
	) {
		this.friends = friends;
		this.pendingSentInvites = pendingSentInvites;
		this.pendingReceivedInvites = pendingReceivedInvites;
	}
}

const FriendsStateKey = Symbol('FriendsState');

export function setFriendsState(currentUserId: string) {
	return setContext(FriendsStateKey, new FriendsState(currentUserId));
}

export function getFriendsState() {
	return getContext<ReturnType<typeof setFriendsState>>(FriendsStateKey);
}
