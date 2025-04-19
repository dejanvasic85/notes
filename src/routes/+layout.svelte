<script lang="ts">
	import './app.css';
	import Toaster from '$components/Toaster.svelte';
	import { setBoardState } from '$lib/state/boardState.svelte';
	import { setToastMessages } from '$lib/state/toastMessages.svelte';
	import { setUserState } from '$lib/state/userState.svelte';

	let { children } = $props();

	setBoardState();
	setToastMessages();
	setUserState();
</script>

<Toaster />
{@render children()}
