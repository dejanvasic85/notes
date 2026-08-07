<script lang="ts">
	import { scale } from 'svelte/transition';
	import { Check } from '@lucide/svelte';

	import { durationFastMs, easeEnter, easeExit, reduceMotion } from '$lib/motion';

	type Props = {
		justSaved: boolean;
	};

	const iconSize = 20;
	const savedLabel = 'Saved';
	const popStart = 0.6;

	let { justSaved }: Props = $props();
</script>

<!-- Fixed size so its appearance/disappearance never shifts the toolbar pill's
     footprint. -->
<div role="status" class="flex size-5 items-center justify-center">
	{#if justSaved}
		<span class="sr-only">{savedLabel}</span>
		<span
			in:scale={{ start: popStart, duration: reduceMotion(durationFastMs), easing: easeEnter }}
			out:scale={{ start: popStart, duration: reduceMotion(durationFastMs), easing: easeExit }}
		>
			<Check size={iconSize} aria-hidden="true" class="text-success" />
		</span>
	{/if}
</div>
