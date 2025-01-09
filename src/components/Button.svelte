<script lang="ts">
	import type { Snippet } from 'svelte';

	import { type Variant, buildButtonClass } from '$lib/button';

	type Props = {
		children: Snippet<[]>;
		variant?: Variant;
		rounded?: boolean;
		type?: 'button' | 'submit' | 'reset';
		label?: string;
		loading?: boolean;
		disabled?: boolean;
		onclick?: () => void;
	};

	const {
		children,
		variant = 'primary',
		rounded,
		type,
		label = '',
		loading = false,
		disabled = false,
		onclick
	}: Props = $props();

	const buttonClass = $derived(buildButtonClass(variant, rounded, loading || disabled));
</script>

<button {type} class={buttonClass} {onclick} aria-label={label} disabled={loading || disabled}>
	{#if loading}
		<svg
			class="-ml-1 mr-3 h-5 w-5 animate-spin dark:text-white"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
		>
			<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
			></circle>
			<path
				class="opacity-75"
				fill="currentColor"
				d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
			></path>
		</svg>
	{/if}
	{@render children()}
</button>
