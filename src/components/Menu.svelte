<script lang="ts">
	import { page } from '$app/state';
	import { House, CirclePlus, Users } from '@lucide/svelte';

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
	const activeStrokeWidth = 2.5;
	const inactiveStrokeWidth = 2;

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
	class="flex h-full grow items-center {layout === 'horizontal'
		? 'justify-evenly'
		: 'flex-col justify-center gap-8'}"
>
	<a
		href="/my/board"
		aria-label="My board"
		class="rounded-control transition-colors"
		class:pressed={iconPress === 'home'}
		onclick={() => handleIconPress('home')}
	>
		<div
			class="flex h-full w-full border-b-4 border-transparent px-4 py-2"
			class:selected={isSelected('home')}
		>
			<House
				size={iconSize}
				strokeWidth={isSelected('home') ? activeStrokeWidth : inactiveStrokeWidth}
			/>
		</div>
	</a>
	<Button onclick={oncreatenote} variant="primary" label="Create a new note">
		<CirclePlus size={iconSize} />
	</Button>
	<a
		href="/my/friends"
		aria-label="My friends"
		class="rounded-control transition-colors"
		class:pressed={iconPress === 'friends'}
		onclick={() => handleIconPress('friends')}
	>
		<div
			class="relative flex h-full w-full border-b-4 border-transparent px-4 py-2"
			class:selected={isSelected('friends')}
		>
			<Users
				size={iconSize}
				strokeWidth={isSelected('friends') ? activeStrokeWidth : inactiveStrokeWidth}
			/>
			{#if numberOfInvites > 0}
				<span
					class="bg-accent text-on-accent absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold"
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

	/*
	 * Was `var(--primary)`, which is not a token — the real name is
	 * `--color-accent` — so this silently fell back to currentColor and the
	 * active indicator was never the brand colour. It also set all four
	 * borders where the utility next to it only sets border-b.
	 *
	 * The dark override is gone too: the token already flips per theme.
	 */
	.selected {
		border-bottom-color: var(--color-accent);
	}
</style>
