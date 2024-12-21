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

	const variantClass = {
		primary: 'bg-primary hover:bg-primary/90 text-white',
		ghost: 'dark:hover:bg-slate-800 dark:hover:ring-2 dark:hover:ring-primary'
	};

	const roundedClass = rounded ? 'rounded-full' : 'rounded-xl';
</script>

<button
	{type}
	class="{variantClass[variant]} {roundedClass} 
	flex
	min-h-11
	min-w-[44px]
	items-center
	justify-center
	gap-2
	px-4 py-2
	transition-all
	duration-300
	hover:scale-105
	focus:outline-none
	{className}"
	{onclick}
	aria-label={label}
>
	{@render children()}
</button>
