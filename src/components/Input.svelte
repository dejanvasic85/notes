<script lang="ts">
	import type { ChangeEventHandler, HTMLInputTypeAttribute } from 'svelte/elements';

	type Props = {
		id: string;
		name: string;
		value?: unknown;
		invalid?: boolean;
		size?: 'sm' | 'md' | 'lg';
		type?: HTMLInputTypeAttribute;
		onchange?: ChangeEventHandler<HTMLInputElement> | undefined | null;
	};

	let {
		id,
		name,
		value = $bindable(),
		invalid,
		size = 'md',
		type = 'text',
		onchange
	}: Props = $props();
</script>

<input
	{id}
	{name}
	{type}
	bind:value
	class="w-full rounded-md border border-gray-300 bg-gray-50 p-2 pr-24 text-gray-900 dark:border-gray-600 dark:bg-darkHover dark:text-white dark:placeholder-gray-400"
	class:ring-2={invalid}
	class:ring-red-500={invalid}
	class:h-10={size === 'sm'}
	class:h-12={size === 'md'}
	class:h-14={size === 'lg'}
	{onchange}
/>
