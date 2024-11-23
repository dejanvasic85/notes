<script lang="ts">
	import Icon from './Icon.svelte';
	type Props = {
		onAddNote: () => void;
	};

	let { onAddNote }: Props = $props();
</script>

<div class="fixed inset-auto z-50 h-16 bg-white dark:bg-dark">
	<div class="flex h-full flex-grow items-center justify-around">
		<a href="/my/board" aria-label="My board">
			<Icon icon="home" size={40} fill="none" />
		</a>
		<button onclick={onAddNote}>
			<Icon icon="plus-circle" size={40} fill="none" />
		</button>
	</div>
</div>

<style>
	.inset-auto {
		inset: auto 0 0;
	}
</style>
