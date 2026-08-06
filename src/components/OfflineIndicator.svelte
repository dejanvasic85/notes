<script lang="ts">
	import { fade } from 'svelte/transition';
	import { CloudAlert, RefreshCw, WifiOff } from '@lucide/svelte';

	import { getConnectivityState } from '$lib/state/connectivityState.svelte';
	import { durationFastMs, reduceMotion } from '$lib/motion';
	import { getToastMessages } from '$lib/state/toastMessages.svelte';
	import { drainState, pausedNoteIds } from '$lib/state/writeQueue.svelte';

	type Props = {
		onretry: () => void;
	};

	const iconSize = 20;
	const offlineLabel = "You're offline. Changes will sync once you're back online.";
	const syncingLabel = 'Syncing your changes.';
	const syncFailedLabel = "Some changes couldn't be synced.";
	const retryActionLabel = 'Retry';

	let { onretry }: Props = $props();

	const connectivityState = getConnectivityState();
	const toastMessages = getToastMessages();

	let hasPausedNotes = $derived(pausedNoteIds.size > 0);
	// Not $state - shouldn't retrigger the effect below.
	let offered = false;

	$effect(() => {
		if (!hasPausedNotes) {
			offered = false;
			return;
		}
		if (offered) {
			return;
		}

		offered = true;
		toastMessages.addActionMessage(
			syncFailedLabel,
			{ label: retryActionLabel, onClick: onretry },
			() => {
				offered = false;
			}
		);
	});
</script>

<!--
	The role="status" region stays mounted whether online or offline so a
	screen reader has already registered it before the content inside changes
	- toggling the whole element in and out of the DOM does not reliably
	announce the update.
-->
<div role="status">
	{#if connectivityState.isOffline}
		<span class="sr-only">{offlineLabel}</span>
		<span transition:fade={{ duration: reduceMotion(durationFastMs) }}>
			<WifiOff size={iconSize} aria-hidden="true" class="text-warning" />
		</span>
	{:else if drainState.isDraining}
		<span class="sr-only">{syncingLabel}</span>
		<span transition:fade={{ duration: reduceMotion(durationFastMs) }}>
			<RefreshCw size={iconSize} aria-hidden="true" class="text-ink-muted animate-spin" />
		</span>
	{:else if hasPausedNotes}
		<span class="sr-only">{syncFailedLabel}</span>
		<span transition:fade={{ duration: reduceMotion(durationFastMs) }}>
			<CloudAlert size={iconSize} aria-hidden="true" class="text-danger" />
		</span>
	{/if}
</div>
