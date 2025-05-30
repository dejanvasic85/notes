<script lang="ts">
	import { page } from '$app/state';

	import Icon from './Icon.svelte';
	import Button from './Button.svelte';
	import { getFriendsState } from '$lib/state/friendsState.svelte';

	type Props = {
		oncreatenote: () => void;
		layout: 'horizontal' | 'vertical';
	};

	type MenuItem = 'home' | 'friends';

	let { oncreatenote, layout }: Props = $props();
	let iconPress = $state<null | MenuItem>(null);
	const friendsState = getFriendsState();
	const numberOfInvites = $derived(friendsState.pendingReceivedInvites.length);
	const iconSize = 32;

	function handleIconPress(name: MenuItem) {
		iconPress = name;
		setTimeout(() => {
			iconPress = null;
		}, 300);

		if (navigator.vibrate) {
			navigator.vibrate(50);
		}
	}

	function isSelected(path: MenuItem) {
		switch (path) {
			case 'home':
				return page.url.pathname === '/my/board';
			case 'friends':
				return page.url.pathname === '/my/friends';
		}
	}
</script>

<nav
	class="flex h-full grow items-center justify-center gap-6 {layout === 'horizontal'
		? 'justify-around'
		: 'flex-col justify-center'}"
>
	<a
		href="/my/board"
		aria-label="My board"
		class="rounded-xl transition-all"
		class:pressed={iconPress === 'home'}
		onclick={() => handleIconPress('home')}
	>
		<div
			class="dark:border-dark flex h-full w-full border-b-4 border-white px-4 py-2"
			class:selected={isSelected('home')}
		>
			<Icon icon="home" size={iconSize} fill={isSelected('home') ? 'currentColor' : 'none'} />
		</div>
	</a>
	<Button onclick={oncreatenote} variant="primary">
		<Icon icon="plus-circle" size={iconSize} fill="none" />
	</Button>
	<a
		href="/my/friends"
		aria-label="My friends"
		class="rounded-xl transition-all"
		class:pressed={iconPress === 'friends'}
		onclick={() => handleIconPress('friends')}
	>
		<div
			class="dark:border-dark relative flex h-full w-full border-b-4 border-white px-4 py-2"
			class:selected={isSelected('friends')}
		>
			<Icon icon="users" size={iconSize} fill={isSelected('friends') ? 'currentColor' : 'none'} />
			{#if numberOfInvites > 0}
				<span
					class="bg-primary absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white"
					aria-label="You have pending invites"
				>
					{numberOfInvites}
				</span>
			{/if}
		</div>
	</a>
</nav>

<style>
	@keyframes shrink {
		0% {
			transform: scale(1);
		}
		50% {
			transform: scale(0.8);
		}
		100% {
			transform: scale(1);
		}
	}

	.pressed {
		animation: shrink 0.3s ease;
	}

	.selected {
		border: 4px solid var(--primary);
	}

	@media (prefers-color-scheme: dark) {
		.selected {
			border-bottom: 4px solid currentColor;
		}
	}
</style>
