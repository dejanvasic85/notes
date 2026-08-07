<script lang="ts">
	import { scale } from 'svelte/transition';
	import { Check } from '@lucide/svelte';

	import { durationFastMs, easeEnter, easeExit, reduceMotion } from '$lib/motion';

	type Props = {
		justSaved: boolean;
	};

	const iconSize = 12;
	const savedLabel = 'Saved';
	const popStart = 0.85;

	let { justSaved }: Props = $props();
</script>

<div role="status" class="flex h-11 items-center">
	{#if justSaved}
		<!-- Same chip convention as the board card's "Shared" chip - text-label,
		     rounded-chip - just tinted success instead of neutral. -->
		<span
			class="text-label bg-success-soft text-success rounded-chip flex items-center gap-1 px-2 py-0.5"
			in:scale={{ start: popStart, duration: reduceMotion(durationFastMs), easing: easeEnter }}
			out:scale={{ start: popStart, duration: reduceMotion(durationFastMs), easing: easeExit }}
		>
			<Check size={iconSize} aria-hidden="true" />
			{savedLabel}
		</span>
	{/if}
</div>
