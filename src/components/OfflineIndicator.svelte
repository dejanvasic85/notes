<script lang="ts">
	import { fade } from 'svelte/transition';
	import { WifiOff } from '@lucide/svelte';

	import { getConnectivityState } from '$lib/state/connectivityState.svelte';
	import { durationFastMs, reduceMotion } from '$lib/motion';

	const iconSize = 20;
	const offlineLabel = "You're offline. Changes will sync once you're back online.";

	const connectivityState = getConnectivityState();
</script>

<!--
	The role="status" region stays mounted whether online or offline so a
	screen reader has already registered it before the content inside changes
	- toggling the whole element in and out of the DOM does not reliably
	announce the update.
-->
<div role="status">
	{#if connectivityState.isOffline}
		<span aria-label={offlineLabel} transition:fade={{ duration: reduceMotion(durationFastMs) }}>
			<WifiOff size={iconSize} aria-hidden="true" class="text-warning" />
		</span>
	{/if}
</div>
