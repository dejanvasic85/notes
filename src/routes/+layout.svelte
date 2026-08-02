<script lang="ts">
	import './app.css';
	import { Tooltip } from 'bits-ui';
	import AppUpdatePrompt from '$components/AppUpdatePrompt.svelte';
	import InstallPrompt from '$components/InstallPrompt.svelte';
	import Toaster from '$components/Toaster.svelte';
	import { setBoardState } from '$lib/state/boardState.svelte';
	import { setInstallState } from '$lib/state/installState.svelte';
	import { setToastMessages } from '$lib/state/toastMessages.svelte';
	import { setUserState } from '$lib/state/userState.svelte';

	let { children } = $props();

	setBoardState();
	setInstallState();
	setToastMessages();
	setUserState();
</script>

<Tooltip.Provider>
	<Toaster />
	<AppUpdatePrompt />
	<InstallPrompt />
	{@render children()}
</Tooltip.Provider>
