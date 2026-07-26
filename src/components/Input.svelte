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
	class="border-line bg-paper text-ink placeholder:text-ink-faint rounded-control w-full border p-2"
	class:ring-2={invalid}
	class:ring-danger={invalid}
	class:h-10={size === 'sm'}
	class:h-12={size === 'md'}
	class:h-14={size === 'lg'}
	class:pr-24={paddingRight === 'lg'}
	{onchange}
/>
