<script lang="ts">
	import './app.css';
	import { setDialogState } from '$lib/state/dialogState.svelte';
	import { setState } from '$lib/state/boardState.svelte';

	let { children } = $props();
	setDialogState();
	setState();
</script>

{@render children()}
