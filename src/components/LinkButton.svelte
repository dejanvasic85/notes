<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet<[]>;
		href: string;
		variant: 'primary' | 'secondary' | 'tertiary';
		className?: string;
	};

	let { children, href, variant, className }: Props = $props();
</script>

<a
	{href}
	class="flex
	gap-2
	rounded-lg
	border-none
	bg-{variant}
	hover:bg-{variant}/90
	px-6 py-3
	text-white
	transition-all
	duration-300
	md:text-lg {className}"
>
	{@render children()}
</a>
