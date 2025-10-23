import { getContext, setContext } from 'svelte';

import type { Friend, UserInvite, UserInviteWithUserProps } from '$lib/types';

export class FriendsState {
	currentUserId: string;
	friends: Friend[] = $state([]);
	pendingSentInvites: UserInvite[] = $state([]);
	pendingReceivedInvites: UserInviteWithUserProps[] = $state([]);
	loading: boolean = $state(true);

	constructor(currentUserId: string) {
		this.currentUserId = currentUserId;
	}

	setLoading(loading: boolean) {
		this.loading = loading;
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

	cancelInvite(inviteId: string): [number, UserInvite] {
		const [index, invite, newArray] = removeValueWithId(this.pendingSentInvites, inviteId);
		this.pendingSentInvites = newArray;
		return [index, invite];
	}

	addInviteAtIndex(index: number, invite: UserInvite) {
		this.pendingSentInvites.splice(index, 0, invite);
	}

	removeFriend(friendId: string): [number, Friend] {
		const [index, friend, newArray] = removeValueWithId(this.friends, friendId);
		this.friends = newArray;
		return [index, friend];
	}

	addFriendAtIndex(index: number, friend: Friend) {
		this.friends.splice(index, 0, friend);
	}

	acceptInvite(inviteId: string): [number, UserInviteWithUserProps] {
		const [index, invite, newArray] = removeValueWithId(this.pendingReceivedInvites, inviteId);
		this.pendingReceivedInvites = newArray;
		this.friends.push({
			id: invite.userId,
			email: invite.friendEmail,
			name: invite.user.name,
			picture: invite.user.picture
		});
		return [index, invite];
	}

	addReceivedInviteAtIndex(index: number, invite: UserInviteWithUserProps) {
		this.pendingReceivedInvites.splice(index, 0, invite);
	}

	rejectInvite(inviteId: string): [number, UserInviteWithUserProps] {
		const [index, invite, newArray] = removeValueWithId(this.pendingReceivedInvites, inviteId);
		this.pendingReceivedInvites = newArray;
		return [index, invite];
	}
}

function removeValueWithId<T extends { id: string }>(array: T[], id: string): [number, T, T[]] {
	const index = array.findIndex((i) => i.id === id);
	if (index === -1) {
		throw new Error(`Value not found ${id}`);
	}
	const value = array[index];
	return [index, value, array.toSpliced(index, 1)];
}

const FriendsStateKey = Symbol('FriendsState');

export function setFriendsState(currentUserId: string) {
	return setContext(FriendsStateKey, new FriendsState(currentUserId));
}

export function getFriendsState() {
	return getContext<ReturnType<typeof setFriendsState>>(FriendsStateKey);
}
