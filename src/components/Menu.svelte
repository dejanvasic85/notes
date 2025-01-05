<script lang="ts">
	import Icon from './Icon.svelte';
	import Button from './Button.svelte';
	import { page } from '$app/state';

	type Props = {
		oncreatenote: () => void;
		layout: 'horizontal' | 'vertical';
	};

	let { oncreatenote, layout }: Props = $props();
	let iconPress = $state<null | 'home' | 'friends'>(null);
	const iconSize = layout === 'horizontal' ? 36 : 32;

	function handleIconPress(name: 'home' | 'friends') {
		iconPress = name;
		setTimeout(() => {
			iconPress = null;
		}, 300);
	}
</script>

<nav
	class="flex h-full flex-grow items-center justify-center gap-6 {layout === 'horizontal'
		? 'justify-around'
		: 'flex-col justify-center'}"
>
	<a
		href="/my/board"
		aria-label="My board"
		class="rounded-xl px-4 py-2 transition-all hover:dark:bg-darkHover"
		class:pressed={iconPress === 'home'}
		onclick={() => handleIconPress('home')}
	>
		<Icon
			icon="home"
			size={iconSize}
			fill={page.url.pathname === '/my/board' ? 'currentColor' : 'none'}
		/>
	</a>
	<Button onclick={oncreatenote} variant="primary">
		<Icon icon="plus-circle" size={iconSize} fill="none" />
	</Button>
	<a
		href="/my/friends"
		aria-label="My friends"
		class="rounded-xl px-4 py-2 hover:dark:bg-darkHover"
		class:pressed={iconPress === 'friends'}
		onclick={() => handleIconPress('friends')}
	>
		<Icon
			icon="users"
			size={iconSize}
			fill={page.url.pathname === '/my/friends' ? 'currentColor' : 'none'}
		/>
	</a>
</nav>

<style>
	@keyframes shrink {
		0% {
			transform: scale(1);
		}
		50% {
			transform: scale(0.8); /* Adjust the scale value to control how small the icon gets */
		}
		100% {
			transform: scale(1);
		}
	}

	.pressed {
		animation: shrink 0.3s ease; /* Adjust duration and easing to your preference */
	}
</style>
