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
	const iconSize = 32;

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
		class="rounded-xl transition-all"
		class:pressed={iconPress === 'home'}
		onclick={() => handleIconPress('home')}
	>
		<div
			class="flex h-full w-full border-b-4 border-white px-4 py-2 dark:border-dark"
			class:selected={page.url.pathname === '/my/board'}
		>
			<Icon icon="home" size={iconSize} fill="none" />
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
			class="flex h-full w-full border-b-4 border-white px-4 py-2 dark:border-dark"
			class:selected={page.url.pathname === '/my/friends'}
		>
			<Icon icon="users" size={iconSize} fill="none" />
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
		@apply border-b-4 border-b-primary dark:border-white;
	}
</style>
