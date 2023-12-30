<script lang="ts">
	import { onMount } from 'svelte';
	import type { HTMLInputTypeAttribute } from 'svelte/elements';

	import { twMerge } from 'tailwind-merge';

	// Props
	export let focusOnMount = false;
	export let type: HTMLInputTypeAttribute = 'text';
	export let value: any = undefined;

	let inputElement: HTMLInputElement;

	onMount(() => {
		if (focusOnMount) {
			inputElement.focus();
		}
	});

	const defaultClass =
		'rounded-md border border-gray-300 bg-gray-50 p-2 text-gray-900 dark:border-gray-600 dark:bg-slate-800 dark:text-white dark:placeholder-gray-400';
	$: inputClass = twMerge(defaultClass, $$restProps.class);
</script>

<input
	{...$$restProps}
	{...{ type }}
	bind:value
	bind:this={inputElement}
	on:change
	class={inputClass}
/>
