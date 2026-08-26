<script lang="ts">
	import { page } from '$app/state';

	import InstallInstructions from './InstallInstructions.svelte';
	import { getInstallState } from '$lib/state/installState.svelte';
	import { getToastMessages } from '$lib/state/toastMessages.svelte';

	const promptMessage = 'Install My Notes for offline access and a faster start.';
	const promptActionLabel = 'Install';
	const boardPathPrefix = '/my';

	const installState = getInstallState();
	const toastMessages = getToastMessages();

	let showInstructions = $state(false);
	let offered = false;

	/*
	 * Only volunteered to someone already using the app — offering to install a
	 * notes app on the marketing page, before they have any notes, is noise. The
	 * profile menu carries the same action for everywhere else.
	 */
	const shouldOffer = $derived(
		installState.shouldOfferPrompt && page.url.pathname.startsWith(boardPathPrefix)
	);

	function handleInstall() {
		installState.dismissPrompt();

		if (installState.needsManualSteps) {
			showInstructions = true;
			return;
		}

		installState.promptInstall();
	}

	$effect(() => {
		if (!shouldOffer || offered) {
			return;
		}

		offered = true;
		toastMessages.addActionMessage(
			promptMessage,
			{ label: promptActionLabel, onClick: handleInstall },
			() => installState.dismissPrompt(),
			undefined,
			'ping'
		);
	});
</script>

<InstallInstructions bind:show={showInstructions} />
