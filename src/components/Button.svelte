<script lang="ts">
	import type { Snippet } from 'svelte';

	import { type Variant, buildButtonClass } from '$lib/button';

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

	const buttonClass = buildButtonClass(variant, rounded);
</script>

<button {type} class="{buttonClass} {className}" {onclick} aria-label={label}>
	{@render children()}
</button>
