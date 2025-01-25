<script lang="ts">
	import './app.css';
	import Toaster from '$components/Toaster.svelte';
	import { setBoardState } from '$lib/state/boardState.svelte';
	import { setToastMessages } from '$lib/state/toastMessages.svelte';
	import { setFetchState } from '$lib/state/fetchState.svelte';

	let { children } = $props();
	setBoardState();
	setToastMessages();
	setFetchState();
</script>

<Toaster />
{@render children()}
