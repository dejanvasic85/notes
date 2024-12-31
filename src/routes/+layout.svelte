<script lang="ts">
	import './app.css';
	import { setDialogState } from '$lib/state/dialogState.svelte';
	import { setCreatingState } from '$lib/state/createState.svelte';

	let { children } = $props();
	setDialogState();
	setCreatingState();
</script>

{@render children()}
