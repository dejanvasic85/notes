<script lang="ts">
	import Icon from './Icon.svelte';
	import Button from './Button.svelte';
	import { page } from '$app/stores';

	type Props = {
		onAddNote: () => void;
	};

	let { onAddNote }: Props = $props();
</script>

<div class="fixed inset-auto z-50 h-16 border-t-2 bg-white dark:bg-dark">
	<div class="flex h-full flex-grow items-center justify-around">
		<a href="/my/board" aria-label="My board" class="rounded px-4 py-2 hover:dark:bg-darkHover">
			<Icon
				icon="home"
				size={40}
				fill={$page.url.pathname === '/my/board' ? 'currentColor' : 'none'}
			/>
		</a>
		<Button on:click={onAddNote} variant="primary">
			<Icon icon="plus-circle" size={40} fill="none" />
		</Button>
		<a href="/my/friends" aria-label="My friends" class="rounded px-4 py-2 hover:dark:bg-darkHover">
			<Icon
				icon="users"
				size={40}
				fill={$page.url.pathname === '/my/friends' ? 'currentColor' : 'none'}
			/>
		</a>
	</div>
</div>

<style>
	.inset-auto {
		inset: auto 0 0;
	}
</style>
