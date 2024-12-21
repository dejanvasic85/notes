<script lang="ts">
	import type { Snippet } from 'svelte';

	type Variant = 'primary' | 'ghost';

	type Props = {
		children: Snippet<[]>;
		variant?: Variant;
		rounded?: boolean;
		className?: string;
		type?: 'button' | 'submit' | 'reset';
		label?: string;
		onclick?: () => void;
	};

	const {
		children,
		variant = 'primary',
		rounded,
		className,
		type = 'button',
		label = '',
		onclick
	}: Props = $props();

	const variantClass =
		variant === 'ghost'
			? 'dark:hover:bg-slate-800 hover:ring-2'
			: `bg-${variant} hover:bg-${variant}/90 text-white border-none`;

	const roundedClass = rounded ? 'rounded-full' : 'rounded-xl';
</script>

<button
	{type}
	class="{roundedClass} 
	flex
	min-h-11
	min-w-[44px]
	items-center
	justify-center
	gap-2
	px-4 py-2
	transition-all
	duration-150
	hover:scale-105
	focus:outline-none
	{className}
	{variantClass}"
	{onclick}
	aria-label={label}
>
	{@render children()}
</button>
