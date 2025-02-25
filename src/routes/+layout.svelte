<script lang="ts">
	import './app.css';
	import Toaster from '$components/Toaster.svelte';
	import { setBoardState } from '$lib/state/boardState.svelte';
	import { setToastMessages } from '$lib/state/toastMessages.svelte';

	let { children } = $props();
	setBoardState();
	setToastMessages();
</script>

<Toaster />
{@render children()}
