<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet<[]>;
		href: string;
		variant: 'primary' | 'secondary' | 'tertiary' | 'ghost';
		className?: string;
	};

	const { children, href, variant = 'primary', className }: Props = $props();
	const variantClass =
		variant === 'ghost'
			? 'dark:hover:bg-slate-800 hover:ring-2'
			: `bg-${variant} hover:bg-${variant}/90 text-white border-none`;
</script>

<a
	{href}
	class="flex
	gap-2
	rounded-lg
	px-6 py-3
	transition-all
	duration-300
	md:text-lg {className} {variantClass}"
>
	{@render children()}
</a>
