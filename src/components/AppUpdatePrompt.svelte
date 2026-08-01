<script lang="ts">
	import { onMount } from 'svelte';
	import { dev } from '$app/environment';
	import { afterNavigate } from '$app/navigation';

	import { applyAppUpdate, checkForAppUpdate, watchForAppUpdate } from '$lib/appUpdate';
	import { getToastMessages } from '$lib/state/toastMessages.svelte';

	const updateMessage = 'A new version of My Notes is available.';
	const updateActionLabel = 'Reload';

	const toastMessages = getToastMessages();

	// A single waiting worker can announce itself more than once — on the initial
	// check and again through `updatefound` — and one prompt is enough.
	let prompted = false;

	function handleUpdateReady() {
		if (prompted) {
			return;
		}
		prompted = true;

		toastMessages.addActionMessage(updateMessage, {
			label: updateActionLabel,
			onClick: () => {
				applyAppUpdate();
			}
		});
	}

	/*
	 * Skipped in development, where the worker is rebuilt on every server start
	 * and would announce a new version constantly. Offline support does not work
	 * in dev either — `build` from $service-worker is empty — so there is nothing
	 * here worth exercising against the dev server.
	 */
	onMount(() => (dev ? undefined : watchForAppUpdate(handleUpdateReady)));

	afterNavigate(() => {
		if (!dev) {
			checkForAppUpdate();
		}
	});
</script>
