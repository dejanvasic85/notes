<script lang="ts">
	import { fade } from 'svelte/transition';
	import { Check } from '@lucide/svelte';

	import { durationFastMs, easeMove, reduceMotion } from '$lib/motion';

	type Props = {
		justSaved: boolean;
	};

	const iconSize = 20;
	const savedLabel = 'Saved';

	let { justSaved }: Props = $props();
</script>

<!-- Fixed size so its appearance/disappearance never shifts the footer height
     Dialog.svelte measures for the floating toolbar offset. -->
<div role="status" class="flex size-5 items-center justify-center">
	{#if justSaved}
		<span class="sr-only">{savedLabel}</span>
		<span
			in:fade={{ duration: reduceMotion(durationFastMs), easing: easeMove }}
			out:fade={{ duration: reduceMotion(durationFastMs), easing: easeMove }}
		>
			<Check size={iconSize} aria-hidden="true" class="text-success" />
		</span>
	{/if}
</div>
