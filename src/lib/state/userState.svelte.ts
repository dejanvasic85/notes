import { getContext, setContext } from 'svelte';

export class UserState {
	name: string = $state('');

	constructor() {}

	setName(name: string) {
		this.name = name;
	}
}

const UserStateKey = Symbol('UserState');

export function setUserState() {
	return setContext(UserStateKey, new UserState());
}

export function getUserState() {
	return getContext<ReturnType<typeof setUserState>>(UserStateKey);
}
