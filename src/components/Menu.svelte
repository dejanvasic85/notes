<script lang="ts">
	import { page } from '$app/state';
	import { crossfade } from 'svelte/transition';
	import { House, CirclePlus, Users } from '@lucide/svelte';

	import Button from './Button.svelte';
	import { durationBaseMs, durationSlowMs, easeMove, reduceMotion } from '$lib/motion';
	import { getFriendsState } from '$lib/state/friendsState.svelte';
	import { playCue } from '$lib/sound';

	type Props = {
		oncreatenote: () => void;
		layout: 'horizontal' | 'vertical';
	};

	type MenuItem = 'home' | 'friends';

	const activeMarkKey = 'nav-active';

	// Press: scale to .94 via ease-press, same treatment as Button.svelte.
	const pressClasses =
		'rounded-control transition-transform duration-(--duration-fast) active:scale-[0.94] active:duration-(--duration-tap) ease-press';

	let { oncreatenote, layout }: Props = $props();

	// Same technique as the friends-page tab indicator: the filled mark slides
	// between Home and Friends instead of the border just snapping colour.
	// The per-call duration below is what actually takes effect; this default
	// only guards a call site that forgets to pass one.
	const [sendActiveMark, receiveActiveMark] = crossfade({
		duration: reduceMotion(durationBaseMs),
		easing: easeMove
	});
	let isCreatePressed = $state(false);
	const friendsState = getFriendsState();
	const numberOfInvites = $derived(friendsState.pendingReceivedInvites.length);
	const iconSize = 32;
	const activeStrokeWidth = 2.5;
	const inactiveStrokeWidth = 2;

	function handleNavClick() {
		playCue('press');

		if (navigator.vibrate) {
			navigator.vibrate(50);
		}
	}

	function handleCreateClick() {
		isCreatePressed = true;
		setTimeout(() => {
			isCreatePressed = false;
		}, reduceMotion(durationSlowMs));

		if (navigator.vibrate) {
			navigator.vibrate(50);
		}

		oncreatenote();
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
	<a href="/my/board" aria-label="My board" class={pressClasses} onclick={handleNavClick}>
		<div class="relative flex h-full w-full px-4 py-2">
			<House
				size={iconSize}
				strokeWidth={isSelected('home') ? activeStrokeWidth : inactiveStrokeWidth}
			/>
			{#if isSelected('home')}
				<div
					in:sendActiveMark={{ key: activeMarkKey, duration: reduceMotion(durationBaseMs) }}
					out:receiveActiveMark={{ key: activeMarkKey, duration: reduceMotion(durationBaseMs) }}
					class="bg-accent absolute bottom-0 left-1/2 h-1 w-10 -translate-x-1/2 rounded-full"
					aria-hidden="true"
				></div>
			{/if}
		</div>
	</a>
	<Button onclick={handleCreateClick} variant="primary" label="Create a new note">
		<CirclePlus
			size={iconSize}
			class="ease-press transition-transform duration-(--duration-slow) {isCreatePressed
				? 'rotate-90'
				: 'rotate-0'}"
		/>
	</Button>
	<a href="/my/friends" aria-label="My friends" class={pressClasses} onclick={handleNavClick}>
		<div class="relative flex h-full w-full px-4 py-2">
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
			{#if isSelected('friends')}
				<div
					in:sendActiveMark={{ key: activeMarkKey, duration: reduceMotion(durationBaseMs) }}
					out:receiveActiveMark={{ key: activeMarkKey, duration: reduceMotion(durationBaseMs) }}
					class="bg-accent absolute bottom-0 left-1/2 h-1 w-10 -translate-x-1/2 rounded-full"
					aria-hidden="true"
				></div>
			{/if}
		</div>
	</a>
</nav>
