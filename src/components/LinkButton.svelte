<script lang="ts">
	import type { Snippet } from 'svelte';

	import { type Variant, buildButtonClass } from '$lib/button';

	type Props = {
		children: Snippet<[]>;
		href: string;
		variant: Variant;
	};

	const { children, href, variant = 'primary' }: Props = $props();
	const buttonClass = buildButtonClass(variant, false);
</script>

<a {href} class={buttonClass}>
	{@render children()}
</a>
