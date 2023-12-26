<script lang="ts">
	import { onMount } from 'svelte';
	import type { HTMLInputTypeAttribute } from 'svelte/elements';

	export let type: HTMLInputTypeAttribute = 'text';
	export let value: any = undefined;
	export let focusOnMount = false;

	let inputElement: HTMLInputElement;

	onMount(() => {
		if (focusOnMount) {
			inputElement.focus();
		}
	});
</script>

<input
	{...$$restProps}
	{...{ type }}
	bind:value
	bind:this={inputElement}
	on:change
	class="rounded-md border border-gray-300 bg-gray-50 p-2 text-gray-900 dark:border-gray-600 dark:bg-slate-800 dark:text-white dark:placeholder-gray-400"
/>
