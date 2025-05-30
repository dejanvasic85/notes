<script lang="ts">
	import type { Snippet } from 'svelte';
	import { createTooltip, melt } from '@melt-ui/svelte';

	import { type Variant, buildButtonClass } from '$lib/button';

	type Props = {
		children: Snippet<[]>;
		variant?: Variant;
		rounded?: boolean;
		type?: 'button' | 'submit' | 'reset';
		label?: string;
		loading?: boolean;
		disabled?: boolean;
		tooltip?: string;
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
		tooltip,
		onclick
	}: Props = $props();

	const buttonClass = $derived(buildButtonClass(variant, rounded, loading || disabled));

	const {
		elements: { trigger, content, arrow },
		states: { open }
	} = createTooltip({
		positioning: {
			placement: 'top'
		},
		openDelay: 0,
		closeDelay: 0,
		closeOnPointerDown: false,
		forceVisible: true
	});
</script>

<button
	{type}
	class={buttonClass}
	{onclick}
	aria-label={label}
	disabled={loading || disabled}
	use:melt={$trigger}
>
	{#if loading}
		<svg
			class="mr-3 -ml-1 h-5 w-5 animate-spin dark:text-white"
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

{#if $open && tooltip}
	<div use:melt={$content} class="z-toaster rounded-lg bg-black shadow-sm">
		<div use:melt={$arrow}></div>
		<p class="p-4 text-sm text-white">{tooltip}</p>
	</div>
{/if}
