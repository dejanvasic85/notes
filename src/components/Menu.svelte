<script lang="ts">
	import Icon from './Icon.svelte';
	import Button from './Button.svelte';
	import { page } from '$app/stores';

	type Props = {
		onAddNote: () => void;
		layout: 'horizontal' | 'vertical';
	};

	let { onAddNote, layout }: Props = $props();
	const iconSize = layout === 'horizontal' ? 36 : 32;
</script>

<nav
	class="flex h-full flex-grow items-center justify-center gap-6 {layout === 'horizontal'
		? 'justify-around'
		: 'flex-col justify-center'}"
>
	<a href="/my/board" aria-label="My board" class="rounded-xl px-4 py-2 hover:dark:bg-darkHover">
		<Icon
			icon="home"
			size={iconSize}
			fill={$page.url.pathname === '/my/board' ? 'currentColor' : 'none'}
		/>
	</a>
	<Button on:click={onAddNote} variant="primary">
		<Icon icon="plus-circle" size={iconSize} fill="none" />
	</Button>
	<a
		href="/my/friends"
		aria-label="My friends"
		class="rounded-xl px-4 py-2 hover:dark:bg-darkHover"
	>
		<Icon
			icon="users"
			size={iconSize}
			fill={$page.url.pathname === '/my/friends' ? 'currentColor' : 'none'}
		/>
	</a>
</nav>
