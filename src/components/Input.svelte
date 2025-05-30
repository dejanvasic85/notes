<script lang="ts">
	import type { ChangeEventHandler, HTMLInputTypeAttribute } from 'svelte/elements';

	type Props = {
		id: string;
		name: string;
		value?: unknown;
		invalid?: boolean;
		paddingRight?: 'lg';
		placeholder?: string;
		size?: 'sm' | 'md' | 'lg';
		type?: HTMLInputTypeAttribute;
		onchange?: ChangeEventHandler<HTMLInputElement> | undefined | null;
	};

	let {
		id,
		name,
		value = $bindable(),
		invalid,
		paddingRight,
		placeholder,
		size = 'md',
		type = 'text',
		onchange
	}: Props = $props();
</script>

<input
	{id}
	{name}
	{type}
	{placeholder}
	bind:value
	class="dark:bg-dark w-full rounded-md border border-gray-300 bg-gray-50 p-2 text-gray-900 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:outline-hidden"
	class:ring-2={invalid}
	class:ring-red-500={invalid}
	class:h-10={size === 'sm'}
	class:h-12={size === 'md'}
	class:h-14={size === 'lg'}
	class:pr-24={paddingRight === 'lg'}
	{onchange}
/>
