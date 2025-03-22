<script lang="ts">
	import type { ChangeEventHandler, HTMLInputTypeAttribute } from 'svelte/elements';

	type Props = {
		id: string;
		name: string;
		value?: unknown;
		invalid?: boolean;
		type?: HTMLInputTypeAttribute;
		onchange?: ChangeEventHandler<HTMLInputElement> | undefined | null;
	};

	let { id, name, value = $bindable(), invalid, type = 'text', onchange }: Props = $props();
</script>

<input
	{id}
	{name}
	{type}
	bind:value
	class=" w-full rounded-md border border-gray-300 bg-gray-50 p-2 pr-24 text-gray-900 dark:border-gray-600 dark:bg-darkHover dark:text-white dark:placeholder-gray-400"
	class:ring-2={invalid}
	class:ring-red-500={invalid}
	{onchange}
/>
